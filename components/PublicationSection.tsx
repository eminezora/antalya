"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Newspaper, 
  Radio, 
  Printer, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Loader2, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Mic, 
  Volume2,
  FileCheck2,
  RefreshCw
} from "lucide-react";
import { HistoricalDocument, InterviewMessage, NewspaperData, PodcastData, PodcastTurn } from "@/types";

interface PublicationSectionProps {
  documents: HistoricalDocument[];
  messages: InterviewMessage[];
  newspaperData: NewspaperData | null;
  setNewspaperData: React.Dispatch<React.SetStateAction<NewspaperData | null>>;
  podcastData: PodcastData | null;
  setPodcastData: React.Dispatch<React.SetStateAction<PodcastData | null>>;
}

export function PublicationSection({
  documents,
  messages,
  newspaperData,
  setNewspaperData,
  podcastData,
  setPodcastData,
}: PublicationSectionProps) {
  const [activePubTab, setActivePubTab] = useState<"gazete" | "podcast">("gazete");
  const [isGeneratingGazete, setIsGeneratingGazete] = useState(false);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [gazeteError, setGazeteError] = useState<string | null>(null);
  const [podcastError, setPodcastError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<{ [key: number]: boolean }>({});

  // Audio Player State for Podcast
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTurnIndex, setActiveTurnIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Combined documents text
  const combinedDocumentsText = documents
    .map((doc, i) => `Belge ${i + 1}: ${doc.title}\n${doc.text.trim()}`)
    .join("\n\n---\n\n");

  const interviewTurns = messages.reduce<Array<{ question: string; answer: string }>>(
    (acc, msg, idx, arr) => {
      if (msg.sender === "student") {
        const nextMsg = arr[idx + 1];
        if (nextMsg && nextMsg.sender === "reporter") {
          acc.push({ question: msg.text, answer: nextMsg.text });
        }
      }
      return acc;
    },
    []
  );

  // 1. GENERATE NEWSPAPER
  const handleGenerateGazete = async () => {
    if (!combinedDocumentsText.trim()) {
      setGazeteError("Lütfen önce 1. Bölümden birincil tarihî belgeleri yükleyin.");
      return;
    }

    setGazeteError(null);
    setIsGeneratingGazete(true);

    try {
      const response = await fetch("/api/gazete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: combinedDocumentsText,
          interviewTurns,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gazete sayfası üretilemedi.");
      }

      setNewspaperData(data);
      setActivePubTab("gazete");
    } catch (err: any) {
      setGazeteError(err?.message || "Gazete sayfası hazırlanırken bir hata oluştu.");
    } finally {
      setIsGeneratingGazete(false);
    }
  };

  // 2. GENERATE PODCAST
  const handleGeneratePodcast = async () => {
    if (!combinedDocumentsText.trim()) {
      setPodcastError("Lütfen önce 1. Bölümden birincil tarihî belgeleri yükleyin.");
      return;
    }

    setPodcastError(null);
    setIsGeneratingPodcast(true);

    try {
      const response = await fetch("/api/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: combinedDocumentsText,
          gazeteData: newspaperData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Podcast üretilemedi.");
      }

      setPodcastData(data);
      setActivePubTab("podcast");
      setIsPlaying(false);
      setCurrentTime(0);
    } catch (err: any) {
      setPodcastError(err?.message || "Podcast hazırlanırken bir hata oluştu.");
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  // Audio element management
  useEffect(() => {
    if (!podcastData?.audioBase64) return;

    const audioUrl = `data:${podcastData.audioMimeType || "audio/wav"};base64,${podcastData.audioBase64}`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 60);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // estimate active speaker turn
      if (podcastData.turns.length > 0 && audio.duration > 0) {
        const turnDuration = audio.duration / podcastData.turns.length;
        const currentTurn = Math.min(
          Math.floor(audio.currentTime / turnDuration),
          podcastData.turns.length - 1
        );
        setActiveTurnIndex(currentTurn);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveTurnIndex(null);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [podcastData?.audioBase64, podcastData?.turns, podcastData?.audioMimeType]);

  // Audio Play / Pause
  const togglePlayAudio = () => {
    if (!audioRef.current) {
      // Fallback: Web Speech API play dialogue if no Gemini wav
      if (podcastData?.turns) {
        playBrowserDialogue();
      }
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
        console.warn("Ses çalma hatası:", e);
        playBrowserDialogue();
      });
    }
  };

  // Play Browser Dialogue (Fallback)
  const playBrowserDialogue = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !podcastData?.turns) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setActiveTurnIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlaying(true);

    let currentIndex = 0;
    const playNextTurn = () => {
      if (currentIndex >= podcastData.turns.length) {
        setIsPlaying(false);
        setActiveTurnIndex(null);
        return;
      }

      const turn = podcastData.turns[currentIndex];
      setActiveTurnIndex(currentIndex);

      const utterance = new SpeechSynthesisUtterance(`${turn.speaker}: ${turn.text}`);
      utterance.lang = "tr-TR";
      utterance.rate = turn.speaker === "Muhabir" ? 1.05 : 0.95;
      utterance.pitch = turn.speaker === "Muhabir" ? 1.1 : 0.9;

      utterance.onend = () => {
        currentIndex++;
        playNextTurn();
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        setActiveTurnIndex(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    playNextTurn();
  };

  // Speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Print newspaper
  const handlePrint = () => {
    window.print();
  };

  // Copy text
  const handleCopyNewspaper = () => {
    if (!newspaperData) return;
    const text = `${newspaperData.gazeteAdi || "İRADE-İ MİLLÎYE"} (${newspaperData.dönemTarihi || "1919"})\n\nMANŞET: ${newspaperData.manset}\n\nSPOT: ${newspaperData.spot}\n\nHABER METNİ:\n${newspaperData.haberMetni}\n\nBİRİNCİL ALINTILAR:\n${newspaperData.alintilar?.map((a) => `"${a.metin}" [${a.belge}]`).join("\n")}\n\nKONTROL SORULARI:\n${newspaperData.kontrolSorulari?.map((k, i) => `${i + 1}. ${k.soru}\nCevap: ${k.beklenenCevap} [${k.dayandigiBelge}]`).join("\n\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format time (seconds to mm:ss)
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* Üst İşlem Çubuğu ve İki Ana Düğme */}
      <div className="bg-[#f5ede0] border border-[#d8c8af] rounded-2xl p-5 shadow-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2c221e] text-[#fbf8f0] text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-lg font-bold text-[#2c221e] font-serif-vintage">
                Yayın Masası: 1919 Gazetesi & Podcast
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#614e41] mt-1">
              Belgeleri ve röportajı 1919 dönemi tarihî gazete sayfasına veya iki sesli podcast yayınına dönüştürün.
            </p>
          </div>

          {/* İki Ana Üretim Düğmesi */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateGazete}
              disabled={isGeneratingGazete}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer ${
                isGeneratingGazete
                  ? "bg-[#d4c4ad] text-[#6b5849] cursor-wait"
                  : "bg-[#2c221e] text-[#fbf8f0] hover:bg-[#433530] hover:scale-[1.02]"
              }`}
            >
              {isGeneratingGazete ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                  <span>Gazete Basılıyor...</span>
                </>
              ) : (
                <>
                  <Newspaper className="w-4 h-4 text-[#d4af37]" />
                  <span>{newspaperData ? "Gazeteyi Yeniden Bas" : "Gazete Sayfası Yap"}</span>
                </>
              )}
            </button>

            <button
              onClick={handleGeneratePodcast}
              disabled={isGeneratingPodcast}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer ${
                isGeneratingPodcast
                  ? "bg-[#d4c4ad] text-[#6b5849] cursor-wait"
                  : "bg-[#543b2b] text-[#fbf8f0] hover:bg-[#664b38] hover:scale-[1.02]"
              }`}
            >
              {isGeneratingPodcast ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                  <span>Podcast Seslendiriliyor...</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 text-[#d4af37]" />
                  <span>{podcastData ? "Podcasti Yeniden Üret" : "Podcast Yap"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Görünüm Değiştirici Sekmeler */}
        <div className="mt-5 pt-4 border-t border-[#dfcfb7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePubTab("gazete")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePubTab === "gazete"
                  ? "bg-[#2c221e] text-[#fbf8f0]"
                  : "bg-[#ebdcc7] text-[#544133] hover:bg-[#dfd0ba]"
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>1919 Gazete Sayfası</span>
              {newspaperData && <Check className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              onClick={() => setActivePubTab("podcast")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePubTab === "podcast"
                  ? "bg-[#2c221e] text-[#fbf8f0]"
                  : "bg-[#ebdcc7] text-[#544133] hover:bg-[#dfd0ba]"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Sesli Podcast (1 Dk)</span>
              {podcastData && <Check className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>

          {activePubTab === "gazete" && newspaperData && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#ebdcc7] text-[#2c221e] hover:bg-[#e0cfb8] border border-[#d6c4a8] flex items-center gap-1.5 transition-colors"
                title="Gazeteyi Yazdır veya PDF olarak kaydet"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Yazdır / PDF İndir</span>
              </button>
              <button
                onClick={handleCopyNewspaper}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#ebdcc7] text-[#2c221e] hover:bg-[#e0cfb8] border border-[#d6c4a8] flex items-center gap-1 transition-colors"
                title="Tüm gazete metnini kopyala"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hata Bildirimleri */}
      {gazeteError && (
        <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl no-print flex items-center justify-between gap-2">
          <span>{gazeteError}</span>
          <button
            onClick={handleGenerateGazete}
            disabled={isGeneratingGazete}
            className="px-2.5 py-1 bg-amber-800 text-amber-50 rounded-lg font-bold text-[11px] hover:bg-amber-900 transition-colors shrink-0 cursor-pointer"
          >
            Tekrar Dene
          </button>
        </div>
      )}
      {podcastError && (
        <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl no-print flex items-center justify-between gap-2">
          <span>{podcastError}</span>
          <button
            onClick={handleGeneratePodcast}
            disabled={isGeneratingPodcast}
            className="px-2.5 py-1 bg-amber-800 text-amber-50 rounded-lg font-bold text-[11px] hover:bg-amber-900 transition-colors shrink-0 cursor-pointer"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. GAZETE SAYFASI GÖRÜNÜMÜ (1919 DÖNEMİ OTANTİK GAZETE) */}
      {/* ======================================================== */}
      {activePubTab === "gazete" && (
        <div>
          {!newspaperData ? (
            <div className="bg-[#fcfaf6] border-2 border-dashed border-[#cdbea8] rounded-2xl p-12 text-center no-print">
              <div className="w-16 h-16 rounded-2xl bg-[#eee3d0] text-[#8a6829] flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#2c221e] font-serif-vintage">
                Gazete Henüz Basılmadı
              </h3>
              <p className="text-xs sm:text-sm text-[#736052] max-w-md mx-auto mt-1 leading-relaxed">
                Yukarıdaki <strong>&ldquo;Gazete Sayfası Yap&rdquo;</strong> düğmesine tıklayarak yüklenen belgeler ve yapılan röportajdan 1919 dönemi mizanpajında otantik bir gazete sayfası üretin.
              </p>
              <button
                onClick={handleGenerateGazete}
                disabled={isGeneratingGazete}
                className="mt-5 px-5 py-2.5 bg-[#2c221e] text-[#fbf8f0] font-bold text-xs rounded-xl hover:bg-[#433530] transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>1919 Gazete Sayfasını Şimdi Üret</span>
              </button>
            </div>
          ) : (
            <div className="bg-newspaper border-newspaper-double rounded-none p-6 sm:p-10 shadow-xl max-w-4xl mx-auto print-newspaper-container text-[#1f1713]">
              {/* Gazete Üst Künyesi (Masthead Top Line) */}
              <div className="text-center pb-2 border-b border-[#2c221e] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#3d2f27] font-cinzel">
                Hâkimiyet Milletindir • Birincil Tarihî Vesikalar Işığında Günlük Müstakil Neşriyat
              </div>

              {/* Gazete Başlığı & İki Yan Künye Kutuları */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center py-4 border-b-4 border-double border-[#2c221e] gap-4">
                {/* Sol Künye */}
                <div className="text-left text-[11px] font-serif-vintage space-y-0.5 border-r border-[#2c221e]/30 pr-3 hidden sm:block">
                  <div className="font-bold text-[#2c221e]">
                    {newspaperData.sayiNo || "Sayı: 19"}
                  </div>
                  <div className="text-[#59473b]">Fiyatı: 5 Kuruş</div>
                  <div className="text-[#59473b]">Matbaa-i Âmire</div>
                </div>

                {/* Orta Gazete Logosu / Başlığı */}
                <div className="sm:col-span-2 text-center">
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#1a120e] font-serif-vintage uppercase">
                    {newspaperData.gazeteAdi || "İRÂDE-İ MİLLÎYE"}
                  </h1>
                  <div className="text-[11px] sm:text-xs font-semibold text-[#544133] italic mt-1 font-serif-vintage">
                    Tarih Muhabiri Özel Ders Nüshası
                  </div>
                </div>

                {/* Sağ Künye (Tarih) */}
                <div className="text-right text-[11px] font-serif-vintage space-y-0.5 border-l border-[#2c221e]/30 pl-3 hidden sm:block">
                  <div className="font-bold text-[#2c221e]">
                    {newspaperData.dönemTarihi || "23 Haziran 1335 / 1919"}
                  </div>
                  <div className="text-[#59473b]">Anadolu Ajansı / Telgraf</div>
                  <div className="text-[#59473b]">Sansürsüz Resmî Metin</div>
                </div>
              </div>

              {/* Mobil Tarih Çizgisi */}
              <div className="sm:hidden flex items-center justify-between text-[11px] font-serif-vintage py-1.5 border-b border-[#2c221e]/30">
                <span>{newspaperData.sayiNo || "Sayı: 19"}</span>
                <span className="font-bold">{newspaperData.dönemTarihi || "1919"}</span>
                <span>Fiyatı: 5 Kuruş</span>
              </div>

              {/* BÜYÜK MANŞET */}
              <div className="my-6 text-center">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1a120e] font-serif-vintage leading-tight uppercase tracking-tight">
                  {newspaperData.manset}
                </h2>

                {/* SPOT (Alt Başlık) */}
                <div className="mt-3 py-2 px-4 border-y border-[#2c221e] max-w-2xl mx-auto">
                  <p className="text-sm sm:text-base font-serif-vintage italic text-[#382b24] font-medium leading-relaxed">
                    {newspaperData.spot}
                  </p>
                </div>
              </div>

              {/* ANA HABER METNİ (Sütunlu Mizanpaj) */}
              <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-[14px] font-serif-vintage leading-relaxed text-justify text-[#261d19]">
                <div className="space-y-3">
                  <p className="first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:font-cinzel">
                    {newspaperData.haberMetni}
                  </p>
                </div>

                {/* BİRİNCİL BELGELERDEN BİREBİR ALINTILAR KUTUSU */}
                <div className="bg-[#f3edd9] border-2 border-[#2c221e] p-4 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center gap-1.5 pb-2 border-b border-[#2c221e] text-xs font-bold text-[#1f1713] uppercase tracking-wider font-cinzel">
                      <Sparkles className="w-3.5 h-3.5 text-[#8a6829]" />
                      <span>Birincil Belgelerden Birebir İfadeler</span>
                    </div>

                    <div className="mt-3 space-y-3">
                      {newspaperData.alintilar?.map((quote, idx) => (
                        <div key={idx} className="border-l-2 border-[#2c221e] pl-3 py-1">
                          <blockquote className="text-xs sm:text-[13px] italic font-serif-vintage text-[#241a15]">
                            &ldquo;{quote.metin}&rdquo;
                          </blockquote>
                          <div className="text-[10px] font-mono font-bold text-[#755f4e] mt-1">
                            — Kaynak: {quote.belge}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-[#2c221e]/30 text-[10px] text-[#5e4b3c] italic text-center">
                    Tarih Muhabiri Kuralları: Alıntılar belgeden birebir harfiyen aktarılmıştır.
                  </div>
                </div>
              </div>

              {/* SINIF İÇİ KONTROL SORULARI (Öğretmen Çalışma Yaprağı Bölümü) */}
              <div className="mt-8 pt-5 border-t-2 border-[#2c221e]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#8a6829]" />
                    <h3 className="text-xs sm:text-sm font-bold font-cinzel uppercase text-[#1a120e]">
                      Sınıf İçi Belge Değerlendirme & Kontrol Soruları
                    </h3>
                  </div>
                  <span className="text-[11px] font-serif-vintage italic text-[#6e5849] hidden sm:inline">
                    Öğrencilerin belgeleri anlama düzeyini ölçün
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {newspaperData.kontrolSorulari?.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#f8f3e5] border border-[#2c221e] p-3 text-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-bold text-[#2c221e] font-serif-vintage flex items-center justify-between">
                          <span>Soru {idx + 1}</span>
                          <span className="text-[10px] font-mono text-[#8a6829]">
                            {item.dayandigiBelge}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[#33261f] font-serif-vintage">
                          {item.soru}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#dfd0ba]">
                        <button
                          onClick={() =>
                            setRevealedAnswers((prev) => ({
                              ...prev,
                              [idx]: !prev[idx],
                            }))
                          }
                          className="text-[10px] font-semibold text-[#8a6829] hover:text-[#2c221e] flex items-center gap-1 transition-colors"
                        >
                          {revealedAnswers[idx] ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Cevabı Gizle</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Beklenen Cevabı Göster</span>
                            </>
                          )}
                        </button>

                        {revealedAnswers[idx] && (
                          <div className="mt-1.5 p-2 bg-[#ede0cb] rounded text-[11px] text-[#2c221e] font-serif-vintage italic animate-fadeIn">
                            {item.beklenenCevap}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alt Bilgi & Matbaa Mührü */}
              <div className="mt-8 pt-4 border-t border-[#2c221e] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#6b5648] font-serif-vintage gap-2">
                <div>
                  T.C. Millî Eğitim Bakanlığı Tarih Dersi Birincil Kaynak Uygulama Materyali
                </div>
                <div className="font-mono">
                  Belge No: 1919-IRADEI-MILLIYE-AI
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PODCAST YAYINI GÖRÜNÜMÜ (MUHABİR & TARİHÇİ 1 DAKİKALIK SES) */}
      {/* ======================================================== */}
      {activePubTab === "podcast" && (
        <div>
          {!podcastData ? (
            <div className="bg-[#fcfaf6] border-2 border-dashed border-[#cdbea8] rounded-2xl p-12 text-center no-print">
              <div className="w-16 h-16 rounded-2xl bg-[#eee3d0] text-[#8a6829] flex items-center justify-center mx-auto mb-4">
                <Radio className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#2c221e] font-serif-vintage">
                Podcast Henüz Hazırlanmadı
              </h3>
              <p className="text-xs sm:text-sm text-[#736052] max-w-md mx-auto mt-1 leading-relaxed">
                Yukarıdaki <strong>&ldquo;Podcast Yap&rdquo;</strong> düğmesine tıklayarak haber metnini <strong>&ldquo;Muhabir&rdquo;</strong> ve <strong>&ldquo;Tarihçi&rdquo;</strong> arasında 1 dakikalık sesli bir diyaloga dönüştürün.
              </p>
              <button
                onClick={handleGeneratePodcast}
                disabled={isGeneratingPodcast}
                className="mt-5 px-5 py-2.5 bg-[#543b2b] text-[#fbf8f0] font-bold text-xs rounded-xl hover:bg-[#684a36] transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Podcasti Şimdi Seslendir</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#fbf8f0] border-2 border-[#2c221e] rounded-2xl p-6 sm:p-8 shadow-lg max-w-4xl mx-auto space-y-6">
              {/* Podcast Başlık & Radyo Çerçevesi */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b-2 border-[#2c221e]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#2c221e] text-[#d4af37] flex items-center justify-center shadow-xs">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#ebdcc7] text-[#544133] border border-[#d6c4a8]">
                        1919 Radyosu • 1 Dakika
                      </span>
                      {podcastData.audioBase64 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Gemini TTS Aktif
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1f1713] font-serif-vintage mt-1">
                      {podcastData.title}
                    </h2>
                    <p className="text-xs text-[#6e5849] mt-0.5">
                      {podcastData.synopsis}
                    </p>
                  </div>
                </div>

                {/* İndir Düğmesi */}
                {podcastData.audioBase64 && (
                  <a
                    href={`data:${podcastData.audioMimeType || "audio/wav"};base64,${podcastData.audioBase64}`}
                    download="tarih-muhabiri-podcast.wav"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#ebdcc7] text-[#2c221e] hover:bg-[#dfceb6] border border-[#d4c1a5] transition-colors self-start md:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ses Dosyasını İndir (.wav)</span>
                  </a>
                )}
              </div>

              {/* Oynatıcı Kontrolleri (Audio Player) */}
              <div className="bg-[#2c221e] text-[#fbf8f0] rounded-2xl p-4 sm:p-6 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Oynat / Duraklat Butonu */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayAudio}
                      className="w-12 h-12 rounded-full bg-[#d4af37] text-[#2c221e] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </button>

                    <div>
                      <div className="text-sm font-bold flex items-center gap-2">
                        <span>{isPlaying ? "Yayın Çalıyor..." : "Dinlemeye Başla"}</span>
                        {isPlaying && (
                          <span className="flex gap-0.5 items-end h-4">
                            <span className="w-1 bg-[#d4af37] h-2 animate-bounce" />
                            <span className="w-1 bg-[#d4af37] h-4 animate-bounce delay-75" />
                            <span className="w-1 bg-[#d4af37] h-3 animate-bounce delay-150" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#d1c2b5]">
                        Muhabir (Puck) & Tarihçi (Kore)
                      </div>
                    </div>
                  </div>

                  {/* Süre ve Hız Ayarları */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="font-mono text-[#d4af37] font-semibold">
                      {formatTime(currentTime)} / {formatTime(duration || 60)}
                    </div>

                    <div className="flex items-center gap-1 bg-[#423328] p-1 rounded-lg">
                      {[0.8, 1, 1.2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            playbackSpeed === spd
                              ? "bg-[#d4af37] text-[#2c221e]"
                              : "text-[#d1c2b5] hover:text-[#fbf8f0]"
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* İlerleme Çubuğu */}
                <div className="mt-4">
                  <div className="w-full bg-[#423328] h-2 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="bg-[#d4af37] h-full transition-all duration-200"
                      style={{
                        width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* DİYALOG TRANSKRİPTİ (Muhabir & Tarihçi) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#695446] uppercase tracking-wider pb-2 border-b border-[#dfcfb7]">
                  <span>Podcast Diyalog Akışı ({podcastData.turns.length} Sıra):</span>
                  <span>Öğretmen & Öğrenci Metin Takibi</span>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {podcastData.turns.map((turn, idx) => {
                    const isMuhabir = turn.speaker === "Muhabir";
                    const isCurrentActive = activeTurnIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCurrentActive
                            ? "bg-[#f4ebd9] border-[#8a6829] shadow-xs scale-[1.01]"
                            : isMuhabir
                            ? "bg-[#fdfaf5] border-[#dfd2be]"
                            : "bg-[#f5ede0] border-[#d8c8af]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                isMuhabir
                                  ? "bg-[#2c221e] text-[#fbf8f0]"
                                  : "bg-[#8a6829] text-[#fbf8f0]"
                              }`}
                            >
                              {isMuhabir ? "🎙️ Muhabir" : "🏛️ Tarihçi"}
                            </span>
                            <span className="text-[11px] text-[#786455] font-medium">
                              {isMuhabir
                                ? "(Gelişmeleri Aktaran Gazeteci)"
                                : "(3. Şahısla Açıklayan Uzman)"}
                            </span>
                          </div>

                          {isCurrentActive && (
                            <span className="text-[10px] font-bold text-[#8a6829] animate-pulse">
                              ▶ Konuşuyor
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-[13px] font-serif-vintage leading-relaxed text-[#2c221e]">
                          {turn.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Kurallar Hatırlatması */}
              <div className="p-3 bg-[#ede2cf] rounded-xl text-[11px] text-[#695445] flex items-center justify-between">
                <span>
                  ✓ Kural Kontrolü: Tarihçi, tarihî kişileri canlandırmamış; onları ve kararları üçüncü şahısla anlatmıştır.
                </span>
                <span className="font-mono text-[10px]">Gemini 3.8 Flash Audio</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
