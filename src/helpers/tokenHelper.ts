import { base64url, EncryptJWT, jwtDecrypt } from 'jose';
import { toast } from 'sonner';


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
export const decryptToken = async (jwtToken: string): Promise<string | null> => {
  try {
    const { payload } = await jwtDecrypt(jwtToken, SECRET_KEY);
    toast.info(JSON.stringify(payload, null, 2))
    return (payload.token as string) || null;
  } catch (err: unknown) {
    const errorObj = err as { code?: string };
    // jose automatically handles validation errors
    if (errorObj?.code === 'ERR_JWT_EXPIRED') {
      console.warn("Token expired");
      toast.error("expired")
    } else {
      console.error("Token is invalid or tampered", errorObj?.code);
    }
    return null;
  }
};
