import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

// Encrypts sensitive personal fields (e.g. Aadhaar) at rest with AES-256-GCM.
// The key lives only in .env (DATA_ENCRYPTION_KEY, 64 hex chars), never in the
// database, so a leaked DB dump or backup alone does not expose the values.

function getKey(): Buffer {
  const hex = process.env.DATA_ENCRYPTION_KEY;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("DATA_ENCRYPTION_KEY is missing or invalid. It must be 64 hex characters in .env.");
  }
  return Buffer.from(hex, "hex");
}

export function encryptField(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64"), tag.toString("base64"), ct.toString("base64")].join(":");
}

export function decryptField(stored: string): string {
  const [version, iv, tag, ct] = stored.split(":");
  if (version !== "v1" || !iv || !tag || !ct) {
    throw new Error("Unrecognised encrypted value format.");
  }
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(ct, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

// Deterministic keyed hash, so "is this number already registered?" still
// works (unique index) without being able to read the number back from it.
export function hashField(plain: string): string {
  return createHmac("sha256", getKey()).update(`aadhar:${plain}`).digest("hex");
}

export function maskAadhar(plain: string | null | undefined): string {
  if (!plain) return "—";
  return `XXXX XXXX ${plain.slice(-4)}`;
}
