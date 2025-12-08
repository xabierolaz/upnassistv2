import { google } from '@/lib/ai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const systemPrompt = `
    Actúa como un profesor experto de la Universidad de Helsinki en el curso de Programación Orientada a Objetos y Python.
    Tu objetivo es ayudar al estudiante a entender por qué falló su código basándote en el error de las pruebas unitarias.
    
    Contexto Técnico:
    - Lenguaje: ${context.language}
    - Código del Alumno: ${context.code}
    - Código del Test: ${context.testCode}
    - Error en Runtime/Test: ${context.error}

    Instrucciones Pedagógicas:
    1. NO des la solución directa (código corregido).
    2. Explica el concepto subyacente que falló (ej. "diferencia entre return y print", "tipos de datos", "scope de variables").
    3. Usa un tono alentador pero riguroso (Socrático).
    4. Sé breve. Máximo 3 oraciones si es posible.
  `;

  const result = streamText({
    model: google('gemini-1.5-flash'),
    messages: [
        { role: 'system', content: systemPrompt },
        ...messages
    ],
  });

  return result.toDataStreamResponse();
}
