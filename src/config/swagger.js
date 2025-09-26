// config/swagger.js
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Jomorais Backend API",
      version: "1.0.0",
      description: "📚 Documentação do Sistema de Gestão Escolar Jomorais",
    },
    servers: [
      {
        url: `${BASE_URL}`,
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`🚀 Swagger rodando em: ${BASE_URL}/docs`);
};
