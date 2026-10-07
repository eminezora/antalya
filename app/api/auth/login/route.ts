import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { comparePassword, signToken, AUTH_COOKIE_NAME, AuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Lütfen e-posta adresi ve şifrenizi girin." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Kullanıcıyı bul
    const result = await query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = $1 LIMIT 1",
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "E-posta adresi veya şifre hatalı." },
        { status: 401 }
      );
    }

    const dbUser = result.rows[0];

    // 2. Şifreyi doğrula
    const isPasswordValid = await comparePassword(password, dbUser.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "E-posta adresi veya şifre hatalı." },
        { status: 401 }
      );
    }

    const user: AuthUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    };

    // 3. JWT Token üret ve HTTP-only cookie'ye yaz
    const token = await signToken(user);

    const response = NextResponse.json({
      success: true,
      user,
      message: "Giriş başarılı.",
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
    console.error("Giriş API hatası:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Giriş yapılırken bir hata oluştu. Veritabanı bağlantınızı kontrol edin.",
      },
      { status: 500 }
    );
  }
}
