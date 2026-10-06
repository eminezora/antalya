"use client";

import React from "react";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  BookOpenCheck
} from "lucide-react";
import { HistoricalDocument } from "@/types";
import { SAMPLE_PRESETS, DocumentPreset } from "@/lib/sampleDocuments";

interface DocumentSectionProps {
  documents: HistoricalDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<HistoricalDocument[]>>;
  onProceedToInterview: () => void;
}

export function DocumentSection({
  documents,
  setDocuments,
  onProceedToInterview,
}: DocumentSectionProps) {

  // Load a preset
  const handleLoadPreset = (preset: DocumentPreset) => {
    setDocuments(
      preset.documents.map((d) => ({
        id: d.id,
        title: d.title,
        text: d.text,
      }))
    );
  };

  // Add document
  const handleAddDocument = () => {
    if (documents.length >= 4) return;
    const nextId = documents.length + 1;
    setDocuments([
      ...documents,
      {
        id: nextId,
        title: `Belge ${nextId} Başlığı`,
        text: "",
      },
    ]);
  };

  // Remove document
  const handleRemoveDocument = (id: number) => {
    if (documents.length <= 1) return;
    const filtered = documents.filter((d) => d.id !== id);
    // Re-index remaining
    const reindexed = filtered.map((d, index) => ({
      ...d,
      id: index + 1,
    }));
    setDocuments(reindexed);
  };

  // Update document content
  const handleUpdate = (id: number, field: "title" | "text", value: string) => {
    setDocuments(
      documents.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  // Reset to empty
  const handleReset = () => {
    setDocuments([
      { id: 1, title: "Belge 1: Metin Başlığı", text: "" },
      { id: 2, title: "Belge 2: Metin Başlığı", text: "" },
    ]);
  };

  const totalWords = documents.reduce((acc, curr) => {
    const words = curr.text.trim() ? curr.text.trim().split(/\s+/).length : 0;
    return acc + words;
  }, 0);

  const hasContent = documents.some((d) => d.text.trim().length > 20);

  return (
    <div className="space-y-6">
      {/* Üst Bilgi ve Hazır Setler Kutusu */}
      <div className="bg-[#f5ede0] border border-[#d8c8af] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2c221e] text-[#fbf8f0] text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-lg font-bold text-[#2c221e] font-serif-vintage">
                Tarihî Belgeleri Yükleme Masası
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#614e41] mt-1">
              Öğretmen olarak 2-3 birincil belgeyi yapıştırın veya sınıf dersi için hazır örnek setlerden birini seçin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#6e5849] hover:text-[#2c221e] hover:bg-[#ebdcc7] border border-[#dbccb4] flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sıfırla</span>
            </button>
            <div className="text-xs font-semibold px-3 py-1.5 bg-[#ebdcc7] text-[#423328] rounded-lg border border-[#d8c7ad] flex items-center gap-1.5">
              <BookOpenCheck className="w-3.5 h-3.5 text-[#8a6829]" />
              <span>{documents.length} Belge • {totalWords} Kelime</span>
            </div>
          </div>
        </div>

        {/* Hazır Örnek Belge Seçici */}
        <div className="mt-4 pt-4 border-t border-[#dfcfb7]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#574438] uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#b8860b]" />
            <span>Sınıf İçi Hızlı Ders Setleri (1 Tıklamayla Yükle):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleLoadPreset(preset)}
                className="text-left p-3 rounded-xl bg-[#fcfaf5] hover:bg-[#ffffff] border border-[#dccbb2] hover:border-[#b8860b] shadow-2xs hover:shadow-xs transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#8a6829] font-mono">
                    {preset.era}
                  </span>
                  <span className="text-[10px] bg-[#ede0cc] text-[#4d3c30] px-1.5 py-0.5 rounded font-medium">
                    {preset.documents.length} Belge
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#2c221e] mt-1 group-hover:text-[#8a6829] transition-colors line-clamp-1">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-[#736052] mt-0.5 line-clamp-2">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Belge Kartları Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc, idx) => (
          <div
            key={doc.id}
            className="bg-[#fcfaf6] border-2 border-[#d8cbba] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#bda890] transition-colors relative"
          >
            <div>
              {/* Belge Başlığı & Etiketi */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#e5d9c7]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#2c221e] text-[#fbf8f0] rounded text-xs font-bold font-mono">
                    Belge {idx + 1}:
                  </span>
                  <span className="text-xs text-[#705e52] font-medium">
                    Birincil Kaynak
                  </span>
                </div>

                {documents.length > 2 && (
                  <button
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="p-1 text-[#937b6c] hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Bu Belgeyi Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Başlık Alanı */}
              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-[#665345] mb-1">
                  Belge Adı / Kaynağı:
                </label>
                <input
                  type="text"
                  value={doc.title}
                  onChange={(e) => handleUpdate(doc.id, "title", e.target.value)}
                  placeholder={`Örn: Belge ${idx + 1}: Dahiliye Nezareti Telgrafı`}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-[#f6eee2] border border-[#d6c5af] rounded-lg text-[#2c221e] focus:outline-hidden focus:ring-1 focus:ring-[#8a6829]"
                />
              </div>

              {/* Metin Alanı */}
              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-[#665345] mb-1">
                  Belge Metni (Öğretmen Girişi):
                </label>
                <textarea
                  value={doc.text}
                  onChange={(e) => handleUpdate(doc.id, "text", e.target.value)}
                  placeholder={`Belge ${idx + 1} metnini buraya yapıştırın veya yazın... (Örn: "Vatanın bütünlüğü tehlikededir...")`}
                  rows={9}
                  className="w-full text-xs sm:text-[13px] leading-relaxed p-3 bg-[#fdfbf7] border border-[#d6c5af] rounded-xl text-[#2c221e] font-serif-vintage focus:outline-hidden focus:ring-1 focus:ring-[#8a6829] resize-none"
                />
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-[#ede3d1] flex items-center justify-between text-[11px] text-[#7d695b]">
              <span>
                {doc.text.trim() ? doc.text.trim().split(/\s+/).length : 0} kelime
              </span>
              <span className="font-mono text-[10px] text-[#937b6c]">
                [Belge {idx + 1}]
              </span>
            </div>
          </div>
        ))}

        {/* Belge Ekle Kartı (Maksimum 4 belgeye kadar) */}
        {documents.length < 4 && (
          <button
            onClick={handleAddDocument}
            className="border-2 border-dashed border-[#cdbea8] rounded-2xl p-6 min-h-[300px] flex flex-col items-center justify-center gap-3 text-[#7d695b] hover:text-[#2c221e] hover:border-[#8a6829] hover:bg-[#f6efe4] transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#ede1ce] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-6 h-6 text-[#7d695b] group-hover:text-[#2c221e]" />
            </div>
            <div className="text-center">
              <span className="text-sm font-bold block">
                + Belge {documents.length + 1} Ekle
              </span>
              <span className="text-xs text-[#8e7a6c] mt-0.5 block">
                Yeni birincil kaynak veya karşı belge ekleyin
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Alt Aksiyon Butonu */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#ede3cf] border border-[#d8c8af]">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#4d3c30]">
          <FileText className="w-4 h-4 text-[#8a6829] shrink-0" />
          <span>
            {hasContent
              ? "Belgeler hazır. Muhabir yalnızca bu belgelerdeki bilgilerle soruları cevaplayacaktır."
              : "Lütfen en az bir belge metni girin veya hazır setlerden birini yükleyin."}
          </span>
        </div>

        <button
          onClick={onProceedToInterview}
          disabled={!hasContent}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all ${
            hasContent
              ? "bg-[#2c221e] text-[#fbf8f0] hover:bg-[#433530] hover:translate-x-0.5 cursor-pointer"
              : "bg-[#d4c5ae] text-[#857463] cursor-not-allowed"
          }`}
        >
          <span>2. Röportaj Bölümüne Geç</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
