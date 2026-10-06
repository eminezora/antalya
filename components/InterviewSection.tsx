"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Trash2, 
  Newspaper, 
  Radio, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Loader2,
  FileQuestion,
  ShieldAlert
} from "lucide-react";
import { HistoricalDocument, InterviewMessage } from "@/types";

interface InterviewSectionProps {
  documents: HistoricalDocument[];
  messages: InterviewMessage[];
  setMessages: React.Dispatch<React.SetStateAction<InterviewMessage[]>>;
  onGoToGazete: () => void;
  onGoToPodcast: () => void;
}

let nextMsgId = 1;
function createId(prefix: string) {
  nextMsgId += 1;
  return `${prefix}-${nextMsgId}`;
}

function getTimeString() {
  return new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function InterviewSection({
  documents,
  messages,
  setMessages,
  onGoToGazete,
  onGoToPodcast,
}: InterviewSectionProps) {
  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDocsPeek, setShowDocsPeek] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Combine documents text for API
  const combinedDocumentsText = documents
    .map((doc, i) => `Belge ${i + 1}: ${doc.title}\n${doc.text.trim()}`)
    .join("\n\n---\n\n");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Read aloud with browser Web Speech API
  const handleReadAloud = (msg: InterviewMessage) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (playingId === msg.id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(msg.text);
    utterance.lang = "tr-TR";
    utterance.rate = 1.0;
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    setPlayingId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  // Copy text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send question to /api/roportaj
  const handleSubmit = async (questionToSend?: string) => {
    const q = (questionToSend || inputQuestion).trim();
    if (!q || isLoading) return;

    if (!combinedDocumentsText.trim()) {
      setErrorMsg("Lütfen önce 1. Bölümden en az bir tarihî belge yükleyin.");
      return;
    }

    setErrorMsg(null);
    const newStudentMsg: InterviewMessage = {
      id: createId("std"),
      sender: "student",
      text: q,
      timestamp: getTimeString(),
    };

    const updatedHistory = [...messages, newStudentMsg];
    setMessages(updatedHistory);
    setInputQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/roportaj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: combinedDocumentsText,
          question: q,
          history: updatedHistory.map((m) => ({
            role: m.sender === "student" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Röportaj cevabı alınamadı.");
      }

      // Check if response contains document tag
      const docMatch = data.answer.match(/\[(Belge \d+(?:,\s*Belge \d+)*)\]/);

      const reporterMsg: InterviewMessage = {
        id: createId("rep"),
        sender: "reporter",
        text: data.answer,
        timestamp: getTimeString(),
        documentRef: docMatch ? docMatch[1] : undefined,
      };

      setMessages((prev) => [...prev, reporterMsg]);
    } catch (err: any) {
      setErrorMsg(err?.message || "Cevap üretilirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    "Mustafa Kemal Paşa bu kararları alırken neyi amaçlamıştır?",
    "İstanbul Hükûmeti bu genelgeye nasıl bir karşılık vermiştir?",
    "Vatanın durumu hakkında belgede ne söylenmektedir?",
    "Siz Mustafa Kemal misiniz, kendi ağzınızdan anlatır mısınız?",
    "Cumhuriyet tam olarak hangi tarihte ilan edilmiştir?",
  ];

  return (
    <div className="space-y-6">
      {/* Belgeleri İnceleme / Önizleme Barı */}
      <div className="bg-[#f5ede0] border border-[#d8c8af] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#2c221e] text-[#fbf8f0] text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#2c221e] font-serif-vintage">
              Tarih Muhabiri Röportaj Masası
            </h2>
            <span className="text-xs text-[#7d695b] hidden sm:inline">
              ({documents.length} Belge Etkin)
            </span>
          </div>

          <button
            onClick={() => setShowDocsPeek(!showDocsPeek)}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#ebdcc7] text-[#4d3c30] hover:bg-[#e0cfb8] transition-colors"
          >
            <span>Yüklenen Belgeleri Gör</span>
            {showDocsPeek ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Katlanabilir Belge Metinleri */}
        {showDocsPeek && (
          <div className="mt-3 pt-3 border-t border-[#ded0b9] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {documents.map((doc, idx) => (
              <div key={doc.id} className="bg-[#fcfaf5] p-3 rounded-xl border border-[#d9c9b0] text-xs">
                <div className="font-bold text-[#2c221e] flex items-center justify-between">
                  <span>Belge {idx + 1}: {doc.title}</span>
                </div>
                <p className="mt-1 text-[#665447] font-serif-vintage line-clamp-4 italic">
                  &ldquo;{doc.text.slice(0, 200)}...&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mesaj Akışı Penceresi */}
      <div className="bg-[#fdfbf7] border-2 border-[#d8cbba] rounded-2xl p-4 sm:p-6 min-h-[420px] flex flex-col justify-between shadow-xs">
        <div className="space-y-4 overflow-y-auto max-h-[550px] pr-1">
          {messages.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-2xl bg-[#ede2cf] text-[#8a6829] flex items-center justify-center mx-auto mb-3 shadow-xs">
                <FileQuestion className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#2c221e] font-serif-vintage">
                Röportaj Henüz Başlamadı
              </h3>
              <p className="text-xs sm:text-sm text-[#736052] max-w-md mx-auto mt-1 leading-relaxed">
                Öğretmen olarak öğrencilerinizin sorularını aşağıdaki kutuya yazın. Muhabir, yalnızca yüklenen belgelere dayanarak 3. şahıs diliyle cevaplayacaktır.
              </p>

              {/* Hızlı Örnek Sorular */}
              <div className="mt-6 pt-5 border-t border-[#ebdcc7] max-w-xl mx-auto">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#7d695b] mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#b8860b]" />
                  <span>Sınıf İçi Örnek Sorular (Tıklayıp Deneyin):</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {sampleQuestions.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmit(sq)}
                      className="text-left text-xs bg-[#f4ece0] hover:bg-[#ebdcc7] text-[#4d3c30] px-3 py-1.5 rounded-lg border border-[#dacbb1] hover:border-[#b8860b] transition-all"
                    >
                      &ldquo;{sq}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "student" ? "items-end" : "items-start"
                }`}
              >
                {/* Gönderen Etiketi */}
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[11px] font-bold text-[#705e52]">
                    {msg.sender === "student" ? "Öğrenci Sorusu" : "Tarih Muhabiri"}
                  </span>
                  <span className="text-[10px] text-[#9c897a]">{msg.timestamp}</span>
                </div>

                {/* Mesaj Kutusu */}
                <div
                  className={`max-w-[92%] sm:max-w-[82%] rounded-2xl p-4 shadow-2xs transition-all ${
                    msg.sender === "student"
                      ? "bg-[#2c221e] text-[#fbf8f0] rounded-tr-xs"
                      : "bg-[#f5ece0] text-[#2c221e] border border-[#d8c8af] rounded-tl-xs font-serif-vintage leading-relaxed"
                  }`}
                >
                  <p className="text-xs sm:text-[14px] whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {/* Muhabir Cevabı Ek Araçları */}
                  {msg.sender === "reporter" && (
                    <div className="mt-3 pt-2.5 border-t border-[#decbb4] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {msg.documentRef && (
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#e8dac2] text-[#423328] border border-[#d4c3a7]">
                            Dayanak: [{msg.documentRef}]
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleReadAloud(msg)}
                          className="p-1.5 text-[#6c594b] hover:text-[#2c221e] hover:bg-[#ebdcc7] rounded-md transition-colors"
                          title="Sınıfa Sesli Oku"
                        >
                          {playingId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="p-1.5 text-[#6c594b] hover:text-[#2c221e] hover:bg-[#ebdcc7] rounded-md transition-colors"
                          title="Metni Kopyala"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-start gap-2.5 max-w-[80%]">
              <div className="p-3.5 bg-[#f5ece0] border border-[#d8c8af] rounded-2xl rounded-tl-xs flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-[#8a6829] animate-spin" />
                <span className="text-xs text-[#574438] font-serif-vintage italic">
                  Muhabir belgeleri tarıyor ve cevabı hazırlıyor...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Hata Bildirimi & Tekrar Dene */}
        {errorMsg && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
              <span>{errorMsg}</span>
            </div>
            {messages.length > 0 && messages[messages.length - 1].sender === "student" && (
              <button
                type="button"
                onClick={() => {
                  const lastQ = messages[messages.length - 1].text;
                  setMessages((prev) => prev.slice(0, -1));
                  handleSubmit(lastQ);
                }}
                className="px-2.5 py-1 bg-amber-800 text-amber-50 rounded-lg font-bold text-[11px] hover:bg-amber-900 transition-colors shrink-0 cursor-pointer"
              >
                Tekrar Dene
              </button>
            )}
          </div>
        )}

        {/* Soru Giriş Alanı */}
        <div className="mt-4 pt-4 border-t border-[#e2d5c1]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Öğrencinin sorusunu yazın... (Örn: Mustafa Kemal Paşa genelgede ne istemiştir?)"
              disabled={isLoading}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-[#f9f5ed] border border-[#d4c3ad] rounded-xl text-[#2c221e] placeholder:text-[#998677] focus:outline-hidden focus:ring-2 focus:ring-[#8a6829]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuestion.trim()}
              className={`p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                inputQuestion.trim() && !isLoading
                  ? "bg-[#2c221e] text-[#fbf8f0] hover:bg-[#433530] cursor-pointer"
                  : "bg-[#d8ccb8] text-[#8a7969] cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Sor</span>
            </button>
          </form>

          {/* Temizle & İpuçları */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between text-[11px] text-[#786455] px-1">
            <span>
              💡 Kural: Cevaplar en fazla 5 cümle, 3. şahıs ve [Belge X] atıflıdır.
            </span>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-[#998170] hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Röportajı Temizle</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Yayın Kısa Yol Butonları */}
      <div className="p-4 rounded-2xl bg-[#ede3cf] border border-[#d8c8af] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-[#524134]">
          <span className="font-bold">3. Bölüme Hazır:</span> Röportaj ve belgeleri kullanarak gazete sayfası veya sesli podcast oluşturun.
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onGoToGazete}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#2c221e] text-[#fbf8f0] hover:bg-[#433530] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Newspaper className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Gazete Sayfası Yap</span>
          </button>

          <button
            onClick={onGoToPodcast}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#423328] text-[#fbf8f0] hover:bg-[#574438] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Podcast Yap</span>
          </button>
        </div>
      </div>
    </div>
  );
}
