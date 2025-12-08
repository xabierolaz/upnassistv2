"use client";

import { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loadPyodide: any;
  }
}

interface PyodideInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runPythonAsync: (code: string) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runPython: (code: string) => any;
  loadPackage: (packages: string | string[]) => Promise<void>;
  setStdout: (options: { batched: (msg: string) => void }) => void;
  setStderr: (options: { batched: (msg: string) => void }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globals: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FS: any;
}

export const usePyodide = () => {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializationPromise = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const load = async () => {
      if (pyodide) return;
      
      // Prevent double initialization
      if (initializationPromise.current) {
          await initializationPromise.current;
          return;
      }

      initializationPromise.current = (async () => {
          try {
            if (!window.loadPyodide) {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
                script.async = true;
                document.body.appendChild(script);
                await new Promise((resolve) => {
                  script.onload = resolve;
                });
            }
    
            const p = await window.loadPyodide({
                 indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/"
            });
            
            await p.loadPackage(["micropip", "pytest"]);
            setPyodide(p);
            setIsLoading(false);
          } catch (err) {
              console.error("Failed to load Pyodide", err);
              setIsLoading(false); // Stop loading even if failed
          }
      })();
      
      await initializationPromise.current;
    };

    load();
  }, [pyodide]);

  return { pyodide, isLoading };
};
