import express from "express";
import { UsersController } from "../controller/users.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Rotas para gestão de usuários do sistema moderno e legado
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários do sistema moderno
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de registros por página
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lista de usuários obtida com sucesso
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       example: 42
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "João da Silva"
 *                       email:
 *                         type: string
 *                         example: "joao@email.com"
 *                       tipo:
 *                         type: integer
 *                         example: 2
 *                       foto:
 *                         type: string
 *                         example: "img_avatar1.png"
 *       401:
 *         description: Token inválido ou não fornecido
 *       403:
 *         description: Acesso negado (não é administrador)
 */
router.get("/", UsersController.getAllUsers);

/**
 * @swagger
 * /api/users/legacy:
 *   get:
 *     summary: Lista todos os usuários do sistema legado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de usuários legados retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lista de usuários legados obtida com sucesso
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       codigo:
 *                         type: integer
 *                         example: 15
 *                       nome:
 *                         type: string
 *                         example: "Carlos Alberto"
 *                       user:
 *                         type: string
 *                         example: "calberto"
 *                       codigo_Tipo_Utilizador:
 *                         type: integer
 *                         example: 2
 *                       estadoActual:
 *                         type: string
 *                         example: "ACTIVO"
 *                       dataCadastro:
 *                         type: string
 *                         format: date
 *                         example: "2025-01-20"
 *       401:
 *         description: Token inválido ou não fornecido
 *       403:
 *         description: Acesso negado (não é administrador)
 */
router.get("/legacy", UsersController.getAllLegacyUsers);

export default router;
