"use client";

import { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cheerpjInit: (options?: any) => Promise<void>;
    cheerpjRunMain: (className: string, classPath: string, ...args: string[]) => Promise<number>;
    cheerpjRunJar: (jarPath: string, ...args: string[]) => Promise<number>;
    cheerpOSAddStringFile: (path: string, content: string) => Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cjFileBlob: any;
  }
}

export const useCheerpj = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const initializationPromise = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const load = async () => {
      if (isLoaded) return;

      if (initializationPromise.current) {
        await initializationPromise.current;
        return;
      }

      initializationPromise.current = (async () => {
        try {
          if (!window.cheerpjInit) {
            const script = document.createElement('script');
            script.src = "https://cjrtnc.leaningtech.com/3.0/cj3loader.js";
            script.async = true;
            document.body.appendChild(script);
            await new Promise((resolve) => {
              script.onload = resolve;
            });
          }

          await window.cheerpjInit();
          setIsLoaded(true);
        } catch (err) {
          console.error("Failed to load Cheerpj", err);
        }
      })();

      await initializationPromise.current;
    };

    load();
  }, [isLoaded]);

  return { isLoaded };
};
