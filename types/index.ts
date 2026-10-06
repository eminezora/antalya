export interface HistoricalDocument {
  id: number;
  title: string;
  text: string;
}

export interface InterviewMessage {
  id: string;
  sender: "student" | "reporter";
  text: string;
  timestamp: string;
  documentRef?: string;
}

export interface NewspaperData {
  gazeteAdi: string;
  dönemTarihi: string;
  sayiNo?: string;
  manset: string;
  spot: string;
  haberMetni: string;
  alintilar: Array<{
    metin: string;
    belge: string;
  }>;
  kontrolSorulari: Array<{
    soru: string;
    beklenenCevap: string;
    dayandigiBelge: string;
  }>;
}

export interface PodcastTurn {
  speaker: "Muhabir" | "Tarihçi";
  text: string;
}

export interface PodcastData {
  title: string;
  synopsis: string;
  turns: PodcastTurn[];
  audioBase64?: string | null;
  audioMimeType?: string;
  ttsNotice?: string | null;
}
