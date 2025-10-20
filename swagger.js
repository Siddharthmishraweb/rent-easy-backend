// const swaggerJsDoc = require('swagger-jsdoc');
import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RentEasy API Documentation',
      version: '1.0.0',
      description: 'API documentation for RentEasy platform',
      contact: {
        name: 'API Support',
        email: 'support@renteasy.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['ADMIN', 'OWNER', 'TENANT'] },
            phone: { type: 'string' }
          }
        },
        Property: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                locality: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                pincode: { type: 'string' }
              }
            },
            type: { type: 'string', enum: ['apartment', 'house', 'villa', 'pg', 'room'] },
            rent: { type: 'number' },
            securityDeposit: { type: 'number' },
            owner: { $ref: '#/components/schemas/User' }
          }
        },
        Agreement: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            property: { $ref: '#/components/schemas/Property' },
            tenant: { $ref: '#/components/schemas/User' },
            owner: { $ref: '#/components/schemas/User' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['pending', 'active', 'expired', 'terminated'] }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            agreement: { $ref: '#/components/schemas/Agreement' },
            amount: { type: 'number' },
            type: { type: 'string', enum: ['rent', 'deposit'] },
            status: { type: 'string', enum: ['pending', 'paid', 'failed'] }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' }
          }
        }
      }
    }
  },
  apis: [
    './api/resources/*/*.js',
    './api/resources/*/**.js',
    './swagger.js'
  ]
};

export const swaggerDocs = swaggerJsDoc(swaggerOptions);

