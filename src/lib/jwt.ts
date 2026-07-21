import { SignJWT, jwtVerify } from "jose";

const ISSUER = "duta-genre-klaten";
const AUDIENCE = "duta-genre-admin";

export interface JwtPayload {
  id: number;
  username: string;
  name: string;
  role: string;
  [key: string]: unknown;
}

function getJwtSecret(): Uint8Array {
  const secretString = process.env.JWT_SECRET;
  if (!secretString && (process.env.NODE_ENV === "production" || process.env.APP_ENV === "production" || process.env.APP_ENV === "staging")) {
    throw new Error("JWT_SECRET is required in production/staging environments.");
  }
  return new TextEncoder().encode(secretString || "klaten-duta-genre-super-secret-key-2026");
}

export async function signJWT(
  payload: Omit<JwtPayload, "iat" | "exp" | "iss" | "aud">,
  expiryInSeconds: number = 24 * 60 * 60
): Promise<string> {
  const secret = getJwtSecret();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${expiryInSeconds}s`)
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<JwtPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
