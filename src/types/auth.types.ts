import { Role } from "@prisma/client"; // Import Prisma types for maximum safety

// --- 1. Core User Data Structure ---

// The minimal information stored on the JWT (DecodedUser).
// Used in middleware and attached to the Express Request object.
export interface JwtUserPayload {
    id: string;
    email: string;
    role: Role; // Use the Prisma Role enum
}

// The full user object returned to the client after successful login/registration.
export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    lastName: string | null;
    phone: string | null;
    role: Role;
    // We do NOT return password, agreedTerms, or marketingConsent in the profile
}


// --- 2. Request Payload Structures (for Controllers) ---

// Defines a single collaborator's information
export interface CollaboratorInput {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role?: Role; // Optional - will be inferred based on main user's role if not provided
}

// Defines the minimum required fields for local registration based on the
// StoreIt4Me PDF (First Name, Last Name, Phone, Email, Password, Terms).
export interface LocalRegisterInput {
    // Required fields from Step 1 of the PDF
    name: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    agreedTerms: boolean;
    
    // Optional marketing consent
    marketingConsent?: boolean;
    
    // Role selection (Student or Parent) from Step 1
    role: Role;
    
    // List of collaborators (at least one is required)
    collaborators: CollaboratorInput[];
    
    // Additional data to consider adding later:
    // serviceType?: ServiceType;
}

// Defines the data structure needed for Google OAuth login/registration.
// This is typically provided by the OAuth provider's user profile.
export interface GoogleAuthInput {
    providerId: string; // The unique ID from Google
    email: string;
    name: string;
    lastName?: string;
    phone?: string;
    // Note: We often can't guarantee 'phone' or 'lastName' from Google,
    // so the app will likely need a follow-up step to collect these.
    // We assume a default role for new sign-ups.
}

export interface LocalLoginInput {
    email: string;
    password: string;
}

// --- 3. Token Response Structure ---

export interface AuthResponse {
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
}