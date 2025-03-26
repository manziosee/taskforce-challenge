import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import logger from '../utils/logger';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prospero Wallet API',
      version: '1.0.0',
      description: 'API for managing personal finances',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development server' },
      { url: 'https://taskforce-challenge.onrender.com', description: 'Render server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Transaction: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Transaction ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            amount: {
              type: 'number',
              description: 'Transaction amount'
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              description: 'Transaction type'
            },
            category: {
              type: 'string',
              description: 'Transaction category'
            },
            subcategory: {
              type: 'string',
              description: 'Transaction subcategory'
            },
            account: {
              type: 'string',
              description: 'Account used for transaction'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction date'
            },
            description: {
              type: 'string',
              description: 'Transaction description'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Budget: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Budget ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            category: {
              type: 'string',
              description: 'Budget category'
            },
            limit: {
              type: 'number',
              description: 'Budget limit amount'
            },
            spent: {
              type: 'number',
              description: 'Amount spent in this category'
            },
            period: {
              type: 'string',
              enum: ['monthly', 'weekly', 'yearly'],
              description: 'Budget period'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Category ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'Category name'
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              description: 'Category type'
            },
            subcategories: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of subcategories'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              description: 'User email'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  logger.info('Setting up Swagger documentation');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  logger.info('Swagger documentation setup complete');
};