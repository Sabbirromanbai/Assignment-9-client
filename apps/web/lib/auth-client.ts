import { createAuthClient } from "better-auth/react"

// Leave baseURL unset so Better Auth uses the current frontend origin.
// next.config.ts proxies /api/auth/* to the backend; this keeps the session
// cookie first-party instead of relying on cross-site third-party cookies.
export const authClient = createAuthClient({
  fetchOptions: {
    credentials: "include",
  },
})

export const { signIn, signUp, signOut, useSession } = authClient
