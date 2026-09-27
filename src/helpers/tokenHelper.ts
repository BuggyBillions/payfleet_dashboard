import { base64url, EncryptJWT, jwtDecrypt } from 'jose';


// Convert the hex string into a raw 32-byte (256-bit) Uint8Array
const SECRET_KEY = base64url.decode(import.meta.env.VITE_ENCRYPT_HELPER_SECRET_KEY);


// Encrypt a token payload
export const encryptToken = async (token: string, expiresInMinutes = 5) => {
  try {
    return await new EncryptJWT({ token })
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setIssuedAt()
      .setExpirationTime(`${expiresInMinutes}m`)
      .encrypt(SECRET_KEY);
  } catch (err) {
    console.error("Failed to generate secure token", err);
    return null;
  }
};

// Decrypt token, check expiry automatically
export const decryptToken = async (jwtToken: string) => {
  try {
    const { payload } = await jwtDecrypt(jwtToken, SECRET_KEY);
    return payload.token;
  } catch (err: any) {
    // jose automatically handles validation errors
    if (err.code === 'ERR_JWT_EXPIRED') {
      console.warn("Token expired");
    } else {
      console.error("Token is invalid or tampered", err.code);
    }
    return null;
  }
};
