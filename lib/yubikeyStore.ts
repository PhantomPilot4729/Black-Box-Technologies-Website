// Simple in-memory store for demo. Replace with DB in production.
export const yubiCredentials: Record<string, any> = {};

export function saveYubiCredential(userId: string, credential: any) {
  yubiCredentials[userId] = credential;
}

export function getYubiCredential(userId: string) {
  return yubiCredentials[userId];
}
