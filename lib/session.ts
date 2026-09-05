import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE_NAME = "poster_admin_session";
const encoder = new TextEncoder();

function secretKey() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("NEXTAUTH_SECRET must be set to at least 32 characters.");
  }
  return encoder.encode(secret);
}

export async function createSessionToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function getSessionUserIdFromToken(token?: string) {
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, secretKey());
    return typeof verified.payload.sub === "string" ? verified.payload.sub : null;
  } catch {
    return null;
  }
}
