
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateSummary(article: string, persona: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    
    let prompt = `Please summarize the following news article.`;
    if (persona.trim()) {
        prompt = `Please summarize the following news article, with the personalization: "${persona}".`;
    }
    prompt += `\n\nArticle:\n---\n${article}`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error("Failed to communicate with the Gemini API for summarization.");
    }
}

export async function generateSpeech(text: string): Promise<string> {
    const model = 'gemini-2.5-flash-preview-tts';
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Audio) {
            throw new Error("No audio data received from the API.");
        }

        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to communicate with the Gemini API for text-to-speech.");
    }
}
