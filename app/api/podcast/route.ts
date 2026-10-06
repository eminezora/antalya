import { NextRequest, NextResponse } from "next/server";
import { generateContentWithRetry } from "@/lib/gemini";
import { MODEL_NAME, TTS_MODEL_NAME, SYSTEM_INSTRUCTION } from "@/lib/talimat";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gazeteData, documents } = body;

    if (!documents && !gazeteData) {
      return NextResponse.json(
        { error: "Podcast oluşturmak için belge veya gazete verisi gereklidir." },
        { status: 400 }
      );
    }

    const contextText = `
BELGELER:
${documents || ""}

GAZETE BİLGİLERİ:
Manşet: ${gazeteData?.manset || "Tarihî Gelişmeler"}
Spot: ${gazeteData?.spot || ""}
Haber Metni: ${gazeteData?.haberMetni || ""}
Alıntılar: ${JSON.stringify(gazeteData?.alintilar || [])}
`;

    // 1. ADIM: Diyalog metnini oluştur (Gemini Flash + Retry)
    const scriptPrompt = `Aşağıdaki gazete haberini ve tarihî belgeleri "Muhabir" ve "Tarihçi" arasında yaklaşık 1 dakikalık sürükleyici bir Türkçe podcast sohbetine dönüştür.

KURALLAR:
1. Konuşmacılar: Yalnızca "Muhabir" ve "Tarihçi".
2. "Muhabir": Yayını açan, gazete manşetini ve belgelerdeki gelişmeleri merakla soran deneyimli muhabir.
3. "Tarihçi": Belgeleri inceleyip tarihî süreci üçüncü şahısla açıklayan uzman. TARİHÎ KİŞİLERİ ASLA CANLANDIRMAZ, ONLARIN AĞZINDAN KONUŞMAZ, ONLARI ANLATIR.
4. Yalnızca yüklenen belgelerdeki bilgiye ve gazetedeki alıntılara yer verin.
5. Yaklaşık 6 ila 8 konuşma sırası (turn) olsun (toplam ~120-160 kelime, 1 dakikalık akıcı tempo).
6. Dil Türkçe, samimi ve anlaşılır olsun.`;

    const scriptResponse = await generateContentWithRetry({
      model: MODEL_NAME,
      contents: [
        { text: contextText },
        { text: scriptPrompt },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Podcast bölüm başlığı" },
            synopsis: { type: Type.STRING, description: "1 cümlelik bölüm özeti" },
            turns: {
              type: Type.ARRAY,
              description: "Muhabir ve Tarihçi arasındaki diyalog turları",
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: {
                    type: Type.STRING,
                    description: "Muhabir veya Tarihçi",
                  },
                  text: {
                    type: Type.STRING,
                    description: "Konuşma metni (Türkçe)",
                  },
                },
                required: ["speaker", "text"],
              },
            },
          },
          required: ["title", "turns"],
        },
      },
    });

    const parsedScript = JSON.parse(scriptResponse.text || "{}");
    const turns: Array<{ speaker: string; text: string }> = parsedScript.turns || [];

    // 2. ADIM: Gemini TTS ile 2 farklı hazır sesle seslendirme
    let audioBase64: string | null = null;
    let ttsError: string | null = null;

    if (process.env.GEMINI_API_KEY && turns.length > 0) {
      try {
        // Multi-speaker TTS call with 'Puck' (Muhabir) and 'Kore' (Tarihçi)
        const parts = turns.map((t) => ({
          text: `${t.speaker}: ${t.text}`,
          speechMetadata: {
            speaker: t.speaker === "Tarihçi" ? "Tarihçi" : "Muhabir",
            style:
              t.speaker === "Tarihçi"
                ? "Sakin, bilge ve açıklayıcı Türkçe uzman sesi"
                : "Canlı, meraklı ve akıcı Türkçe radyo muhabiri sesi",
          },
        }));

        const ttsResponse = await generateContentWithRetry(
          {
            model: TTS_MODEL_NAME,
            contents: [
              {
                role: "user",
                parts,
              },
            ],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                multiSpeakerVoiceConfig: {
                  speakerVoiceConfigs: [
                    {
                      speaker: "Muhabir",
                      voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Puck" },
                      },
                    },
                    {
                      speaker: "Tarihçi",
                      voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Kore" },
                      },
                    },
                  ],
                },
              },
            },
          },
          2
        );

        const rawAudio =
          ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (rawAudio) {
          audioBase64 = rawAudio;
        }
      } catch (err: any) {
        console.warn("TTS çoklu konuşmacı sentezleme uyarısı:", err?.message);
        ttsError = err?.message || "Ses sentezleme desteklenemedi";

        // Fallback: gemini-3.8-flash-lite-tts ile tek ses birleşik okuma denemesi
        try {
          const combinedDialogueText = turns
            .map((t) => `${t.speaker}: ${t.text}`)
            .join("\n\n");

          const fallbackTts = await generateContentWithRetry(
            {
              model: "gemini-3.8-flash-lite-tts",
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: combinedDialogueText,
                      speechMetadata: {
                        style: "Akıcı ve anlaşılır Türkçe podcast anlatımı",
                      },
                    },
                  ],
                },
              ],
              config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: "Kore" },
                  },
                },
              },
            },
            2
          );

          const fallbackAudio =
            fallbackTts.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (fallbackAudio) {
            audioBase64 = fallbackAudio;
            ttsError = null;
          }
        } catch (fallbackErr: any) {
          console.warn("TTS tek ses fallback uyarısı:", fallbackErr?.message);
        }
      }
    }

    return NextResponse.json({
      title: parsedScript.title || "Tarih Muhabiri Özel Yayını",
      synopsis: parsedScript.synopsis || "Dönemin belgelerine dayalı özel analiz ve röportaj.",
      turns,
      audioBase64,
      audioMimeType: "audio/wav",
      ttsNotice: ttsError ? "Model yoğunluğu sebebiyle tarayıcı yerleşik ses sentezi yedek olarak hazırdır." : null,
    });
  } catch (error: any) {
    console.error("Podcast API hatası:", error);
    const errMsg = String(error?.message || "");
    const isOverloaded = errMsg.includes("503") || errMsg.includes("high demand") || error?.status === 503;
    const clientMessage = isOverloaded
      ? "Model sunucularında anlık yüksek talep var (503). Lütfen birkaç saniye sonra 'Podcast Yap' düğmesine tekrar tıklayınız."
      : error?.message || "Podcast oluşturulurken bir hata oluştu.";

    return NextResponse.json(
      { error: clientMessage },
      { status: isOverloaded ? 503 : 500 }
    );
  }
}
