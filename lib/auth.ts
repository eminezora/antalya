import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export const AUTH_COOKIE_NAME = "auth_token";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    "tarih-muhabiri-antalya-secret-key-2026-very-secure"
);

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role?: string;
}

/**
 * Verilen düz metin parolayı bcrypt ile hashler.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Düz metin parola ile hash'i karşılaştırır.
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Kullanıcı için 7 günlük JWT token üretir.
 */
export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "student",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * JWT token'ı doğrular ve kullanıcı bilgilerini döner.
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.id || !payload.email || !payload.name) {
      return null;
    }
    return {
      id: Number(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role ? String(payload.role) : "student",
    };
  } catch {
    return null;
  }
}

/**
 * NextRequest içindeki Cookie veya Authorization Header'dan oturum açmış kullanıcıyı bulur.
 */
export async function getSessionUser(
  req: NextRequest
): Promise<AuthUser | null> {
  // 1. Önce HTTP-only cookie'yi kontrol et
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) {
    const user = await verifyToken(cookieToken);
    if (user) return user;
  }

  // 2. Authorization Header (Bearer token) kontrol et
  const authHeader = req.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const headerToken = authHeader.substring(7).trim();
    if (headerToken) {
      const user = await verifyToken(headerToken);
      if (user) return user;
    }
  }

  return null;
}
