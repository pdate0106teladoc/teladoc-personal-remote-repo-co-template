// Utility to verify presence of auth tokens in sessionStorage with a 2s delay.
// Returns true if both tokens exist, false otherwise.
export interface VerifySessionOptions {
  accessTokenKey?: string;
  idTokenKey?: string;
  delayMs?: number; // default 2000
}

export const verifySessionTokens = async (options: VerifySessionOptions = {}): Promise<boolean> => {
  const {
    accessTokenKey = "accessToken",
    idTokenKey = "idToken",
    delayMs = 2000,
  } = options;

  // Intentional artificial delay so background checks (e.g. silent renew) can complete
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  const accessToken = sessionStorage.getItem(accessTokenKey);
  const idToken = sessionStorage.getItem(idTokenKey);
  return Boolean(accessToken && idToken);
};

// Convenience wrapper you can await inside components
export const requireSessionTokens = async (options?: VerifySessionOptions) => {
  const ok = await verifySessionTokens(options);
  if (!ok) throw new Error("SESSION_TOKENS_MISSING");
  return ok;
};
