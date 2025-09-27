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
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
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

/**
 * @swagger
 * /api/users/legacy/{id}:
 *   get:
 *     summary: Buscar usuário legado por ID
 *     description: Retorna os dados de um usuário do sistema legado (tabela `tb_utilizadores`) com base no ID fornecido.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Código do utilizador no sistema legado
 *     responses:
 *       200:
 *         description: Utilizador encontrado com sucesso.
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
 *                   example: "Utilizador legado obtido com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     codigo:
 *                       type: integer
 *                       example: 12
 *                     nome:
 *                       type: string
 *                       example: "João Manuel"
 *                     user:
 *                       type: string
 *                       example: "jmanuel"
 *                     codigo_Tipo_Utilizador:
 *                       type: integer
 *                       example: 1
 *                     estadoActual:
 *                       type: string
 *                       example: "ATIVO"
 *                     dataCadastro:
 *                       type: string
 *                       format: date
 *                       example: "2024-03-15"
 *                     tb_tipos_utilizador:
 *                       type: object
 *                       properties:
 *                         codigo:
 *                           type: integer
 *                           example: 1
 *                         designacao:
 *                           type: string
 *                           example: "Administrador"
 *       404:
 *         description: Utilizador não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/legacy/:id', UsersController.getUserLegacyById);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Buscar usuário moderno por ID
 *     description: Retorna os dados de um usuário do sistema moderno (tabela `users`) com base no ID fornecido.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário (BigInt convertido para string)
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso.
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
 *                   example: "Usuário obtido com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     name:
 *                       type: string
 *                       example: "Emanuel Malungo"
 *                     username:
 *                       type: string
 *                       example: "emanuel_malungo"
 *                     email:
 *                       type: string
 *                       example: "emanuelmalungo@example.com"
 *                     tipo:
 *                       type: integer
 *                       example: 2
 *                     foto:
 *                       type: string
 *                       example: "img_avatar1.png"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-20T10:30:00.000Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-20T10:30:00.000Z"
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/:id', UsersController.getUserById);

// ===============================
// ROTAS DE ATUALIZAÇÃO
// ===============================

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualizar usuário moderno
 *     description: Atualiza os dados de um usuário do sistema moderno (tabela `users`).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Emanuel Malungo Silva"
 *               username:
 *                 type: string
 *                 example: "emanuel_silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "emanuel.silva@example.com"
 *               tipo:
 *                 type: integer
 *                 example: 2
 *               foto:
 *                 type: string
 *                 example: "img_avatar2.png"
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
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
 *                   example: "Usuário atualizado com sucesso"
 *                 data:
 *                   type: object
 *       400:
 *         description: Email ou username já em uso
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', UsersController.updateUser);

/**
 * @swagger
 * /api/users/legacy/{id}:
 *   put:
 *     summary: Atualizar usuário legado
 *     description: Atualiza os dados de um usuário do sistema legado (tabela `tb_utilizadores`).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Código do utilizador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "João Manuel Silva"
 *               user:
 *                 type: string
 *                 example: "jmanuel_silva"
 *               codigo_Tipo_Utilizador:
 *                 type: integer
 *                 example: 2
 *               estadoActual:
 *                 type: string
 *                 example: "ATIVO"
 *     responses:
 *       200:
 *         description: Utilizador atualizado com sucesso
 *       400:
 *         description: Username já em uso
 *       404:
 *         description: Utilizador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/legacy/:id', UsersController.updateUserLegacy);

// ===============================
// ROTAS DE MUDANÇA DE SENHA
// ===============================

/**
 * @swagger
 * /api/users/{id}/change-password:
 *   patch:
 *     summary: Alterar senha do usuário moderno
 *     description: Permite alterar a senha de um usuário do sistema moderno.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Senha atual do usuário
 *                 example: "senhaAtual123"
 *               newPassword:
 *                 type: string
 *                 description: Nova senha (mínimo 8 caracteres)
 *                 example: "NovaSenha@456"
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
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
 *                   example: "Senha alterada com sucesso"
 *       400:
 *         description: Senha atual incorreta
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/:id/change-password', UsersController.changeUserPassword);

/**
 * @swagger
 * /api/users/legacy/{id}/change-password:
 *   patch:
 *     summary: Alterar senha do usuário legado
 *     description: Permite alterar a senha de um usuário do sistema legado.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Código do utilizador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Senha atual do utilizador
 *                 example: "senhaAtual123"
 *               newPassword:
 *                 type: string
 *                 description: Nova senha
 *                 example: "NovaSenha456"
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Senha atual incorreta
 *       404:
 *         description: Utilizador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/legacy/:id/change-password', UsersController.changeUserLegacyPassword);

// ===============================
// ROTAS DE EXCLUSÃO
// ===============================

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deletar usuário moderno
 *     description: Remove um usuário do sistema moderno (tabela `users`).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
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
 *                   example: "Usuário deletado com sucesso"
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', UsersController.deleteUser);

/**
 * @swagger
 * /api/users/legacy/{id}:
 *   delete:
 *     summary: Deletar usuário legado
 *     description: Remove um usuário do sistema legado (tabela `tb_utilizadores`). Verifica relacionamentos antes da exclusão.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Código do utilizador
 *     responses:
 *       200:
 *         description: Utilizador deletado com sucesso
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
 *                   example: "Utilizador deletado com sucesso"
 *       400:
 *         description: Não é possível deletar devido a relacionamentos existentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Não é possível deletar o utilizador. Existem registros relacionados: 2 aluno(s), 1 matrícula(s)"
 *       404:
 *         description: Utilizador não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/legacy/:id', UsersController.deleteUserLegacy);

export default router;
