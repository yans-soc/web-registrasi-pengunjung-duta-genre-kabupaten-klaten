import crypto from "crypto";

function getSignatureSecret(): string {
  const signatureSecret = process.env.SIGNATURE_SECRET;
  if (!signatureSecret && (process.env.NODE_ENV === "production" || process.env.APP_ENV === "production" || process.env.APP_ENV === "staging")) {
    throw new Error("SIGNATURE_SECRET is required in production/staging environments.");
  }
  return signatureSecret || "klaten-duta-genre-signature-key-2026";
}

export function generateTicketSignature(ticketCode: string, name: string, status: string): string {
  const data = `${ticketCode}:${name}:${status}`;
  return crypto
    .createHmac("sha256", getSignatureSecret())
    .update(data)
    .digest("hex");
}

export function verifyTicketSignature(ticketCode: string, name: string, status: string, signature: string): boolean {
  try {
    const expectedSignature = generateTicketSignature(ticketCode, name, status);
    const buf1 = Buffer.from(expectedSignature, "hex");
    const buf2 = Buffer.from(signature, "hex");
    if (buf1.length !== buf2.length) return false;
    return crypto.timingSafeEqual(buf1, buf2);
  } catch {
    return false;
  }
}

export function generateQRPayloadSignature(visitorId: number, uniqueCode: string, status: string): string {
  const data = `${visitorId}:${uniqueCode}:${status}`;
  return crypto
    .createHmac("sha256", getSignatureSecret())
    .update(data)
    .digest("hex");
}

export function verifyQRPayloadSignature(visitorId: number, uniqueCode: string, status: string, signature: string): boolean {
  try {
    const expectedSignature = generateQRPayloadSignature(visitorId, uniqueCode, status);
    const buf1 = Buffer.from(expectedSignature, "hex");
    const buf2 = Buffer.from(signature, "hex");
    if (buf1.length !== buf2.length) return false;
    return crypto.timingSafeEqual(buf1, buf2);
  } catch {
    return false;
  }
}
