import { describe, it, expect, beforeAll } from "vitest";
import { encryptCredential, decryptCredential } from "./crypto";

describe("Credential Encryption", () => {
  it("should encrypt and decrypt a credential", () => {
    const original = "my-secret-api-key";
    const encrypted = encryptCredential(original);
    const decrypted = decryptCredential(encrypted);

    expect(decrypted).toBe(original);
  });

  it("should produce different ciphertexts for the same plaintext", () => {
    const original = "my-secret-api-key";
    const encrypted1 = encryptCredential(original);
    const encrypted2 = encryptCredential(original);

    // Due to random IV, ciphertexts should be different
    expect(encrypted1).not.toBe(encrypted2);

    // But both should decrypt to the same value
    expect(decryptCredential(encrypted1)).toBe(original);
    expect(decryptCredential(encrypted2)).toBe(original);
  });

  it("should handle long credentials", () => {
    const original = "a".repeat(500);
    const encrypted = encryptCredential(original);
    const decrypted = decryptCredential(encrypted);

    expect(decrypted).toBe(original);
  });

  it("should handle special characters", () => {
    const original = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`";
    const encrypted = encryptCredential(original);
    const decrypted = decryptCredential(encrypted);

    expect(decrypted).toBe(original);
  });

  it("should throw on invalid encrypted format", () => {
    expect(() => decryptCredential("invalid")).toThrow();
    expect(() => decryptCredential("invalid:format")).toThrow();
  });
});
