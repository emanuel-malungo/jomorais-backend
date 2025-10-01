/**
 * @swagger
 * components:
 *   schemas:
 *     Moeda:
 *       type: object
 *       required:
 *         - designacao
 *       properties:
 *         codigo:
 *           type: integer
 *           description: Código único da moeda
 *         designacao:
 *           type: string
 *           maxLength: 45
 *           description: Designação da moeda
 *       example:
 *         designacao: "Kwanza"
 *
 *     CategoriaServico:
 *       type: object
 *       properties:
 *         codigo:
 *           type: integer
 *           description: Código único da categoria
 *         designacao:
 *           type: string
 *           maxLength: 50
 *           description: Designação da categoria
 *       example:
 *         designacao: "Propinas"
 *
 *     TipoServico:
 *       type: object
 *       required:
 *         - designacao
 *         - preco
 *         - descricao
 *         - codigo_Utilizador
 *         - codigo_Moeda
 *         - tipoServico
 *       properties:
 *         codigo:
 *           type: integer
 *           description: Código único do tipo de serviço
 *         designacao:
 *           type: string
 *           maxLength: 45
 *           description: Designação do serviço
 *         preco:
 *           type: number
 *           description: Preço do serviço
 *         descricao:
 *           type: string
 *           maxLength: 45
 *           description: Descrição do serviço
 *         codigo_Utilizador:
 *           type: integer
 *           description: Código do utilizador
 *         codigo_Moeda:
 *           type: integer
 *           description: Código da moeda
 *         tipoServico:
 *           type: string
 *           maxLength: 15
 *           description: Tipo do serviço
 *         status:
 *           type: string
 *           maxLength: 45
 *           description: Status do serviço
 *         aplicarMulta:
 *           type: boolean
 *           description: Se aplica multa
 *         aplicarDesconto:
 *           type: boolean
 *           description: Se aplica desconto
 *         valorMulta:
 *           type: number
 *           description: Valor da multa
 *         categoria:
 *           type: integer
 *           description: Código da categoria
 *       example:
 *         designacao: "Propina Mensal"
 *         preco: 15000
 *         descricao: "Propina mensal do ensino médio"
 *         codigo_Utilizador: 1
 *         codigo_Moeda: 1
 *         tipoServico: "Propina"
 *         status: "Activo"
 *         aplicarMulta: true
 *         valorMulta: 2000
 *         categoria: 1
 */

import { Router } from 'express';
import { FinancialServicesController } from '../controller/financial-services.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Aplicar middleware de autenticação a todas as rotas
// router.use(authenticateToken);

// ===============================
// ROTAS MOEDAS
// ===============================

/**
 * @swagger
 * /api/financial-services/moedas:
 *   post:
 *     summary: Criar nova moeda
 *     tags: [Moedas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Moeda'
 *     responses:
 *       201:
 *         description: Moeda criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Moeda já existe
 */
router.post('/moedas', FinancialServicesController.createMoeda);

/**
 * @swagger
 * /api/financial-services/moedas:
 *   get:
 *     summary: Listar moedas
 *     tags: [Moedas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de moedas
 */
router.get('/moedas', FinancialServicesController.getMoedas);

/**
 * @swagger
 * /api/financial-services/moedas/{id}:
 *   get:
 *     summary: Buscar moeda por ID
 *     tags: [Moedas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Moeda encontrada
 *       404:
 *         description: Moeda não encontrada
 */
router.get('/moedas/:id', FinancialServicesController.getMoedaById);

/**
 * @swagger
 * /api/financial-services/moedas/{id}:
 *   put:
 *     summary: Atualizar moeda
 *     tags: [Moedas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Moeda'
 *     responses:
 *       200:
 *         description: Moeda atualizada com sucesso
 *       404:
 *         description: Moeda não encontrada
 */
router.put('/moedas/:id', FinancialServicesController.updateMoeda);

/**
 * @swagger
 * /api/financial-services/moedas/{id}:
 *   delete:
 *     summary: Excluir moeda
 *     tags: [Moedas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Moeda excluída com sucesso
 *       400:
 *         description: Moeda possui dependências
 *       404:
 *         description: Moeda não encontrada
 */
router.delete('/moedas/:id', FinancialServicesController.deleteMoeda);

// ===============================
// ROTAS CATEGORIAS DE SERVIÇOS
// ===============================

/**
 * @swagger
 * /api/financial-services/categorias:
 *   post:
 *     summary: Criar nova categoria de serviço
 *     tags: [Categorias de Serviços]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaServico'
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 */
router.post('/categorias', FinancialServicesController.createCategoriaServico);

