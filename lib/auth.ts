import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";

const COOKIE_NAME = "bms_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 hari

export type Role = "ADMIN" | "TEKNISI";
export type SessionUser = { id: number; name: string; username: string; role: Role };

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET belum diisi di .env (minimal 32 karakter).");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: number): Promise<void> {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  let uid: unknown;
  try {
    ({ payload: { uid } } = await jwtVerify(token, secretKey()));
  } catch {
    return null;
  }
  if (typeof uid !== "number") return null;
  // Selalu cek ke database agar akun yang dinonaktifkan langsung tidak bisa masuk.
  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user || !user.active) return null;
  return { id: user.id, name: user.name, username: user.username, role: user.role as Role };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
