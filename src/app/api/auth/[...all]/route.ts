import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth/auth";

// better-sqlite3 + WebAuthn verification require the Node.js runtime.
export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth);
