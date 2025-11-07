import { JwtUserPayload } from './auth.types';

declare global {
	namespace Express {
		// Provide an alternative property name to avoid conflicting with other libs
		interface Request {
			authUser?: JwtUserPayload;
		}
	}
}

export {};
