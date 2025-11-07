import { Router } from "express";
import passport from "../../config/passport";
import { AuthController } from "./auth.controller";
import { authenticate, AuthRequest } from "../../middlewares/auth.middleware";

const router = Router();
const authController = new AuthController();

// Traditional Auth
router.post("/register", (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Register a new user with collaborators'
  /* #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        example: {
          name: "John",
          lastName: "Doe",
          phone: "+1234567890",
          email: "john.doe@example.com",
          password: "yourSecurePassword",
          agreedTerms: true,
          marketingConsent: false,
          role: "STUDENT",
          collaborators: [
            {
              firstName: "Jane",
              lastName: "Doe",
              email: "jane.doe@example.com",
              phone: "+1987654321",
              role: "PARENT"
            }
          ]
        }
      }
    }
  } */
  /* #swagger.responses[201] = {
    description: 'User successfully registered',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/AuthResponse' }
      }
    }
  } */
  /* #swagger.responses[400] = {
    description: 'Bad request - validation error or email already exists'
  } */
  return authController.register(req as AuthRequest, res);
});

router.post("/login", (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Login with email and password'
  /* #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        example: {
          email: "john.doe@example.com",
          password: "yourSecurePassword"
        }
      }
    }
  } */
  /* #swagger.responses[200] = {
    description: 'Login successful',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/AuthResponse' }
      }
    }
  } */
  /* #swagger.responses[401] = {
    description: 'Invalid credentials'
  } */
  return authController.login(req as AuthRequest, res);
});

router.post("/logout", authenticate, (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Logout and invalidate current session'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.responses[200] = {
    description: 'Successfully logged out'
  } */
  /* #swagger.responses[401] = {
    description: 'Unauthorized - Invalid or expired token'
  } */
  return authController.logout(req as AuthRequest, res);
});

router.post("/refresh", (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Refresh access token using refresh token'
  /* #swagger.requestBody = {
    required: true,
    schema: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: {
          type: 'string',
          description: 'The refresh token received during login/registration',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  } */
  /* #swagger.responses[200] = {
    description: 'New tokens generated',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        }
      }
    }
  } */
  return authController.refreshToken(req as AuthRequest, res);
});

router.get("/me", authenticate, (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Get current user profile'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.responses[200] = {
    description: 'User profile retrieved',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/UserProfile' }
      }
    }
  } */
  return authController.me(req as AuthRequest, res);
});

// Google OAuth
router.get(
  "/google",
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Initiate Google OAuth2 authentication'
  // #swagger.security = [{ "googleOAuth": ["profile", "email"] }]
  /* #swagger.responses[302] = {
    description: 'Redirect to Google authentication page'
  } */
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })
);

router.get(
  "/google/callback",
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Handle Google OAuth2 callback'
  /* #swagger.responses[302] = {
    description: 'Redirect to frontend with auth tokens'
  } */
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => authController.oauthCallback(req as AuthRequest, res)
);

export default router;
