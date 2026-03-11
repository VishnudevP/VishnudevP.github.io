import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_token";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-dev-secret-change-in-prod"
);

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function isAuthenticated() {
  const token = await getAdminToken();
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload !== null;
}

export { COOKIE_NAME };
