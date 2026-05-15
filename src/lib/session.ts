import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.NEXTAUTH_SECRET || "nasabah-secret";
const key = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  userId: number;
  username: string;
  role: string;
  name: string;
  exp: number;
};

export async function encrypt(payload: Omit<SessionPayload, "exp">) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 8; // 8 hours
  return new SignJWT({ ...payload, exp })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(key);
}

export async function decrypt(session: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
      clockTolerance: 60,
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(user: { id: number; username: string; role: string; name: string }) {
  const session = await encrypt({
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  });

  const cookieStore = await cookies();
  cookieStore.set("nasabah-session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("nasabah-session")?.value;
  if (!sessionCookie) return null;
  return decrypt(sessionCookie);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("nasabah-session");
}
