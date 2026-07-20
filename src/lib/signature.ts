import crypto from "crypto";

const SIGNATURE_SECRET = process.env.SIGNATURE_SECRET || "klaten-duta-genre-signature-key-2026";

export function generateTicketSignature(ticketCode: string, name: string, status: string): string {
  const data = `${ticketCode}:${name}:${status}`;
  return crypto
    .createHmac("sha256", SIGNATURE_SECRET)
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

// New: generate signature using unique_code & uuid
export function generateQRPayloadSignature(visitorId: number, uniqueCode: string, status: string): string {
  const data = `${visitorId}:${uniqueCode}:${status}`;
  return crypto
    .createHmac("sha256", SIGNATURE_SECRET)
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