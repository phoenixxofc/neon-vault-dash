export const validateEnv = () => {
  const required = ['VITE_RPC_URL'];
  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn(`[SYSTEM] Missing recommended environment variables: ${missing.join(', ')}`);
    console.warn(`[SYSTEM] Falling back to default provider for ${missing.join(', ')}`);
  } else {
    console.log("[SYSTEM] Environment variables validated successfully.");
  }
};
