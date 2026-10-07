import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword, signToken, AUTH_COOKIE_NAME, AuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Lütfen geçerli bir ad ve soyad girin (en az 2 karakter)." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Lütfen geçerli bir e-posta adresi girin." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Şifreniz en az 6 karakterden oluşmalıdır." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 1. E-posta adresi zaten kayıtlı mı kontrol et
    const existing = await query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [cleanEmail]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Bu e-posta adresi ile zaten bir hesap oluşturulmuş." },
        { status: 409 }
      );
    }

    // 2. Şifreyi hashle ve yeni kullanıcıyı kaydet
    const passwordHash = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'student')
       RETURNING id, name, email, role`,
      [cleanName, cleanEmail, passwordHash]
    );

    const newUser: AuthUser = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      role: result.rows[0].role,
    };

    // 3. JWT Token üret ve HTTP-only cookie'ye yaz
    const token = await signToken(newUser);

    const response = NextResponse.json({
      success: true,
      user: newUser,
      message: "Kayıt işlemi başarıyla tamamlandı.",
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 gün
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Kayıt API hatası:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Kayıt işlemi sırasında bir hata oluştu. Veritabanı bağlantınızı kontrol edin.",
      },
      { status: 500 }
    );
  }
}
