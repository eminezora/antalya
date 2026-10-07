import { NextRequest, NextResponse } from "next/server";
import { generateContentWithRetry } from "@/lib/gemini";
import { MODEL_NAME, SYSTEM_INSTRUCTION } from "@/lib/talimat";
import { Type } from "@google/genai";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Gazete oluşturabilmek için lütfen önce giriş yapınız." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { documents, interviewTurns } = body;

    if (!documents || typeof documents !== "string" || !documents.trim()) {
      return NextResponse.json(
        { error: "Lütfen en az bir tarihî belge metni sağlayın." },
        { status: 400 }
      );
    }

    const turnsSummary = Array.isArray(interviewTurns) && interviewTurns.length > 0
      ? interviewTurns
          .map(
            (t: { question: string; answer: string }, idx: number) =>
              `Soru ${idx + 1}: ${t.question}\nMuhabir Cevabı: ${t.answer}`
          )
          .join("\n\n")
      : "Henüz soru-cevap yapılmadı; doğrudan yüklenen belgelere dayalı manşet haberi hazırla.";

    const prompt = `AŞAĞIDAKİ BİRİNCİL TARİHÎ BELGELERİ VE YAPILAN RÖPORTAJI KULLANARAK 1919 DÖNEMİ BİR GAZETE SAYFASI HAZIRLA.

YÜKLENEN BELGELER:
${documents.trim()}

RÖPORTAJ SORU-CEVAPLARI:
${turnsSummary}

KURALLAR:
1. "manset": 1919 dönemi gazete tarzında çarpıcı, tarihi gerçekliğe ve belgelere dayalı büyük manşet.
2. "spot": Manşetin altında yer alacak, olayın can alıcı özetini sunan haber spotu.
3. "haberMetni": Belgelere ve röportaja dayalı, üçüncü şahıs gözüyle yazılmış detaylı haber metni (2-3 paragraf).
4. "alintilar": Belgelerde geçen ifadelerden BİREBİR (harfiyen, değiştirilmeden) tırnak içinde seçilmiş 2-3 önemli alıntı listesi. Her biri için 'metin' ve 'belge' ([Belge 1], [Belge 2] gibi) belirt.
5. "kontrolSorulari": Öğrencilerin belgeleri anlayıp anlamadığını sınayan TAM 3 ADET pedagojik kontrol sorusu. Her soru için 'soru', 'beklenenCevap' ve 'dayandigiBelge' alanlarını doldur.
6. "dönemTarihi": Belgelerin ait olduğu döneme uygun 1919/1920 tarih formatı (Örnek: "23 Haziran 1335 / 1919").
7. "gazeteAdi": Döneme uygun gazete başlığı (Örnek: "İrade-i Millîye", "Hâkimiyet-i Millîye" veya "Tarih Muhabiri Gazetesi").`;

    const response = await generateContentWithRetry({
      model: MODEL_NAME,
      contents: [{ text: prompt }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gazeteAdi: { type: Type.STRING, description: "Gazetenin adı" },
            dönemTarihi: { type: Type.STRING, description: "1919 dönem tarihi" },
            sayiNo: { type: Type.STRING, description: "Sayı no" },
            manset: { type: Type.STRING, description: "Gazete manşeti" },
            spot: { type: Type.STRING, description: "Haber spotu / alt başlığı" },
            haberMetni: { type: Type.STRING, description: "Ana haber metni" },
            alintilar: {
              type: Type.ARRAY,
              description: "Belgelerden birebir alıntılar",
              items: {
                type: Type.OBJECT,
                properties: {
                  metin: { type: Type.STRING, description: "Birebir alıntı metni" },
                  belge: { type: Type.STRING, description: "Dayandığı belge etiketi" },
                },
                required: ["metin", "belge"],
              },
            },
            kontrolSorulari: {
              type: Type.ARRAY,
              description: "3 adet kontrol sorusu",
              items: {
                type: Type.OBJECT,
                properties: {
                  soru: { type: Type.STRING, description: "Kontrol sorusu" },
                  beklenenCevap: { type: Type.STRING, description: "Belgeye dayalı beklenen cevap" },
                  dayandigiBelge: { type: Type.STRING, description: "İlgili belge" },
                },
                required: ["soru", "beklenenCevap", "dayandigiBelge"],
              },
            },
          },
          required: ["manset", "spot", "haberMetni", "alintilar", "kontrolSorulari"],
        },
      },
    });

    const rawJson = response.text || "{}";
    const parsedData = JSON.parse(rawJson);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Gazete API hatası:", error);
    const errMsg = String(error?.message || "");
    const isOverloaded = errMsg.includes("503") || errMsg.includes("high demand") || error?.status === 503;
    const clientMessage = isOverloaded
      ? "Model sunucularında anlık yüksek talep var (503). Lütfen birkaç saniye sonra 'Gazete Sayfası Yap' düğmesine tekrar tıklayınız."
      : error?.message || "Gazete sayfası hazırlanırken bir hata oluştu.";

    return NextResponse.json(
      { error: clientMessage },
      { status: isOverloaded ? 503 : 500 }
    );
  }
}
