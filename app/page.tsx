"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { DocumentSection } from "@/components/DocumentSection";
import { InterviewSection } from "@/components/InterviewSection";
import { PublicationSection } from "@/components/PublicationSection";
import { HistoricalDocument, InterviewMessage, NewspaperData, PodcastData } from "@/types";
import { SAMPLE_PRESETS } from "@/lib/sampleDocuments";
import { 
  FileText, 
  MessageSquare, 
  Newspaper, 
  Radio, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"belgeler" | "roportaj" | "yayin">("belgeler");

  // Initialize with Amasya 1919 preset by default for instant readiness
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

  return (
    <div className="min-h-screen bg-[#f7f4ec] flex flex-col justify-between text-[#2c221e]">
      {/* Üst Menü */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documentCount={documents.length}
        messageCount={messages.length}
        hasGazete={!!newspaperData}
        hasPodcast={!!podcastData}
      />

      {/* Ana İçerik */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 w-full flex-1">
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
                onClick={() => setActiveTab("belgeler")}
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
                onClick={() => setActiveTab("roportaj")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === "roportaj"
                    ? "bg-[#2c221e] text-[#fbf8f0]"
                    : "bg-[#e2d5be] text-[#544133] hover:bg-[#d6c7ac]"
                }`}
              >
                <span>2. Röportaj</span>
              </button>
              <span className="text-[#9e8b7c]">→</span>
              <button
                onClick={() => setActiveTab("yayin")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === "yayin"
                    ? "bg-[#2c221e] text-[#fbf8f0]"
                    : "bg-[#e2d5be] text-[#544133] hover:bg-[#d6c7ac]"
                }`}
              >
                <span>3. Gazete & Podcast</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sekme İçerikleri */}
        {activeTab === "belgeler" && (
          <DocumentSection
            documents={documents}
            setDocuments={setDocuments}
            onProceedToInterview={() => setActiveTab("roportaj")}
          />
        )}

        {activeTab === "roportaj" && (
          <InterviewSection
            documents={documents}
            messages={messages}
            setMessages={setMessages}
            onGoToGazete={() => {
              setActiveTab("yayin");
            }}
            onGoToPodcast={() => {
              setActiveTab("yayin");
            }}
          />
        )}

        {activeTab === "yayin" && (
          <PublicationSection
            documents={documents}
            messages={messages}
            newspaperData={newspaperData}
            setNewspaperData={setNewspaperData}
            podcastData={podcastData}
            setPodcastData={setPodcastData}
          />
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
