import crypto from "crypto";

const algorithm = "aes-256-cbc";
const secretKey = "12345678901234567890123456789012"; // 32-char key

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(encryptedText: string): string {
  const [ivHex, encryptedDataHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedTextBuf = Buffer.from(encryptedDataHex, "hex");

  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey),
    iv
  );
  let decrypted = decipher.update(encryptedTextBuf);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

export { encrypt, decrypt };

// const encryptData = encrypt("oluwatobi");
// console.log(encryptData);
// console.log(decrypt(encryptData));
