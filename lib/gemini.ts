import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.antalya || "";

if (!apiKey) {
  console.warn("UYARI: GEMINI_API_KEY veya antalya ortam değişkeni tanımlanmamış.");
}

export const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

/**
 * 503 Service Unavailable / High Demand ve geçici ağ hataları için
 * otomatik üssel geri çekilme (exponential backoff) ile yeniden deneme fonksiyonu.
 */
export async function generateContentWithRetry(
  params: Parameters<typeof ai.models.generateContent>[0],
  maxRetries = 3
) {
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      lastError = err;

      const errorMessage = String(err?.message || "");
      const isTransient =
        err?.status === 503 ||
        err?.code === 503 ||
        err?.status === "UNAVAILABLE" ||
        errorMessage.includes("503") ||
        errorMessage.includes("high demand") ||
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("ResourceExhausted") ||
        errorMessage.includes("429");

      if (isTransient && attempt < maxRetries) {
        const delay = attempt * 1200;
        console.warn(
          `[Gemini Geçici Yoğunluk/503] Deneme ${attempt}/${maxRetries} başarısız. ${delay}ms sonra tekrar deneniyor...`,
          errorMessage
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      break;
    }
  }

  throw lastError;
}

