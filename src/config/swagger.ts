import { env } from './env';
import swaggerOutput from './swagger-output.json';

// Load generated swagger spec, fallback to default if not generated yet
export const swaggerSpec = swaggerOutput || {
  openapi: '3.0.0',
  info: {
    title: 'StoreItForMe API',
    version: '1.0.0',
    description: 'Minimal OpenAPI spec for StoreItForMe. Add more endpoints under appropriate tags.'
  },
  servers: [
    { url: `http://localhost:${env.PORT}` },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and session endpoints' },
    { name: 'Health', description: 'Health check and status' },
  ],
  paths: {
    '/api/auth/google': {
      get: {
        tags: ['Auth'],
        summary: 'Initiate Google OAuth2 authentication',
        description: 'Redirects to Google login page for OAuth2 authentication',
        security: [{ googleOAuth: ['profile', 'email'] }],
        responses: {
          '302': {
            description: 'Redirect to Google authentication page'
          }
        }
      }
    },
    '/api/auth/google/callback': {
      get: {
        tags: ['Auth'],
        summary: 'Google OAuth2 callback endpoint',
        description: 'Handles the OAuth2 callback from Google, creates/updates user, and returns tokens',
        responses: {
          '302': {
            description: 'Redirect to frontend with success or error',
            headers: {
              Location: {
                schema: {
                  type: 'string',
                  example: '/auth/success'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterInput' }
            }
          }
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '400': { description: 'Bad Request' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login using email and password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } }
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: { '200': { description: 'OK' } }
      }
    }
  },
  components: {
    securitySchemes: {
      googleOAuth: {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            scopes: {
              'profile': 'View your basic profile info',
              'email': 'View your email address'
            }
          }
        }
      }
    },
    schemas: {
      RegisterInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          phone: { type: 'string', example: '+1234567890' },
          email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          password: { type: 'string', format: 'password', example: 'yourSecurePassword' },
          agreedTerms: { type: 'boolean', example: true },
          marketingConsent: { type: 'boolean', example: false },
          role: { type: 'string', enum: ['STUDENT', 'PARENT'], example: 'STUDENT' },
          collaborators: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                firstName: { type: 'string', example: 'Jane' },
                lastName: { type: 'string', example: 'Doe' },
                email: { type: 'string', format: 'email', example: 'jane.doe@example.com' },
                phone: { type: 'string', example: '+1987654321' },
                role: { type: 'string', enum: ['STUDENT', 'PARENT'], example: 'PARENT' }
              },
              required: ['firstName', 'lastName', 'email']
            },
            minItems: 1,
            example: [{
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane.doe@example.com',
              phone: '+1987654321',
              role: 'PARENT'
            }]
          }
        },
        required: ['name', 'lastName', 'phone', 'email', 'password', 'agreedTerms', 'role', 'collaborators']
      },
      LoginInput: {
        type: 'object',
        properties: { 
          email: { type: 'string', format: 'email', example: 'john.doe@example.com' }, 
          password: { type: 'string', format: 'password', example: 'yourSecurePassword' } 
        },
        required: ['email', 'password']
      },
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: ['string', 'null'] },
          lastName: { type: ['string', 'null'] },
          phone: { type: ['string', 'null'] },
          role: { type: 'string' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/UserProfile' },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' }
        }
      }
    }
  }
} as const;

export default swaggerSpec;
