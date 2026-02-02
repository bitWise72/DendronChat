import crypto from "crypto"
import "dotenv/config"

const ALGORITHM = "aes-256-gcm"

function getKey() {
    const keyMap = process.env.JWT_SECRET as string
    if (!keyMap) {
        throw new Error("JWT_SECRET is not defined in environment variables")
    }
    // Ensure key is 32 bytes (256 bits) for aes-256-gcm
    // If the secret is simpler, we can hash it to get a consistent 32-byte key
    return crypto.createHash('sha256').update(keyMap).digest()
}

export function encrypt(text: string) {
    const iv = crypto.randomBytes(16)
    const key = getKey()
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
    const tag = cipher.getAuthTag()
    return iv.toString("hex") + ":" + encrypted.toString("hex") + ":" + tag.toString("hex")
}

export function decrypt(data: string) {
    const parts = data.split(":")
    if (parts.length !== 3) {
        throw new Error("Invalid encrypted data format. Expected iv:content:tag")
    }
    const iv = Buffer.from(parts.shift()!, "hex")
    const encrypted = Buffer.from(parts.shift()!, "hex")
    const tag = Buffer.from(parts.shift()!, "hex")

    const key = getKey()
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString("utf8")
}
