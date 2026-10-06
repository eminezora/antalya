"use client";

import React, { useState } from "react";
import { 
  FileText, 
  MessageSquare, 
  Newspaper, 
  Radio, 
  HelpCircle, 
  BookOpen, 
  Scale, 
  CheckCircle2,
  X
} from "lucide-react";

interface HeaderProps {
  activeTab: "belgeler" | "roportaj" | "yayin";
  setActiveTab: (tab: "belgeler" | "roportaj" | "yayin") => void;
  documentCount: number;
  messageCount: number;
  hasGazete: boolean;
  hasPodcast: boolean;
}

export function Header({
  activeTab,
  setActiveTab,
  documentCount,
  messageCount,
  hasGazete,
  hasPodcast,
}: HeaderProps) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <header className="border-b border-[#d8cfbe] bg-[#fbf8f1]/90 backdrop-blur sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Başlık */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#2c221e] text-[#fbf8f0] flex items-center justify-center shadow-sm">
                <Newspaper className="w-5 h-5 text-[#d4af37]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-[#2c221e] font-serif-vintage">
                    Tarih Muhabiri
                  </h1>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e8deca] text-[#5c4a3e] border border-[#d2c2a8]">
                    1919 Arşivi
                  </span>
                </div>
                <p className="text-xs text-[#705e52]">
                  Birincil Belge Araştırması • Röportaj • 1919 Gazetesi & Podcast
                </p>
              </div>
            </div>

            {/* Bilgi Düğmesi (Mobil) */}
            <button
              onClick={() => setShowGuide(true)}
              className="sm:hidden p-2 text-[#705e52] hover:text-[#2c221e] rounded-lg hover:bg-[#efe7d8] transition-colors"
              title="Kullanım Rehberi"
              aria-label="Kullanım Rehberi"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>

          {/* 3 Ana Bölüm Navigasyonu */}
          <nav className="flex items-center bg-[#eae1cf] p-1 rounded-xl w-full sm:w-auto justify-center border border-[#d6c7b0]">
            <button
              onClick={() => setActiveTab("belgeler")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "belgeler"
                  ? "bg-[#2c221e] text-[#fbf8f0] shadow-xs"
                  : "text-[#5a483e] hover:text-[#2c221e] hover:bg-[#dfd4c0]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. Belgeler</span>
              {documentCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "belgeler" ? "bg-[#d4af37] text-[#2c221e]" : "bg-[#cdbeaa] text-[#423329]"
                }`}>
                  {documentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("roportaj")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "roportaj"
                  ? "bg-[#2c221e] text-[#fbf8f0] shadow-xs"
                  : "text-[#5a483e] hover:text-[#2c221e] hover:bg-[#dfd4c0]"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>2. Röportaj</span>
              {messageCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "roportaj" ? "bg-[#d4af37] text-[#2c221e]" : "bg-[#cdbeaa] text-[#423329]"
                }`}>
                  {messageCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("yayin")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === "yayin"
                  ? "bg-[#2c221e] text-[#fbf8f0] shadow-xs"
                  : "text-[#5a483e] hover:text-[#2c221e] hover:bg-[#dfd4c0]"
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>3. Yayın</span>
              {(hasGazete || hasPodcast) && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              )}
            </button>
          </nav>

          {/* Masaüstü Rehber Butonu */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#5c4a3e] bg-[#ede3d1] hover:bg-[#e2d5bf] border border-[#d8c8af] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Pedagojik Kurallar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pedagojik Kurallar ve Kullanım Rehberi Modalı */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fbf8f1] border-2 border-[#2c221e] rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between pb-4 border-b border-[#d8cfbe]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#2c221e] text-[#d4af37] rounded-lg">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2c221e] font-serif-vintage">
                    Tarih Muhabiri İlke ve Kuralları
                  </h3>
                  <p className="text-xs text-[#756254]">
                    Tarih dersi için nesnel ve birincil kaynak odaklı çalışma metodolojisi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-[#756254] hover:text-[#2c221e] p-1 rounded-lg hover:bg-[#e9dfcc]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs sm:text-sm text-[#45362c] leading-relaxed">
              <div className="flex items-start gap-2.5 bg-[#ede4d2] p-3 rounded-lg border border-[#dacbb1]">
                <CheckCircle2 className="w-4 h-4 text-[#8a6829] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2c221e]">Muhabir Kimliği:</strong> Tarihî kişileri canlandırmaz, onların ağzından konuşmaz. Her zaman 3. şahıs anlatımı kullanır (Örn: &ldquo;Mustafa Kemal Paşa genelgede bildirdi&rdquo;).
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[#ede4d2] p-3 rounded-lg border border-[#dacbb1]">
                <CheckCircle2 className="w-4 h-4 text-[#8a6829] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2c221e]">Yalnızca Yüklenen Belgeler:</strong> Kendi genel tarih bilgisini eklemez. Yalnızca yüklenen 2-3 belgedeki bilgileri aktarır.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[#ede4d2] p-3 rounded-lg border border-[#dacbb1]">
                <CheckCircle2 className="w-4 h-4 text-[#8a6829] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2c221e]">Zorunlu Belge Atfı:</strong> Her cevabın sonunda dayandığı belgeyi belirtir: <code className="bg-[#dfd3bc] px-1.5 py-0.5 rounded text-[#2c221e] font-mono">[Belge 1]</code>.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[#ede4d2] p-3 rounded-lg border border-[#dacbb1]">
                <CheckCircle2 className="w-4 h-4 text-[#8a6829] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2c221e]">Birebir Tırnak İçi Alıntı:</strong> Kişi sözlerini harfiyen tırnak içinde aktarır, belgede olmayan hiçbir söz uydurmaz.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[#ede4d2] p-3 rounded-lg border border-[#dacbb1]">
                <CheckCircle2 className="w-4 h-4 text-[#8a6829] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2c221e]">Belgede Yoksa Dürüst Açıklama:</strong> Sorunun cevabı belgelerde bulunmuyorsa: <em>&ldquo;Bu belgelerde bu sorunun cevabı yok. Ders kitabınızda veya başka bir birincil kaynakta araştırabilirsiniz.&rdquo;</em> diyerek öğrencileri araştırmaya yönlendirir.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-[#ede4d2] p-3 rounded-lg border border-[#dacbb1]">
                <CheckCircle2 className="w-4 h-4 text-[#8a6829] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2c221e]">En Fazla 5 Cümle:</strong> 7-12. sınıf düzeyine uygun, akıcı, pedagojik ve net cümleler kurar.
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#d8cfbe] flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 bg-[#2c221e] text-[#fbf8f0] font-semibold text-xs rounded-lg hover:bg-[#433530] transition-colors"
              >
                Anladım, Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
