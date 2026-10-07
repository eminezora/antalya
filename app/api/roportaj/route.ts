import { NextRequest, NextResponse } from "next/server";
import { generateContentWithRetry } from "@/lib/gemini";
import { MODEL_NAME, SYSTEM_INSTRUCTION } from "@/lib/talimat";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Röportaj yapabilmek için lütfen önce giriş yapınız." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { documents, question, history } = body;

    if (!documents || typeof documents !== "string" || !documents.trim()) {
      return NextResponse.json(
        { error: "Lütfen en az bir tarihî belge metni sağlayın." },
        { status: 400 }
      );
    }

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "Lütfen öğrencinin sorusunu yazın." },
        { status: 400 }
      );
    }

    // Build chat turns or prompt
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    // Historical context header
    const contextPrompt = `AŞAĞIDAKİ BİRİNCİL TARİHÎ BELGELERİ ESAS AL:
${documents.trim()}

---
YÖNERGE HATIRLATMASI:
- Yalnızca yukarıdaki belgelerdeki bilgiyi kullan.
- Tarihî kişileri canlandırma, muhabir olarak üçüncü şahısla aktar.
- Cevabın sonuna mutlaka dayandığın belgeyi yaz: [Belge 1], [Belge 2] vb.
- Bir kişinin sözünü aktaracaksan, belgedeki cümleyi tırnak içinde ("...") harfiyen aktar.
- Bilgi belgelerde yoksa aynen şunu söyle: "Bu belgelerde bu sorunun cevabı yok. Ders kitabınızda veya başka bir birincil kaynakta araştırabilirsiniz."
- En fazla 5 cümle kur.`;

    contents.push({
      role: "user",
      parts: [{ text: contextPrompt }],
    });

    contents.push({
      role: "model",
      parts: [
        {
          text: "Anlaşıldı. Belgeleri tarafsız bir tarih muhabiri olarak inceledim. Yalnızca bu belgelerdeki bilgilere dayanarak, üçüncü şahıs anlatımıyla ve belge atıflarıyla öğrencilerin sorularını yanıtlamaya hazırım.",
        },
      ],
    });

    // Append prior conversational history if available
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-6)) {
        if (turn.role === "user" && turn.content) {
          contents.push({
            role: "user",
            parts: [{ text: `Öğrenci Sorusu: ${turn.content}` }],
          });
        } else if (turn.role === "assistant" && turn.content) {
          contents.push({
            role: "model",
            parts: [{ text: turn.content }],
          });
        }
      }
    }

    // Current student question
    contents.push({
      role: "user",
      parts: [{ text: `Öğrenci Sorusu: ${question.trim()}` }],
    });

    const response = await generateContentWithRetry({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      },
    });

    const answer = response.text || "Cevap üretilemedi.";

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Röportaj API hatası:", error);
    const errMsg = String(error?.message || "");
    const isOverloaded = errMsg.includes("503") || errMsg.includes("high demand") || error?.status === 503;
    const clientMessage = isOverloaded
      ? "Model sunucularında anlık yüksek talep var (503). Lütfen birkaç saniye sonra soruyu tekrar sorunuz."
      : error?.message || "Röportaj cevabı üretilirken bir hata oluştu.";

    return NextResponse.json(
      { error: clientMessage },
      { status: isOverloaded ? 503 : 500 }
    );
  }
}
