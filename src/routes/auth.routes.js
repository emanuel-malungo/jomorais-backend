/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Mensagem de erro"
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do usuário
 *         nome:
 *           type: string
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         tipo:
 *           type: integer
 *           description: Tipo de usuário (1-Admin, 2-Professor, 3-Aluno)
 *         legacy:
 *           type: boolean
 *           description: Indica se é usuário do sistema legado
 */

import express from 'express';
import { AuthController } from '../controller/auth.controller.js';
import { 
  authenticateToken, 
  verifyUserExists,
  requireModernUser,
  requireLegacyUser,
  requireAdmin,
  requireUserType,
  requireLegacyUserType
} from '../middleware/auth.middleware.js';

const router = express.Router();

// ========== ROTAS PÚBLICAS ==========

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário no sistema moderno
 *     tags: [Autenticação - Público]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - tipo
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome completo do usuário
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email único do usuário
 *               senha:
 *                 type: string
 *                 minLength: 6
 *                 description: Senha do usuário
 *               tipo:
 *                 type: integer
 *                 description: Tipo de usuário (1-Admin, 2-Professor, 3-Aluno)
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos ou email já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/register', AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login do usuário moderno
 *     description: Autentica usuário do sistema moderno e retorna token JWT
 *     tags: [Autenticação - Público]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *               senha:
 *                 type: string
 *                 description: Senha do usuário
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/legacy/login:
 *   post:
 *     summary: Login do usuário legado
 *     description: Autentica usuário do sistema legado e retorna token JWT
 *     tags: [Autenticação - Sistema Legado]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário legado
 *               senha:
 *                 type: string
 *                 description: Senha do usuário legado
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/legacy/login', AuthController.legacyLogin);

/**
 * @swagger
 * /api/auth/user-types:
 *   get:
 *     summary: Obter tipos de usuário
 *     description: Retorna lista de tipos de usuário disponíveis no sistema
 *     tags: [Autenticação - Público]
 *     responses:
 *       200:
 *         description: Lista de tipos de usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nome:
 *                         type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/user-types', AuthController.getUserTypes);

// ========== ROTAS PROTEGIDAS ==========
router.use(authenticateToken); // aplica autenticação para todas rotas abaixo

/**
 * @swagger
 * /api/auth/verify-token:
 *   get:
 *     summary: Verificar validade do token
 *     description: Verifica se o token JWT fornecido é válido
 *     tags: [Autenticação - Protegido]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 valid:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       401:
 *         description: Token não fornecido
 *       403:
 *         description: Token inválido ou expirado
 */
router.get('/verify-token', AuthController.verifyToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obter perfil do usuário
 *     description: Retorna os dados do perfil do usuário autenticado
 *     tags: [Autenticação - Protegido]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nome:
 *                       type: string
 *                     email:
 *                       type: string
 *                     tipo:
 *                       type: integer
 *       401:
 *         description: Token não fornecido
 *       403:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/profile', verifyUserExists, AuthController.getProfile);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout do usuário
 *     description: Realiza logout do usuário autenticado
 *     tags: [Autenticação - Protegido]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Token não fornecido
 *       403:
 *         description: Token inválido
 */
router.post('/logout', AuthController.logout);

// ========== SISTEMA MODERNO ==========

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Atualizar perfil do usuário moderno
 *     description: Atualiza os dados do perfil do usuário do sistema moderno
 *     tags: [Sistema Moderno]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome completo do usuário
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido
 *       403:
 *         description: Acesso negado - apenas usuários modernos
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/profile', requireModernUser, verifyUserExists, AuthController.updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Alterar senha do usuário moderno
 *     description: Altera a senha do usuário do sistema moderno
 *     tags: [Sistema Moderno]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senhaAtual
 *               - novaSenha
 *             properties:
 *               senhaAtual:
 *                 type: string
 *                 description: Senha atual do usuário
 *               novaSenha:
 *                 type: string
 *                 minLength: 6
 *                 description: Nova senha do usuário
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
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos ou senha atual incorreta
 *       401:
 *         description: Token não fornecido
 *       403:
 *         description: Acesso negado - apenas usuários modernos
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/change-password', requireModernUser, verifyUserExists, AuthController.changePassword);

// ========== SISTEMA LEGADO ==========

/**
 * @swagger
 * /api/auth/legacy/logout:
 *   post:
 *     summary: Logout do usuário legado
 *     description: Realiza logout do usuário do sistema legado
 *     tags: [Sistema Legado]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Token não fornecido
 *       403:
 *         description: Acesso negado - apenas usuários legados
 */
router.post('/legacy/logout', requireLegacyUser, AuthController.legacyLogout);

// ========== ADMINISTRATIVO ==========

/**
 * @swagger
 * /api/auth/admin/users:
 *   get:
 *     summary: Listar usuários (Admin)
 *     description: Lista todos os usuários do sistema - acesso apenas para administradores
 *     tags: [Administrativo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nome:
 *                         type: string
 *                       email:
 *                         type: string
 *                       tipo:
 *                         type: integer
 *       401:
 *         description: Token não fornecido
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.get('/admin/users', requireAdmin, AuthController.adminUsers);

/**
 * @swagger
 * /api/auth/teacher/dashboard:
 *   get:
 *     summary: Dashboard do professor
 *     description: Acesso ao dashboard específico para professores e alunos (tipos 2 e 3)
 *     tags: [Administrativo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do dashboard do professor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Token não fornecido
 *       403:
 *         description: Acesso negado - apenas professores e alunos
 */
router.get('/teacher/dashboard', requireUserType([2, 3]), AuthController.teacherDashboard);

/**
 * @swagger
 * /api/auth/legacy/admin/dashboard:
 *   get:
 *     summary: Dashboard administrativo legado
 *     description: Acesso ao dashboard administrativo do sistema legado (tipos 1 e 2)
 *     tags: [Sistema Legado, Administrativo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do dashboard administrativo legado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Token não fornecido
 *       403:
 *         description: Acesso negado - apenas usuários legados com tipos 1 e 2
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/legacy/admin/dashboard', requireLegacyUser, verifyUserExists, requireLegacyUserType([1, 2]), AuthController.legacyAdminDashboard);

// ========== DEBUG ==========
if (process.env.NODE_ENV === 'development') {
  /**
   * @swagger
   * /api/auth/debug/user-info:
   *   get:
   *     summary: Informações de debug do usuário
   *     description: Retorna informações detalhadas do token e usuário para debug (apenas em desenvolvimento)
   *     tags: [Debug]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Informações de debug do usuário
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     tokenInfo:
   *                       type: object
   *                       description: Informações decodificadas do token
   *                     isLegacy:
   *                       type: boolean
   *                       description: Indica se é usuário do sistema legado
   *                     userType:
   *                       type: integer
   *                       description: Tipo do usuário
   *                     headers:
   *                       type: object
   *                       description: Headers da requisição
   *       401:
   *         description: Token não fornecido
   *       403:
   *         description: Token inválido
   *     x-internal: true
   */
  router.get('/debug/user-info', (req, res) => {
    res.json({
      success: true,
      data: {
        tokenInfo: req.user,
        isLegacy: req.user.legacy || false,
        userType: req.user.tipo,
        headers: req.headers
      }
    });
  });
}

export default router;
