// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

interface ImportMetaEnv {
	readonly VITE_SENTRY_DSN?: string;
	readonly PUBLIC_SENTRY_DSN?: string;
	/** Injected by the Vercel → Sentry integration (Next.js-oriented name). */
	readonly NEXT_PUBLIC_SENTRY_DSN?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare global {
	namespace App {
		interface Error {
			message: string;
			errorId?: string;
		}
		interface Locals {
			workosToken?: string;
			workosUserId?: string;
		}
		interface PageData {
			user: import('$lib/auth.server').SessionUser | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
