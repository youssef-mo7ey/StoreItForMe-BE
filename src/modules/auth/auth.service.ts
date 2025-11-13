import prisma from "../../config/database";
import { hashPassword, comparePassword } from "../../utils/password.util";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.util";
import {
  LocalRegisterInput,
  LocalLoginInput,
  AuthResponse,
  UserProfile,
  JwtUserPayload,
  GoogleAuthInput,
} from "../../types/auth.types"; // Import the new types
import { Role, AuthMethod } from "@prisma/client";

// Re-defining AppError here for completeness, assuming it's not imported elsewhere
class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class AuthService {
  // --- Utility Methods ---

  private mapUserToProfile(user: any): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
    };
  }

  private async createAndStoreSession(
    user: JwtUserPayload
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        // Expires in 30 days
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    return { accessToken, refreshToken };
  }

  // --- Authentication Flows ---

  /**
   * Handles local registration with required contact details and consent.
   */
  async register(data: LocalRegisterInput): Promise<AuthResponse> {
    const {
      email,
      password,
      name,
      lastName,
      phone,
      agreedTerms,
      marketingConsent,
      collaborators,
    } = data;

    // 1. Validate Terms
    if (!agreedTerms) {
      throw new AppError("You must agree to the Terms & Conditions.", 400);
    }

    // 2. Validate collaborators
    if (!collaborators || collaborators.length === 0) {
      throw new AppError("At least one collaborator is required", 400);
    }

    // 3. Check all emails for duplicates
    const allEmails = [email, ...collaborators.map((c) => c.email)];
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: allEmails } },
    });

    if (existingUsers.length > 0) {
      // Check if main user email exists
      if (existingUsers.some((u) => u.email === email)) {
        throw new AppError("A user with this email already exists.", 400);
      }
      // Check which collaborator email exists
      const existingCollaboratorEmail = existingUsers[0].email;
      throw new AppError(
        `A user with the collaborator email ${existingCollaboratorEmail} already exists.`,
        400
      );
    }

    // 4. Hash Password
    const hashedPassword = await hashPassword(password);

    // 5. Create User and Collaborators in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // Create main user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          lastName,
          phone,
          agreedTerms,
          marketingConsent: marketingConsent || false,
          role: Role.USER,
          authMethod: AuthMethod.LOCAL,
        },
      });

      // Create all collaborators
      for (const collaborator of collaborators) {
        await tx.collaborator.create({
          data: {
            userId: user.id,
            firstName: collaborator.firstName,
            lastName: collaborator.lastName,
            email: collaborator.email,
            phone: collaborator.phone || "",
          },
        });
      }

      return user;
    });

    const userProfile = this.mapUserToProfile(newUser);
    const tokens = await this.createAndStoreSession(userProfile);

    return { user: userProfile, ...tokens };
  }

  /**
   * Handles user login with email and password.
   */
  async login(data: LocalLoginInput): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password || user.authMethod !== AuthMethod.LOCAL) {
      // If user exists but is not local (e.g., Google user), prompt them to use OAuth
      throw new AppError(
        "Invalid credentials or please sign in with Google.",
        401
      );
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new AppError("Invalid credentials", 401);
    }

    const userPayload: JwtUserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const userProfile = this.mapUserToProfile(user);
    const tokens = await this.createAndStoreSession(userPayload);

    return { user: userProfile, ...tokens };
  }

  /**
   * Placeholder for Google OAuth logic. This is where you connect the
   * user data returned from your OAuth service (e.g., Passport.js) to your DB.
   * @param data User profile data from Google.
   */
  async googleSignInOrUp(data: GoogleAuthInput): Promise<AuthResponse> {
    const { providerId, email, name, lastName, phone } = data;

    let user = await prisma.user.findUnique({
      where: {
        // Find by the unique provider/method combination
        providerId_authMethod: { providerId, authMethod: AuthMethod.GOOGLE },
      },
    });

    if (!user) {
      // User does not exist, check if email is already used by a LOCAL account
      const existingEmailUser = await prisma.user.findUnique({
        where: { email },
      });

      if (
        existingEmailUser &&
        existingEmailUser.authMethod === AuthMethod.LOCAL
      ) {
        // Throw error asking them to sign in locally
        throw new AppError(
          "This email is already registered with an email/password. Please log in locally.",
          400
        );
      }

      // 1. Create New User via Google
      user = await prisma.user.create({
        data: {
          email,
          name,
          lastName: lastName || null,
          phone: phone || null,
          role: Role.USER, // Default role for new sign-ups
          authMethod: AuthMethod.GOOGLE,
          providerId,
          agreedTerms: false, // User must complete the onboarding flow later
          marketingConsent: false,
        },
      });
    }

    // 2. Log In Existing/New User
    const userPayload: JwtUserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const userProfile = this.mapUserToProfile(user);
    const tokens = await this.createAndStoreSession(userPayload);

    return { user: userProfile, ...tokens };
  }

  /**
   * Deletes sessions associated with the given access token (token field in Session model).
   */
  async logout(token: string) {
    // The token here is the access token (Session.token) used to identify the session
    await prisma.session.deleteMany({ where: { token } });
  }

  /**
   * Refreshes access and refresh tokens using the existing refresh token.
   */
  async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const userPayload = decoded as JwtUserPayload; // Cast the decoded object

      const session = await prisma.session.findFirst({
        where: { refreshToken, userId: userPayload.id },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new AppError("Invalid or expired refresh token", 401);
      }

      const user = session.user;
      const newPayload: JwtUserPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const tokens = this.generateTokens(newPayload); // Use utility method for clarity

      // Update session with new tokens
      await prisma.session.update({
        where: { id: session.id },
        data: {
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return tokens;
    } catch (error) {
      // The original error handling was slightly flawed as verifyRefreshToken might throw
      // a different error, but the goal is to return a 401.
      throw new AppError("Invalid refresh token", 401);
    }
  }

  async me(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return this.mapUserToProfile(user);
  }
  // Helper method for token generation
  generateTokens(user: JwtUserPayload) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async adminRegister(userId: string, data: LocalRegisterInput): Promise<void> {
    const {
      email,
      password,
      name,
      lastName,
      phone,
      agreedTerms,
      marketingConsent,
      role,
    } = data;
    try {
      const admin = await prisma.user.findUnique({ where: { id: userId } });
      const user = await prisma.user.findUnique({ where: { email } });
      // Check if user with email already exists
      if (user) {
        throw new Error("A user with this email already exists.");
      }
      // Only admins can register new admin users or users with elevated roles
      if (!admin || admin.role !== Role.ADMIN) {
        throw new Error("Only admins can register new admin users");
      }
      // Hash Password
      const hashedPassword = await hashPassword(password);
      // Create User and Collaborators in a transaction
      const newUser = await prisma.$transaction(async (tx) => {
        // Create main user
        await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            lastName: lastName || null,
            phone: phone || null,
            role: role,
            authMethod: AuthMethod.LOCAL,
            agreedTerms: agreedTerms || false,
            marketingConsent: marketingConsent || false,
          },
        });
      });
      return newUser;
    } catch (err) {
      console.error(err);
      throw new Error("Service: Admin registration failed");
    }
  }
}
