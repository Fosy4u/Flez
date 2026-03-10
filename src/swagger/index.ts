import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import swaggerOptions from "./swagger.config";
import { ENV } from "../config/env.config";

const swaggerSpec = swaggerJSDoc(swaggerOptions);
const devToken = process.env.FIREBASE_TEST_USER_TOKEN;
export const setupSwagger = (app: Express): void => {
  if (ENV !== "prod")
    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: "Flezta API Docs",
        swaggerOptions: {
          
          authAction: devToken
            ? {
                bearerAuth: {   // ← MUST MATCH securitySchemes key
                  name: "bearerAuth",
                  schema: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                  },
                  value: `${devToken}`, // include 'Bearer ' prefix
                },
              }
            : {},
        },
        
      }),
    );
};
