"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const logger_1 = __importDefault(require("../utils/logger"));
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
const specs = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    logger_1.default.info('Setting up Swagger documentation');
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
    logger_1.default.info('Swagger documentation setup complete');
};
exports.setupSwagger = setupSwagger;
