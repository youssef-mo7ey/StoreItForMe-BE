import swaggerAutogen from 'swagger-autogen';
import { env } from './env';
import { swaggerSpec } from './swagger';

const outputFile = './src/config/swagger-output.json';
const endpointsFiles = ['./src/app.ts'];

// Use the existing swagger spec as a base
const doc = {
  ...swaggerSpec,
  info: {
    title: 'StoreItForMe API',
    version: '1.0.0',
    description: 'API documentation for StoreItForMe'
  },
  servers: [
    { url: `http://localhost:${env.PORT}` }
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and session endpoints' },
    { name: 'Health', description: 'Health check and status' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
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
      CollaboratorInput: {
        type: 'object',
        properties: {
          firstName: { type: 'string', example: 'Jane' },
          lastName: { type: 'string', example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'jane.doe@example.com' },
          phone: { type: 'string', example: '+1987654321' },
          role: { 
            type: 'string',
            enum: ['STUDENT', 'PARENT'],
            description: 'Optional - will be inferred based on main user\'s role',
            example: 'PARENT'
          }
        },
        required: ['firstName', 'lastName', 'email']
      },
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
          role: {
            type: 'string',
            enum: ['STUDENT', 'PARENT'],
            example: 'STUDENT'
          },
          collaborators: {
            type: 'array',
            items: { $ref: '#/components/schemas/CollaboratorInput' },
            minItems: 1,
            description: 'List of collaborators (at least one required)',
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
          id: { type: 'string', example: 'usr_123456789' },
          email: { type: 'string', example: 'john.doe@example.com' },
          name: { type: ['string', 'null'], example: 'John' },
          lastName: { type: ['string', 'null'], example: 'Doe' },
          phone: { type: ['string', 'null'], example: '+1234567890' },
          role: { type: 'string', enum: ['STUDENT', 'PARENT', 'ADMIN'], example: 'STUDENT' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/UserProfile' },
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
        }
      }
    }
  }
};

const options = {
  autoHeaders: true,
  autoQuery: true,
  autoBody: true,
  openapi: '3.0.0'  // Use OpenAPI 3.0 specification
};

swaggerAutogen(options)(outputFile, endpointsFiles, doc);