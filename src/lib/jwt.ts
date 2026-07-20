import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "klaten-duta-genre-super-secret-key-2026";

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

const ISSUER = "duta-genre-klaten";
const AUDIENCE = "duta-genre-admin";

export interface JwtPayload {
  id: number;
  username: string;
  name: string;
  role: string;
  [key: string]: unknown;
}

/**
 * Sign a JWT token using jose (Edge-compatible, same lib as middleware).
 */
export async function signJWT(
  payload: Omit<JwtPayload, "iat" | "exp" | "iss" | "aud">,
  expiryInSeconds: number = 24 * 60 * 60
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${expiryInSeconds}s`)
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT token. Returns the decoded payload or null if invalid/expired.
 */
export async function verifyJWT(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}