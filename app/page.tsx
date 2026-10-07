"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { DocumentSection } from "@/components/DocumentSection";
import { InterviewSection } from "@/components/InterviewSection";
import { PublicationSection } from "@/components/PublicationSection";
import { HistoricalDocument, InterviewMessage, NewspaperData, PodcastData } from "@/types";
import { SAMPLE_PRESETS } from "@/lib/sampleDocuments";
import { useAuth } from "@/context/AuthContext";
import { 
  FileText, 
  MessageSquare, 
  Newspaper, 
  Radio, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert,
  GraduationCap,
  Lock,
  LogIn,
  UserPlus
} from "lucide-react";

export default function Home() {
  const { user, openAuthModal, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"belgeler" | "roportaj" | "yayin">("belgeler");

  // Varsayılan olarak Amasya 1919 hazır şablonu ile başlat
  const [documents, setDocuments] = useState<HistoricalDocument[]>(() => {
    const preset = SAMPLE_PRESETS[0];
    return preset.documents.map((d) => ({
      id: d.id,
      title: d.title,
      text: d.text,
    }));
  });

  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [newspaperData, setNewspaperData] = useState<NewspaperData | null>(null);
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);

  const handleTabChange = (tab: "belgeler" | "roportaj" | "yayin") => {
    if (tab !== "belgeler" && !user) {
      openAuthModal("login");
    }
    setActiveTab(tab);
  };

  const handleProceedToInterview = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setActiveTab("roportaj");
  };

  return (
    <div className="min-h-screen bg-[#f7f4ec] flex flex-col justify-between text-[#2c221e]">
      {/* Üst Menü */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        documentCount={documents.length}
        messageCount={messages.length}
        hasGazete={!!newspaperData}
        hasPodcast={!!podcastData}
      />

      {/* Ana İçerik */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 w-full flex-1">
        {/* Giriş Durumu Bilgilendirme Bandı */}
        {!isLoading && (
          !user ? (
            <div className="mb-5 bg-[#fff8e8] border border-[#e6d0a7] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs no-print">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8a6829]/15 text-[#8a6829] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#3d2f24]">
                    Misafir Modu: Sistem Özellikleri Giriş Gerektirir
                  </h3>
                  <p className="text-xs text-[#735e4d]">
                    Tarihî belgeleri önizleyebilirsiniz. Röportaj yapmak, 1919 gazetesi basmak ve podcast üretmek için oturum açmanız gerekmektedir.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => openAuthModal("login")}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#2c221e] text-[#fbf8f0] rounded-lg hover:bg-[#433530] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Giriş Yap</span>
                </button>
                <button
                  onClick={() => openAuthModal("register")}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#eae0cf] text-[#423328] border border-[#d6c6ad] rounded-lg hover:bg-[#decbb4] transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#8a6829]" />
                  <span>Kayıt Ol</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-5 bg-[#edf7ee] border border-[#c4e3c6] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-[#245229] no-print">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Oturum Açık: <strong>{user.name}</strong> ({user.email}) — Tüm atölye özellikleri kullanıma hazır.
                </span>
              </div>
            </div>
          )
        )}

        {/* Adım Göstergesi / Süreç Kartı */}
        <div className="mb-6 bg-[#efe5d3] border border-[#d8c8af] rounded-2xl p-4 sm:p-5 shadow-2xs no-print">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2c221e] text-[#d4af37] flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#2c221e] font-serif-vintage">
                  Tarih Dersi Birincil Belge & Röportaj Atölyesi
                </h2>
                <p className="text-xs text-[#6e584a]">
                  Öğrenciler doğrudan tarihin vesikalarını inceler, muhabire soru sorar ve 1919 gazetesini basar.
                </p>
              </div>
            </div>

            {/* 3 Aşamalı Akış Rozetleri */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => handleTabChange("belgeler")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === "belgeler"
                    ? "bg-[#2c221e] text-[#fbf8f0]"
                    : "bg-[#e2d5be] text-[#544133] hover:bg-[#d6c7ac]"
                }`}
              >
                <span>1. Belgeler</span>
              </button>
              <span className="text-[#9e8b7c]">→</span>
              <button
                onClick={() => handleTabChange("roportaj")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === "roportaj"
                    ? "bg-[#2c221e] text-[#fbf8f0]"
                    : "bg-[#e2d5be] text-[#544133] hover:bg-[#d6c7ac]"
                }`}
              >
                <span>2. Röportaj</span>
                {!user && <Lock className="w-3 h-3 text-[#967d6c]" />}
              </button>
              <span className="text-[#9e8b7c]">→</span>
              <button
                onClick={() => handleTabChange("yayin")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === "yayin"
                    ? "bg-[#2c221e] text-[#fbf8f0]"
                    : "bg-[#e2d5be] text-[#544133] hover:bg-[#d6c7ac]"
                }`}
              >
                <span>3. Gazete & Podcast</span>
                {!user && <Lock className="w-3 h-3 text-[#967d6c]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sekme İçerikleri */}
        {activeTab === "belgeler" && (
          <DocumentSection
            documents={documents}
            setDocuments={setDocuments}
            onProceedToInterview={handleProceedToInterview}
          />
        )}

        {activeTab === "roportaj" && (
          !user ? (
            <div className="bg-[#fbf8f1] border-2 border-[#2c221e] rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-md">
              <div className="w-16 h-16 rounded-2xl bg-[#2c221e] text-[#d4af37] flex items-center justify-center mx-auto mb-4 shadow-md">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif-vintage text-[#2c221e] mb-2">
                Röportaj Atölyesi Giriş Gerektirir
              </h3>
              <p className="text-xs sm:text-sm text-[#6e584a] max-w-lg mx-auto mb-6 leading-relaxed">
                Birincil tarihî belgeler ışığında yapay zeka tarih muhabirine soru sormak, belgeleri sorgulamak ve araştırma yürütmek için lütfen öğrenci veya öğretmen hesabınızla giriş yapın.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => openAuthModal("login")}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#2c221e] text-[#fbf8f0] font-semibold text-xs sm:text-sm rounded-xl hover:bg-[#433530] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#d4af37]" />
                  <span>Giriş Yap</span>
                </button>
                <button
                  onClick={() => openAuthModal("register")}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#efe5d3] text-[#2c221e] border border-[#d8c8af] font-semibold text-xs sm:text-sm rounded-xl hover:bg-[#e4d6be] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#8a6829]" />
                  <span>Yeni Hesap Oluştur (Ücretsiz)</span>
                </button>
              </div>
            </div>
          ) : (
            <InterviewSection
              documents={documents}
              messages={messages}
              setMessages={setMessages}
              onGoToGazete={() => setActiveTab("yayin")}
              onGoToPodcast={() => setActiveTab("yayin")}
            />
          )
        )}

        {activeTab === "yayin" && (
          !user ? (
            <div className="bg-[#fbf8f1] border-2 border-[#2c221e] rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-md">
              <div className="w-16 h-16 rounded-2xl bg-[#2c221e] text-[#d4af37] flex items-center justify-center mx-auto mb-4 shadow-md">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif-vintage text-[#2c221e] mb-2">
                Gazete & Podcast Yayını Giriş Gerektirir
              </h3>
              <p className="text-xs sm:text-sm text-[#6e584a] max-w-lg mx-auto mb-6 leading-relaxed">
                İncelenen belgelerden ve yapılan röportajlardan 1919 tarihli manşet gazetesi basmak ve sesli radyo tiyatrosu podcast&apos;i üretmek için lütfen hesabınıza giriş yapın.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => openAuthModal("login")}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#2c221e] text-[#fbf8f0] font-semibold text-xs sm:text-sm rounded-xl hover:bg-[#433530] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#d4af37]" />
                  <span>Giriş Yap</span>
                </button>
                <button
                  onClick={() => openAuthModal("register")}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#efe5d3] text-[#2c221e] border border-[#d8c8af] font-semibold text-xs sm:text-sm rounded-xl hover:bg-[#e4d6be] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#8a6829]" />
                  <span>Yeni Hesap Oluştur (Ücretsiz)</span>
                </button>
              </div>
            </div>
          ) : (
            <PublicationSection
              documents={documents}
              messages={messages}
              newspaperData={newspaperData}
              setNewspaperData={setNewspaperData}
              podcastData={podcastData}
              setPodcastData={setPodcastData}
            />
          )
        )}
      </main>

      {/* Alt Bilgi (Footer) */}
      <footer className="border-t border-[#d8cfbe] bg-[#ede3d1]/80 py-5 text-center text-xs text-[#705e50] no-print mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8a6829]" />
            <span className="font-semibold text-[#423328]">
              Tarih Muhabiri Pedagojik Güvenlik:
            </span>
            <span>Kişisel veri toplanmaz, tarihî canlandırma yapılmaz, yalnızca birincil belgeler aktarılır.</span>
          </div>

          <div className="text-[11px] text-[#877465]">
            Model: <span className="font-mono font-bold text-[#423328]">Gemini 3.8 Flash</span> • Ses: <span className="font-mono font-bold text-[#423328]">Gemini TTS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
