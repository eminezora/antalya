import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    return NextResponse.json({
      user,
    });
  } catch (error: any) {
    console.error("Auth me API hatası:", error);
    return NextResponse.json({ user: null });
  }
}