/**
 * @swagger
 * /api/financial-services/categorias:
 *   get:
 *     summary: Listar categorias de serviços
 *     tags: [Categorias de Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/categorias', FinancialServicesController.getCategoriasServicos);

/**
 * @swagger
 * /api/financial-services/categorias/{id}:
 *   get:
 *     summary: Buscar categoria por ID
 *     tags: [Categorias de Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *       404:
 *         description: Categoria não encontrada
 */
router.get('/categorias/:id', FinancialServicesController.getCategoriaServicoById);

/**
 * @swagger
 * /api/financial-services/categorias/{id}:
 *   put:
 *     summary: Atualizar categoria
 *     tags: [Categorias de Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaServico'
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 */
router.put('/categorias/:id', FinancialServicesController.updateCategoriaServico);

/**
 * @swagger
 * /api/financial-services/categorias/{id}:
 *   delete:
 *     summary: Excluir categoria
 *     tags: [Categorias de Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoria excluída com sucesso
 *       400:
 *         description: Categoria possui dependências
 */
router.delete('/categorias/:id', FinancialServicesController.deleteCategoriaServico);

// ===============================
// ROTAS TIPOS DE SERVIÇOS
// ===============================

/**
 * @swagger
 * /api/financial-services/tipos-servicos:
 *   post:
 *     summary: Criar novo tipo de serviço
 *     tags: [Tipos de Serviços]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoServico'
 *     responses:
 *       201:
 *         description: Tipo de serviço criado com sucesso
 */
router.post('/tipos-servicos', FinancialServicesController.createTipoServico);

/**
 * @swagger
 * /api/financial-services/tipos-servicos:
 *   get:
 *     summary: Listar tipos de serviços
 *     tags: [Tipos de Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tipos de serviços
 */
router.get('/tipos-servicos', FinancialServicesController.getTiposServicos);

/**
 * @swagger
 * /api/financial-services/tipos-servicos/{id}:
 *   get:
 *     summary: Buscar tipo de serviço por ID
 *     tags: [Tipos de Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de serviço encontrado
 *       404:
 *         description: Tipo de serviço não encontrado
 */
router.get('/tipos-servicos/:id', FinancialServicesController.getTipoServicoById);

/**
 * @swagger
 * /api/financial-services/tipos-servicos/{id}:
 *   put:
 *     summary: Atualizar tipo de serviço
 *     tags: [Tipos de Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoServico'
 *     responses:
 *       200:
 *         description: Tipo de serviço atualizado com sucesso
 */
router.put('/tipos-servicos/:id', FinancialServicesController.updateTipoServico);

/**
 * @swagger
 * /api/financial-services/tipos-servicos/{id}:
 *   delete:
 *     summary: Excluir tipo de serviço
 *     tags: [Tipos de Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de serviço excluído com sucesso
 *       400:
 *         description: Tipo de serviço possui dependências
 */
router.delete('/tipos-servicos/:id', FinancialServicesController.deleteTipoServico);

// ===============================
// ROTAS OPERAÇÕES ESPECIAIS
// ===============================

/**
 * @swagger
 * /api/financial-services/categorias/{id}/tipos-servicos:
 *   get:
 *     summary: Buscar tipos de serviços por categoria
 *     tags: [Operações Especiais]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipos de serviços encontrados por categoria
 */
router.get('/categorias/:id/tipos-servicos', FinancialServicesController.getTiposServicosPorCategoria);

/**
 * @swagger
 * /api/financial-services/moedas/{id}/tipos-servicos:
 *   get:
 *     summary: Buscar tipos de serviços por moeda
 *     tags: [Operações Especiais]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipos de serviços encontrados por moeda
 */
router.get('/moedas/:id/tipos-servicos', FinancialServicesController.getTiposServicosPorMoeda);

/**
 * @swagger
 * /api/financial-services/tipos-servicos/ativos:
 *   get:
 *     summary: Buscar tipos de serviços ativos
 *     tags: [Operações Especiais]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tipos de serviços ativos encontrados
 */
router.get('/tipos-servicos/ativos', FinancialServicesController.getTiposServicosAtivos);

/**
 * @swagger
 * /api/financial-services/tipos-servicos/com-multa:
 *   get:
 *     summary: Buscar tipos de serviços com multa
 *     tags: [Operações Especiais]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tipos de serviços com multa encontrados
 */
router.get('/tipos-servicos/com-multa', FinancialServicesController.getTiposServicosComMulta);

/**
 * @swagger
 * /api/financial-services/relatorio:
 *   get:
 *     summary: Gerar relatório financeiro
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório financeiro gerado
 */
router.get('/relatorio', FinancialServicesController.getRelatorioFinanceiro);

export default router;
