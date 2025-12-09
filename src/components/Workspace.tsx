"use client";

import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Editor } from './Editor';
import { Button } from './ui/button';
import { Play, RotateCcw, Terminal, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TerminalPanel, TerminalRef } from './TerminalPanel';
import { usePyodide } from '@/hooks/usePyodide';
import { useCheerpj } from '@/hooks/useCheerpj';
import { getTestCode } from '@/app/actions';
import { useChat } from '@ai-sdk/react';
import confetti from 'canvas-confetti';

interface WorkspaceProps {
  initialCode: string;
  instructions: string;
  language: 'python' | 'java';
  lessonName: string;
  courseId?: string; // e.g., 'python-intro'
  lessonId?: string; // e.g., '01-variables'
}

export const Workspace: React.FC<WorkspaceProps> = ({
  initialCode,
  instructions,
  language,
  lessonName,
  courseId = 'python-intro', // Defaults for now
  lessonId = '01-variables'
}) => {
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const terminalRef = useRef<TerminalRef>(null);
  
  const { pyodide, isLoading: isPyodideLoading } = usePyodide();
  const { isLoaded: isCheerpjLoaded } = useCheerpj();

  // AI Chat Hook
  const { messages, append, isLoading: isAiLoading, setMessages } = useChat({
    api: '/api/chat',
  }) as any; // Temporary cast to bypass type error while ensuring runtime works

  const handleRun = async () => {
    setIsRunning(true);
    setShowTutor(false);
    terminalRef.current?.clear();
    terminalRef.current?.writeln('\x1b[33mRunning tests...\x1b[0m');

    let exitCode = 0;
    let errorOutput = '';

    if (language === 'python') {
        if (!pyodide) {
            terminalRef.current?.writeln('\x1b[31mError: Python runtime not loaded yet. Please wait.\x1b[0m');
            setIsRunning(false);
            return;
        }

        try {
            // 1. Fetch Hidden Tests
            const testCode = await getTestCode(courseId, lessonId, 'python');
            
            // 2. Setup Virtual FS
            // Write user code to main.py
            pyodide.FS.writeFile("main.py", code);
            // Write test code to test_main.py (if exists, otherwise just run main)
            if (testCode) {
                 pyodide.FS.writeFile("test_main.py", testCode);
            }

            // 3. Execution Wrapper
            // We want to capture stdout/stderr specifically for the run
            const outputHandler = (msg: string) => {
                terminalRef.current?.writeln(msg);
            };

            pyodide.setStdout({ batched: outputHandler });
            pyodide.setStderr({ batched: (msg) => {
                errorOutput += msg + "\n";
                terminalRef.current?.writeln(`\x1b[31m${msg}\x1b[0m`);
            }});
            
            // 4. Run Pytest
            // If test code exists, run pytest. Else run python main.py
            if (testCode) {
                terminalRef.current?.writeln('\x1b[34m> Executing pytest...\x1b[0m');
                // We use a small wrapper to run pytest and capture the result code
                const pytestRunner = `
import pytest
import sys
# Redirect stdout/stderr is handled by pyodide.setStdout/Stderr
exit_code = pytest.main(["test_main.py", "-v"])
exit_code
`;
               exitCode = await pyodide.runPythonAsync(pytestRunner);
            } else {
               terminalRef.current?.writeln('\x1b[34m> Executing main.py (No tests found)...[0m');
               await pyodide.runPythonAsync("import main");
            }

            if (exitCode === 0) {
                terminalRef.current?.writeln('\n\x1b[32m✅ Tests Passed! Great job.\x1b[0m');
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                
                // Save progress
                const completedKey = `completed-${courseId}-${lessonId}`;
                localStorage.setItem(completedKey, 'true');
                terminalRef.current?.writeln('\x1b[32m💾 Progress saved.\x1b[0m');
            } else {
                terminalRef.current?.writeln('\n\x1b[31m❌ Tests Failed.\x1b[0m');
                
                // Trigger AI Tutor
                setShowTutor(true);
                setMessages([]); // Clear previous chat
                await append({
                    role: 'user',
                    content: "My tests failed. Please explain why.",
                }, {
                    body: {
                        context: {
                            language: 'python',
                            code: code,
                            testCode: testCode || "N/A",
                            error: errorOutput || "Test assertion failed"
                        }
                    }
                });
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            terminalRef.current?.writeln(`\n\x1b[31mRuntime Error: ${errorMessage}\x1b[0m`);
            exitCode = 1;
        } finally {
            setIsRunning(false);
            terminalRef.current?.write('$ ');
        }
        return;
    }
    
    // Java Implementation
    if (language === 'java') {
         if (!isCheerpjLoaded) {
            terminalRef.current?.writeln('\x1b[31mError: Java runtime not loaded yet.\x1b[0m');
            setIsRunning(false);
            return;
         }

         try {
             const testCode = await getTestCode(courseId, lessonId, 'java');
             
             // Intercept Console for CheerpJ Output
             // CheerpJ prints to console.log/console.error by default
             const originalLog = console.log;
             const originalErr = console.error;
             
             // We'll create a stream-like handler
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             console.log = (msg: any, ...args: any[]) => {
                 const line = [msg, ...args].join(' ');
                 // Filter out some internal CheerpJ noise if needed
                 if (typeof line === 'string' && !line.startsWith('cheerpj')) {
                    terminalRef.current?.writeln(line);
                 }
                 // originalLog(msg, ...args); // Optional: keep browser console working
             };
             
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             console.error = (msg: any, ...args: any[]) => {
                 const line = [msg, ...args].join(' ');
                 errorOutput += line + "\n";
                 terminalRef.current?.writeln(`\x1b[31m${line}\x1b[0m`);
                 // originalErr(msg, ...args);
             };

             try {
                // 1. Write Files to Virtual FS
                terminalRef.current?.writeln('\x1b[33m> Preparing filesystem...\x1b[0m');
                // Ensure /files/ exists (created automatically by javac usually, but good to know)
                await window.cheerpOSAddStringFile("/str/Main.java", code);
                if (testCode) {
                    await window.cheerpOSAddStringFile("/str/TestMain.java", testCode);
                }

                // 2. Compile (javac)
                terminalRef.current?.writeln('\x1b[33m> Compiling Java code...\x1b[0m');
                // Classpath must include JUnit for the test file to compile
                const compileExitCode = await window.cheerpjRunMain(
                    "com.sun.tools.javac.Main", 
                    "/app/junit.jar", // Classpath for compilation
                    "-d", "/files/", 
                    "/str/Main.java", 
                    testCode ? "/str/TestMain.java" : ""
                );

                if (compileExitCode !== 0) {
                    throw new Error("Compilation failed. Check output for syntax errors.");
                }
                
                // 3. Run Tests (JUnit) or Main
                if (testCode) {
                    terminalRef.current?.writeln('\x1b[33m> Running JUnit tests...\x1b[0m');
                    exitCode = await window.cheerpjRunMain(
                        "org.junit.platform.console.ConsoleLauncher",
                        "/files/:/app/junit.jar", // Classpath for execution
                        "--scan-classpath",
                        "--details=tree" 
                    );
                } else {
                    terminalRef.current?.writeln('\x1b[33m> Running Main class...\x1b[0m');
                    exitCode = await window.cheerpjRunMain(
                        "Main",
                        "/files/",
                        ""
                    );
                }

             } finally {
                 // Restore console
                 console.log = originalLog;
                 console.error = originalErr;
             }

             if (exitCode === 0) {
                terminalRef.current?.writeln('\n\x1b[32m✅ Tests Passed! Great job.\x1b[0m');
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                const completedKey = `completed-${courseId}-${lessonId}`;
                localStorage.setItem(completedKey, 'true');
                terminalRef.current?.writeln('\x1b[32m💾 Progress saved.\x1b[0m');
             } else {
                terminalRef.current?.writeln('\n\x1b[31m❌ Tests Failed.\x1b[0m');
                 // Trigger AI Tutor
                setShowTutor(true);
                setMessages([]); 
                await append({
                    role: 'user',
                    content: "My Java tests failed. Please explain why.",
                }, {
                    body: {
                        context: {
                            language: 'java',
                            code: code,
                            testCode: testCode || "N/A",
                            error: errorOutput || "Test assertion failed (Check logs)"
                        }
                    }
                });
             }

         } catch (error) {
             const errorMessage = error instanceof Error ? error.message : String(error);
             terminalRef.current?.writeln(`\n\x1b[31mJava Runtime Error: ${errorMessage}\x1b[0m`);
         } finally {
             setIsRunning(false);
             terminalRef.current?.write('$ ');
         }
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    terminalRef.current?.clear();
    terminalRef.current?.writeln('\x1b[1;32m$ Ready\x1b[0m');
    setShowTutor(false);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4 p-4">
      {/* Left Panel: Instructions */}
      <div className="w-1/3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <h2 className="font-semibold text-lg">{lessonName}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 prose dark:prose-invert max-w-none text-sm">
          <ReactMarkdown>{instructions}</ReactMarkdown>
        </div>
      </div>

      {/* Center Panel: Editor & Output */}
      <div className={cn("flex flex-col gap-4 transition-all duration-300", showTutor ? "w-1/3" : "flex-1")}>
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 p-2 rounded-t-lg border-x border-t border-zinc-200 dark:border-zinc-800">
           <div className="text-xs text-muted-foreground uppercase font-mono px-2">
             {language === 'python' ? 'main.py' : 'Main.java'}
           </div>
           <div className="flex gap-2">
             <Button
               variant="outline"
               size="sm"
               onClick={handleReset}
               className="h-8 text-xs gap-2"
               disabled={isRunning}
             >
               <RotateCcw size={14} />
               Reset
             </Button>
             <Button
               size="sm"
               onClick={handleRun}
               className="h-8 text-xs gap-2 bg-green-600 hover:bg-green-700 text-white"
               disabled={isRunning || (language === 'python' && isPyodideLoading)}
             >
               <Play size={14} />
               {isRunning ? 'Running...' : 'Run & Test'}
             </Button>
           </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 rounded-b-lg border-x border-b border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
           <Editor
             value={code}
             onChange={setCode}
             language={language}
             className="h-full text-base"
             height="100%"
           />
        </div>

        {/* Console / Output */}
        <div className="h-1/3 bg-black rounded-lg border border-zinc-800 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 p-2 px-4 text-zinc-500 border-b border-zinc-800 bg-zinc-900/50">
            <Terminal size={14} />
            <span className="text-xs uppercase">Terminal</span>
          </div>
          <div className="flex-1 p-2">
            <TerminalPanel ref={terminalRef} />
          </div>
        </div>
      </div>
      
      {/* Right Panel: AI Tutor (Conditional) */}
      {showTutor && (
          <div className="w-1/3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in slide-in-from-right">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20 flex items-center gap-2">
               <BrainCircuit className="text-blue-600 dark:text-blue-400" size={20} />
               <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-300">AI Tutor</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(m => (
                    <div key={m.id} className={cn("p-3 rounded-lg text-sm", m.role === 'user' ? 'bg-zinc-100 dark:bg-zinc-800 ml-8' : 'bg-blue-50 dark:bg-blue-900/10 mr-4 border border-blue-100 dark:border-blue-900/30')}>
                        <span className="font-bold block mb-1 text-xs uppercase opacity-50">{m.role === 'user' ? 'You' : 'Tutor'}</span>
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                ))}
                {isAiLoading && (
                    <div className="p-3 text-sm text-muted-foreground animate-pulse">
                        Thinking...
                    </div>
                )}
            </div>
          </div>
      )}
    </div>
  );
};