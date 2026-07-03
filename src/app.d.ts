// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
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
