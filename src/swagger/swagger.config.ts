import { Options } from "swagger-jsdoc";
import { BASE_URL } from "../config/env.config";


const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Flezta API",
      version: "1.0.0",
      description: "Flezta backend API documentation",
    },
    servers: [
      {
        url: BASE_URL,
        description: "Local server",
      },
      // add prod later
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste Firebase ID token here",
        },
      },

      schemas: {
        ApiSuccess: {
          type: "object",
          properties: {
            message: { type: "string" },
            data: { type: "object" },
          },
        },

        ApiError: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },

        User: {
          type: "object",
          properties: {
            uid: { type: "string" },
            userName: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string" },
            phoneNumber: { type: "string" },
            isAdmin: { type: "boolean" },
            isSuperAdmin: { type: "boolean" },
            disabled: { type: "boolean" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Users",
        description: "User management",
      },
      { name: "Shops", description: "Shop management" },
      { name: "Brands", description: "Brand management" },
      { name: "Categories", description: "Category management" },
      {
        name: "Products",
        description: "Product management",
      },
      
      {
        name: "Orders",
        description: "Order management",
      },
      {
        name: "Shop Orders",
        description: "Shop Order management",
      },
    ],
  },

  // 👇 IMPORTANT: where Swagger scans your annotations
  apis: ["./src/routes/**/*.ts", "./src/controllers/**/*.ts"],
};

export default swaggerOptions;
