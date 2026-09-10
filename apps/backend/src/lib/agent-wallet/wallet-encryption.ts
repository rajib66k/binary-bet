import crypto from "node:crypto";
import { env } from "../../config/env.js";

const ALGORITHM = "aes-256-gcm";

export function encryptPrivateKey(privateKey: string): string {
    const key = Buffer.from(env.agentWalletEncryptionKey, 'hex');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
        cipher.update(privateKey, "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decryptPrivateKey(encryptedData: string): string {
    const key = Buffer.from(env.agentWalletEncryptionKey, 'hex');
    const [ivHex, authTagHex, encryptedHex] = encryptedData.split(":");

    if (!ivHex || !authTagHex || !encryptedHex) {
        throw new Error("Invalid encrypted private key format");
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedHex, "hex")),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}
