"use client";

import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'python' | 'java';
  className?: string;
  height?: string;
}

export const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  language = 'python',
  className,
  height = "400px"
}) => {
  
  const extensions = React.useMemo(() => {
    switch (language) {
      case 'java':
        return [java()];
      case 'python':
      default:
        return [python()];
    }
  }, [language]);

  return (
    <div className={className}>
      <CodeMirror
        value={value}
        height={height}
        extensions={extensions}
        onChange={onChange}
        theme="dark" // You might want to make this configurable or match app theme
      />
    </div>
  );
};
