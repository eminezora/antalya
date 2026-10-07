"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  GraduationCap 
} from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    register,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authModalMode === "register") {
      if (!name.trim()) {
        setError("Lütfen ad ve soyadınızı girin.");
        return;
      }
      if (password !== passwordConfirm) {
        setError("Şifreler birbiriyle uyuşmuyor.");
        return;
      }
      if (password.length < 6) {
        setError("Şifreniz en az 6 karakter olmalıdır.");
        return;
      }

      setIsSubmitting(true);
      const res = await register(name, email, password);
      setIsSubmitting(false);

      if (!res.success) {
        setError(res.error || "Kayıt işlemi başarısız oldu.");
      } else {
        setName("");
        setEmail("");
        setPassword("");
        setPasswordConfirm("");
      }
    } else {
      if (!email.trim() || !password) {
        setError("Lütfen e-posta ve şifrenizi girin.");
        return;
      }

      setIsSubmitting(true);
      const res = await login(email, password);
      setIsSubmitting(false);

      if (!res.success) {
        setError(res.error || "Giriş yapılamadı.");
      } else {
        setEmail("");
        setPassword("");
      }
    }
  };

  const switchMode = (mode: "login" | "register") => {
    setError(null);
    setAuthModalMode(mode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#fbf8f1] border-2 border-[#2c221e] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat Düğmesi */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-[#756254] hover:text-[#2c221e] p-1.5 rounded-lg hover:bg-[#e9dfcc] transition-colors"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Başlık ve Rozet */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#2c221e] text-[#d4af37] flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2c221e] font-serif-vintage">
              {authModalMode === "login" ? "Tarih Muhabiri Girişi" : "Yeni Hesap Oluştur"}
            </h3>
            <p className="text-xs text-[#756254]">
              {authModalMode === "login"
                ? "Atölye çalışmalarına ve arşivinize erişin"
                : "Öğrenci veya öğretmen hesabı ile başlayın"}
            </p>
          </div>
        </div>

        {/* Sekme Değiştirici */}
        <div className="flex p-1 bg-[#eae1cf] rounded-xl border border-[#d6c7b0] mb-5">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              authModalMode === "login"
                ? "bg-[#2c221e] text-[#fbf8f0] shadow-xs"
                : "text-[#5a483e] hover:text-[#2c221e]"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Giriş Yap</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              authModalMode === "register"
                ? "bg-[#2c221e] text-[#fbf8f0] shadow-xs"
                : "text-[#5a483e] hover:text-[#2c221e]"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Kayıt Ol</span>
          </button>
        </div>

        {/* Hata Uyarısı */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-2.5 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {authModalMode === "register" && (
            <div>
              <label className="block text-[#43352c] font-semibold mb-1">
                Ad Soyad
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8a7667] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Cihan Şimşek"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#d2c3aa] bg-[#fdfbf7] text-[#2c221e] focus:outline-hidden focus:border-[#2c221e] focus:ring-1 focus:ring-[#2c221e]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[#43352c] font-semibold mb-1">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8a7667] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@okul.k12.tr"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#d2c3aa] bg-[#fdfbf7] text-[#2c221e] focus:outline-hidden focus:border-[#2c221e] focus:ring-1 focus:ring-[#2c221e]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#43352c] font-semibold mb-1">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8a7667] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#d2c3aa] bg-[#fdfbf7] text-[#2c221e] focus:outline-hidden focus:border-[#2c221e] focus:ring-1 focus:ring-[#2c221e]"
              />
            </div>
          </div>

          {authModalMode === "register" && (
            <div>
              <label className="block text-[#43352c] font-semibold mb-1">
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8a7667] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#d2c3aa] bg-[#fdfbf7] text-[#2c221e] focus:outline-hidden focus:border-[#2c221e] focus:ring-1 focus:ring-[#2c221e]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#2c221e] text-[#fbf8f0] font-semibold hover:bg-[#433530] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                <span>İşlem yapılıyor...</span>
              </>
            ) : authModalMode === "login" ? (
              <>
                <LogIn className="w-4 h-4 text-[#d4af37]" />
                <span>Giriş Yap</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                <span>Hesabımı Oluştur</span>
              </>
            )}
          </button>
        </form>

        {/* Alt Bilgi */}
        <div className="mt-5 pt-4 border-t border-[#d8cfbe] text-center text-[11px] text-[#786658]">
          {authModalMode === "login" ? (
            <span>
              Hesabınız yok mu?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="font-bold text-[#2c221e] hover:underline"
              >
                Hemen Kayıt Olun
              </button>
            </span>
          ) : (
            <span>
              Zaten hesabınız var mı?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-bold text-[#2c221e] hover:underline"
              >
                Giriş Yapın
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
