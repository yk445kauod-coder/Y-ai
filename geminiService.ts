import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { MODELS, SYSTEM_INSTRUCTION } from "./constants";
import { Message, ToolMode, FileAttachment, PersonaConfig } from "./types";

const saveUserFactTool: FunctionDeclaration = {
  name: 'saveUserFact',
  parameters: {
    type: Type.OBJECT,
    description: 'يُستخدم لحفظ حقائق هامة ودائمة عن المستخدم في ذاكرته طويلة المدى (مثل: الاسم، الوظيفة، الاهتمامات، المشاريع، تفضيلات معينة).',
    properties: {
      fact: {
        type: Type.STRING,
        description: 'الحقيقة الجديدة المراد حفظها باللغة العربية. مثال: "المستخدم يفضل اللون الأزرق" أو "اسم المستخدم هو أحمد".',
      },
    },
    required: ['fact'],
  },
};

function autoSelectModel(prompt: string, tools: ToolMode[]): string {
  const p = prompt.toLowerCase();
  const imageTriggers = ["صورة", "ارسم", "تخيل", "image", "draw", "paint", "visualize", "generate image", "رسمة"];
  
  if (tools.includes(ToolMode.Image) || imageTriggers.some(t => p.includes(t))) {
    return 'gemini-2.5-flash-image';
  }
  
  return 'gemini-3-flash-preview';
}

export async function* generateAIStream(
  prompt: string,
  history: Message[],
  tools: ToolMode[],
  attachments: FileAttachment[] = [],
  persona: PersonaConfig
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const selectedModel = autoSelectModel(prompt, tools);
  const isImageModel = selectedModel === 'gemini-2.5-flash-image';

  // Distinct Memory Injection
  const memoryContext = persona.longTermMemory 
    ? `\n[ذاكرة المستخدم طويلة المدى]\nتذكر هذه المعلومات عن المستخدم دائماً:\n${persona.longTermMemory}`
    : '\n[ملاحظة] لم يتم تسجيل معلومات شخصية عن المستخدم بعد.';

  const fullSystemInstruction = `${SYSTEM_INSTRUCTION}
  
[هوية المساعد]
الاسم: ${persona.aiName}
الشخصية: ${persona.personality}
الأسلوب المفضل: ${persona.preferredStyle}

${memoryContext}

[قواعد الذاكرة]
1. الذاكرة قصيرة المدى: تشمل آخر ${persona.shortMemoryLimit} رسائل من هذه المحادثة فقط.
2. الذاكرة طويلة المدى: هي المعلومات المخزنة أعلاه في [ذاكرة المستخدم طويلة المدى].
3. تحديث الذاكرة: إذا ذكر المستخدم معلومة شخصية هامة وجديدة لم تكن تعرفها، استخدم أداة "saveUserFact" لحفظها للمستقبل. لا تكرر معلومات موجودة بالفعل.`;

  if (isImageModel) {
    try {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          systemInstruction: fullSystemInstruction,
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      const imageUrls: string[] = [];
      let text = "";
      
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          imageUrls.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        } else if (part.text) {
          text += part.text;
        }
      }
      
      yield { 
        text: text || (imageUrls.length > 0 ? "لقد قمت بتوليد هذه الصورة بناءً على وصفك:" : "لم أتمكن من إنشاء الصورة."), 
        images: imageUrls, 
        modelUsed: selectedModel,
        isDone: true 
      };
      return;
    } catch (err: any) {
      console.error("Image Gen Error:", err);
      yield { text: "عذراً، فشل توليد الصورة. يرجى المحاولة لاحقاً.", isError: true, isDone: true };
      return;
    }
  }

  // Handle standard text generation
  const historyLimit = persona.shortMemoryLimit || 20;
  const contents = history.slice(-historyLimit).map(msg => ({ 
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const currentParts: any[] = [{ text: prompt }];
  attachments.forEach(file => {
    const base64 = file.data.includes('base64,') ? file.data.split(',')[1] : file.data;
    currentParts.push({ inlineData: { data: base64, mimeType: file.type || 'image/jpeg' } });
  });

  contents.push({ role: 'user', parts: currentParts });

  const aiTools: any[] = [];
  if (tools.includes(ToolMode.Search)) {
    aiTools.push({ googleSearch: {} });
  }
  // Always include memory update tool unless explicitly disabled
  aiTools.push({ functionDeclarations: [saveUserFactTool] });

  const config: any = {
    systemInstruction: fullSystemInstruction,
    temperature: 0.7,
    tools: aiTools,
    thinkingConfig: { thinkingBudget: selectedModel.includes('pro') ? 32768 : 0 }
  };

  try {
    const result = await ai.models.generateContentStream({
      model: selectedModel,
      contents,
      config
    });

    let fullText = "";
    let fullThinking = "";

    for await (const chunk of result) {
      if (chunk.text !== undefined) {
        fullText += chunk.text;
      }
      
      // Handle Function Calls (Memory Updates)
      const functionCalls = chunk.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);
      if (functionCalls && functionCalls.length > 0) {
        for (const fc of functionCalls) {
          if (fc.functionCall?.name === 'saveUserFact') {
            const newFact = (fc.functionCall.args as any).fact;
            yield { 
              text: fullText, 
              newFact: newFact, 
              isDone: false 
            };
          }
        }
      }

      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      const grounding = groundingMetadata?.groundingChunks?.map((c: any) => ({
        title: c.web?.title || 'مصدر خارجي',
        uri: c.web?.uri || '#'
      })) || [];
      
      const parts = chunk.candidates?.[0]?.content?.parts || [];
      const thinkingPart = parts.find((p: any) => p.thought);
      if (thinkingPart?.thought) {
        fullThinking += thinkingPart.thought;
      }

      yield { 
        text: fullText, 
        grounding, 
        thinking: fullThinking,
        modelUsed: selectedModel,
        isDone: false 
      };
    }
    yield { text: fullText, thinking: fullThinking, modelUsed: selectedModel, isDone: true };
  } catch (err: any) {
    console.error("Stream Error:", err);
    yield { text: "حدث خطأ في الاتصال. يرجى التحقق من مفتاح API.", isError: true, isDone: true };
  }
}
