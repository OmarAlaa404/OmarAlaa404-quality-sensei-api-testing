import { OpenAPIV3 } from 'openapi-types';

// Update the Swagger document to include new token-based auth options
// Add paths for the new endpoints that use query parameters
export const swaggerDocument: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Quality Sensei API',
    description: 'API Testing Playground for learning API testing concepts',
    version: '1.0.0',
    contact: {
      name: 'Quality Sensei Support',
      email: 'support@qualitysensei.com'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'API Server'
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Operations related to user authentication'
    },
    {
      name: 'Boards',
      description: 'Board management operations'
    },
    {
      name: 'Lists',
      description: 'List management operations'
    },
    {
      name: 'Cards',
      description: 'Card management operations'
    }
  ],
  paths: {
    '/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login to get authentication token',
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Successful login',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse'
                }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        operationId: 'register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User successfully registered',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          '400': {
            description: 'Invalid input or username already exists',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout the current user',
        operationId: 'logout',
        responses: {
          '200': {
            description: 'Successfully logged out'
          }
        }
      }
    },
    '/user': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user information',
        operationId: 'getUser',
        security: [
          {
            sessionAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'User information retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/boards': {
      get: {
        tags: ['Boards'],
        summary: 'Get all boards for the current user',
        operationId: 'getBoards',
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1
            },
            description: 'Page number for pagination'
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100
            },
            description: 'Number of items per page'
          }
        ],
        responses: {
          '200': {
            description: 'List of boards',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Board'
                  }
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Boards'],
        summary: 'Create a new board',
        operationId: 'createBoard',
        security: [
          {
            sessionAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BoardInput'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Board created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Board'
                }
              }
            }
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/boards/{id}': {
      get: {
        tags: ['Boards'],
        summary: 'Get a single board by ID',
        operationId: 'getBoardById',
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'Board ID'
          }
        ],
        responses: {
          '200': {
            description: 'Board retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Board'
                }
              }
            }
          },
          '404': {
            description: 'Board not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - board belongs to another user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['Boards'],
        summary: 'Update a board',
        operationId: 'updateBoard',
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'Board ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BoardInput'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Board updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Board'
                }
              }
            }
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'Board not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - board belongs to another user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Boards'],
        summary: 'Delete a board',
        operationId: 'deleteBoard',
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'Board ID'
          }
        ],
        responses: {
          '204': {
            description: 'Board deleted successfully'
          },
          '404': {
            description: 'Board not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - board belongs to another user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/boards/{boardId}/lists': {
      get: {
        tags: ['Lists'],
        summary: 'Get all lists for a board',
        operationId: 'getLists',
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            name: 'boardId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'Board ID'
          }
        ],
        responses: {
          '200': {
            description: 'Lists retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/List'
                  }
                }
              }
            }
          },
          '404': {
            description: 'Board not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - board belongs to another user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Lists'],
        summary: 'Create a new list in a board',
        operationId: 'createList',
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            name: 'boardId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'Board ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ListInput'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'List created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/List'
                }
              }
            }
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'Board not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - board belongs to another user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/boards/{boardId}/lists/{listId}': {
      put: {
        tags: ['Lists'],
        summary: 'Update a list',
        operationId: 'updateList',
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            name: 'boardId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'Board ID'
          },
          {
            name: 'listId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'List ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ListInput'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'List updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/List'
                }
              }
            }
          },
          '400': {
            description: 'Invalid input or list does not belong to this board',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'Board or list not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - board belongs to another user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Lists'],
        summary: 'Delete a list',
        operationId: 'deleteList',
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            name: 'boardId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'Board ID'
          },
          {
            name: 'listId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'List ID'
          }
        ],
        responses: {
          '204': {
            description: 'List deleted successfully'
          },
          '400': {
            description: 'List does not belong to this board',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'Board or list not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - board belongs to another user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/lists/{listId}/cards': {
      get: {
        tags: ['Cards'],
        summary: 'Get all cards for a list',
        operationId: 'getCards',
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            name: 'listId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'List ID'
          },
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: {
              type: 'string'
            },
            description: 'Filter cards by status'
          },
          {
            name: 'label',
            in: 'query',
            required: false,
            schema: {
              type: 'string'
            },
            description: 'Filter cards by label'
          }
        ],
        responses: {
          '200': {
            description: 'Cards retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Card'
                  }
                }
              }
            }
          },
          '404': {
            description: 'List not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - list belongs to a board owned by another user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Cards'],
        summary: 'Create a new card in a list',
        operationId: 'createCard',
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            name: 'listId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'List ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CardInput'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Card created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Card'
                }
              }
            }
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'List not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - list belongs to a board owned by another user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/lists/{listId}/cards/{cardId}': {
      patch: {
        tags: ['Cards'],
        summary: 'Update a card',
        operationId: 'updateCard',
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            name: 'listId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'List ID'
          },
          {
            name: 'cardId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'Card ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CardInput'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Card updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Card'
                }
              }
            }
          },
          '400': {
            description: 'Invalid input or card does not belong to this list',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'List or card not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - list belongs to a board owned by another user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Cards'],
        summary: 'Delete a card (soft delete)',
        operationId: 'deleteCard',
        security: [
          {
            sessionAuth: []
          }
        ],
        parameters: [
          {
            name: 'listId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'List ID'
          },
          {
            name: 'cardId',
            in: 'path',
            required: true,
            schema: {
              type: 'integer'
            },
            description: 'Card ID'
          }
        ],
        responses: {
          '204': {
            description: 'Card deleted successfully'
          },
          '400': {
            description: 'Card does not belong to this list',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'List or card not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Not authenticated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '403': {
            description: 'Forbidden - list belongs to a board owned by another user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            example: 'admin'
          },
          password: {
            type: 'string',
            example: '123456'
          }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          username: {
            type: 'string',
            example: 'admin'
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            example: 'newuser'
          },
          password: {
            type: 'string',
            example: 'password123'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          username: {
            type: 'string',
            example: 'admin'
          }
        }
      },
      BoardInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            example: 'QA Tasks'
          },
          description: {
            type: 'string',
            example: 'Sprint 1 scope'
          }
        }
      },
      Board: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          name: {
            type: 'string',
            example: 'QA Tasks'
          },
          description: {
            type: 'string',
            example: 'Sprint 1 scope'
          },
          userId: {
            type: 'integer',
            example: 1
          }
        }
      },
      ListInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
            example: 'To Do'
          }
        }
      },
      List: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          title: {
            type: 'string',
            example: 'To Do'
          },
          boardId: {
            type: 'integer',
            example: 1
          }
        }
      },
      CardInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
            example: 'Write Test Cases'
          },
          description: {
            type: 'string',
            example: 'For login module'
          },
          status: {
            type: 'string',
            example: 'todo'
          },
          dueDate: {
            type: 'string',
            format: 'date',
            example: '2025-05-10'
          },
          labels: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['critical', 'backend']
          },
          attachments: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['test-cases.docx']
          }
        }
      },
      Card: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          title: {
            type: 'string',
            example: 'Write Test Cases'
          },
          description: {
            type: 'string',
            example: 'For login module'
          },
          status: {
            type: 'string',
            example: 'todo'
          },
          dueDate: {
            type: 'string',
            format: 'date',
            example: '2025-05-10'
          },
          listId: {
            type: 'integer',
            example: 1
          },
          labels: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['critical', 'backend']
          },
          attachments: {
            type: 'array',
            items: {
              type: 'string'
            },
            example: ['test-cases.docx']
          },
          isDeleted: {
            type: 'boolean',
            example: false
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Error message'
          }
        }
      }
    },
    securitySchemes: {
      sessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid'
      }
    }
  }
};
