/**
 * @swagger
 * tags:
 *   - name: Gestão Financeira - Serviços e Produtos
 *     description: Sistema completo de gestão financeira para serviços educacionais
 *   - name: Moedas
 *     description: Gestão de moedas do sistema
 *   - name: Categorias de Serviços
 *     description: Categorização de tipos de serviços
 *   - name: Tipos de Serviços
 *     description: Gestão de serviços e produtos financeiros
 *   - name: Consultas Especiais
 *     description: Operações especiais e relatórios
 *   - name: Relatórios Financeiros
 *     description: Relatórios e estatísticas do sistema financeiro
 *
 * components:
 *   schemas:
 *     # ===============================
 *     # SCHEMAS PRINCIPAIS
 *     # ===============================
 *     Moeda:
 *       type: object
 *       required:
 *         - designacao
 *       properties:
 *         codigo:
 *           type: integer
 *           description: Código único da moeda
 *           example: 1
 *         designacao:
 *           type: string
 *           maxLength: 45
 *           description: Designação da moeda
 *           example: "Kwanza Angolano"
 *       example:
 *         designacao: "Kwanza Angolano"
 *
 *     MoedaResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Moeda'
 *         - type: object
 *           properties:
 *             _count:
 *               type: object
 *               properties:
 *                 tb_tipo_servicos:
 *                   type: integer
 *                   description: Quantidade de serviços usando esta moeda
 *
 *     CategoriaServico:
 *       type: object
 *       properties:
 *         codigo:
 *           type: integer
 *           description: Código único da categoria
 *           example: 1
 *         designacao:
 *           type: string
 *           maxLength: 50
 *           description: Designação da categoria
 *           example: "Propinas e Mensalidades"
 *       example:
 *         designacao: "Propinas e Mensalidades"
 *
 *     CategoriaServicoResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/CategoriaServico'
 *         - type: object
 *           properties:
 *             _count:
 *               type: object
 *               properties:
 *                 tb_tipo_servicos:
 *                   type: integer
 *                   description: Quantidade de serviços nesta categoria
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
 *           example: 1
 *         designacao:
 *           type: string
 *           maxLength: 45
 *           description: Designação do serviço
 *           example: "Propina Mensal - 10ª Classe"
 *         preco:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Preço do serviço
 *           example: 15000.00
 *         descricao:
 *           type: string
 *           maxLength: 45
 *           description: Descrição detalhada do serviço
 *           example: "Propina mensal para alunos da 10ª classe"
 *         codigo_Utilizador:
 *           type: integer
 *           description: Código do utilizador que criou o serviço
 *           example: 1
 *         codigo_Moeda:
 *           type: integer
 *           description: Código da moeda utilizada
 *           example: 1
 *         tipoServico:
 *           type: string
 *           maxLength: 15
 *           description: Tipo/categoria do serviço
 *           example: "Propina"
 *           enum: ["Propina", "Taxa", "Multa", "Certificado", "Outro"]
 *         status:
 *           type: string
 *           maxLength: 45
 *           description: Status do serviço
 *           example: "Activo"
 *           enum: ["Activo", "Inactivo"]
 *           default: "Activo"
 *         aplicarMulta:
 *           type: boolean
 *           description: Indica se aplica multa por atraso
 *           example: true
 *           default: false
 *         aplicarDesconto:
 *           type: boolean
 *           description: Indica se permite aplicar desconto
 *           example: false
 *           default: false
 *         codigo_Ano:
 *           type: integer
 *           description: Código do ano de referência
 *           example: 1
 *           default: 1
 *         codigoAnoLectivo:
 *           type: integer
 *           nullable: true
 *           description: Código do ano letivo específico
 *           example: 1
 *         valorMulta:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Valor da multa aplicada
 *           example: 2000.00
 *           default: 0
 *         iva:
 *           type: integer
 *           nullable: true
 *           description: Código da taxa de IVA aplicável
 *           example: 1
 *         codigoRasao:
 *           type: integer
 *           nullable: true
 *           description: Código do motivo de IVA
 *           example: 1
 *         categoria:
 *           type: integer
 *           nullable: true
 *           description: Código da categoria do serviço
 *           example: 1
 *         codigo_multa:
 *           type: integer
 *           nullable: true
 *           description: Código do tipo de multa
 *           example: 1
 *       example:
 *         designacao: "Propina Mensal - 10ª Classe"
 *         preco: 15000.00
 *         descricao: "Propina mensal para alunos da 10ª classe"
 *         codigo_Utilizador: 1
 *         codigo_Moeda: 1
 *         tipoServico: "Propina"
 *         status: "Activo"
 *         aplicarMulta: true
 *         aplicarDesconto: false
 *         valorMulta: 2000.00
 *         categoria: 1
 *
 *     TipoServicoResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/TipoServico'
 *         - type: object
 *           properties:
 *             tb_moedas:
 *               type: object
 *               properties:
 *                 codigo:
 *                   type: integer
 *                 designacao:
 *                   type: string
 *             tb_categoria_servicos:
 *               type: object
 *               nullable: true
 *               properties:
 *                 codigo:
 *                   type: integer
 *                 designacao:
 *                   type: string
 *             _count:
 *               type: object
 *               properties:
 *                 tb_servicos_turma:
 *                   type: integer
 *                 tb_servico_aluno:
 *                   type: integer
 *                 tb_propina_classe:
 *                   type: integer
 *
 *     # ===============================
 *     # SCHEMAS DE RESPOSTA
 *     # ===============================
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operação realizada com sucesso"
 *         data:
 *           type: object
 *
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Dados encontrados"
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: integer
 *               example: 1
 *             totalPages:
 *               type: integer
 *               example: 5
 *             totalItems:
 *               type: integer
 *               example: 50
 *             itemsPerPage:
 *               type: integer
 *               example: 10
 *             hasNextPage:
 *               type: boolean
 *               example: true
 *             hasPreviousPage:
 *               type: boolean
 *               example: false
 *
 *     RelatorioFinanceiro:
 *       type: object
 *       properties:
 *         resumo:
 *           type: object
 *           properties:
 *             totalMoedas:
 *               type: integer
 *               description: Total de moedas cadastradas
 *               example: 3
 *             totalCategorias:
 *               type: integer
 *               description: Total de categorias de serviços
 *               example: 5
 *             totalTiposServicos:
 *               type: integer
 *               description: Total de tipos de serviços
 *               example: 25
 *             servicosAtivos:
 *               type: integer
 *               description: Serviços com status ativo
 *               example: 20
 *             servicosComMulta:
 *               type: integer
 *               description: Serviços que aplicam multa
 *               example: 15
 *             servicosComDesconto:
 *               type: integer
 *               description: Serviços que permitem desconto
 *               example: 8
 *
 *     # ===============================
 *     # SCHEMAS DE ERRO
 *     # ===============================
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Erro na operação"
 *         error:
 *           type: string
 *           example: "Detalhes do erro"
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
 *     description: Cria uma nova moeda no sistema financeiro
 *     tags: [Moedas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Moeda'
 *           example:
 *             designacao: "Kwanza Angolano"
 *     responses:
 *       201:
 *         description: Moeda criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MoedaResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Moeda já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TipoServicoResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Moeda não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Tipo de serviço já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/tipos-servicos', FinancialServicesController.createTipoServico);

/**
 * @swagger
 * /api/financial-services/tipos-servicos:
 *   get:
 *     summary: Listar tipos de serviços
 *     description: Lista todos os tipos de serviços com paginação e busca
 *     tags: [Tipos de Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Número da página
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Itens por página
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         description: Termo de busca (designação ou descrição)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tipos de serviços
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TipoServicoResponse'
 */
router.get('/tipos-servicos', FinancialServicesController.getTiposServicos);

// ROTAS ESPECIAIS DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS
/**
 * @swagger
 * /api/financial-services/tipos-servicos/ativos:
 *   get:
 *     summary: Buscar tipos de serviços ativos
 *     description: Lista todos os tipos de serviços com status "Activo"
 *     tags: [Consultas Especiais]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tipos de serviços ativos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TipoServicoResponse'
 */
router.get('/tipos-servicos/ativos', FinancialServicesController.getTiposServicosAtivos);

/**
 * @swagger
 * /api/financial-services/tipos-servicos/com-multa:
 *   get:
 *     summary: Buscar tipos de serviços com multa
 *     description: Lista todos os tipos de serviços que aplicam multa por atraso
 *     tags: [Consultas Especiais]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tipos de serviços com multa encontrados
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TipoServicoResponse'
 */
router.get('/tipos-servicos/com-multa', FinancialServicesController.getTiposServicosComMulta);

/**
 * @swagger
 * /api/financial-services/tipos-servicos/{id}:
 *   get:
 *     summary: Buscar tipo de serviço por ID
 *     description: Busca um tipo de serviço específico pelo seu código
 *     tags: [Tipos de Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Código do tipo de serviço
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Tipo de serviço encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TipoServicoResponse'
 *       404:
 *         description: Tipo de serviço não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/tipos-servicos/:id', FinancialServicesController.getTipoServicoById);

/**
 * @swagger
 * /api/financial-services/tipos-servicos/{id}:
 *   put:
 *     summary: Atualizar tipo de serviço
 *     description: Atualiza os dados de um tipo de serviço existente
 *     tags: [Tipos de Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Código do tipo de serviço
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoServico'
 *     responses:
 *       200:
 *         description: Tipo de serviço atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TipoServicoResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Tipo de serviço não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Designação já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/tipos-servicos/:id', FinancialServicesController.updateTipoServico);

/**
 * @swagger
 * /api/financial-services/tipos-servicos/{id}:
 *   delete:
 *     summary: Excluir tipo de serviço
 *     description: Remove um tipo de serviço do sistema (apenas se não houver dependências)
 *     tags: [Tipos de Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Código do tipo de serviço
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Tipo de serviço excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Tipo de serviço possui dependências
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Tipo de serviço não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/tipos-servicos/:id', FinancialServicesController.deleteTipoServico);

// ===============================
// ROTAS CONSULTAS ESPECIAIS
// ===============================

/**
 * @swagger
 * /api/financial-services/categorias/{id}/tipos-servicos:
 *   get:
 *     summary: Buscar tipos de serviços por categoria
 *     description: Lista todos os tipos de serviços de uma categoria específica
 *     tags: [Consultas Especiais]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Código da categoria
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Tipos de serviços encontrados por categoria
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TipoServicoResponse'
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/categorias/:id/tipos-servicos', FinancialServicesController.getTiposServicosPorCategoria);

/**
 * @swagger
 * /api/financial-services/moedas/{id}/tipos-servicos:
 *   get:
 *     summary: Buscar tipos de serviços por moeda
 *     description: Lista todos os tipos de serviços que utilizam uma moeda específica
 *     tags: [Consultas Especiais]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Código da moeda
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Tipos de serviços encontrados por moeda
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TipoServicoResponse'
 *       404:
 *         description: Moeda não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/moedas/:id/tipos-servicos', FinancialServicesController.getTiposServicosPorMoeda);

// ===============================
// ROTAS RELATÓRIOS FINANCEIROS
// ===============================

/**
 * @swagger
 * /api/financial-services/relatorio:
 *   get:
 *     summary: Gerar relatório financeiro completo
 *     description: Gera um relatório com estatísticas gerais do sistema financeiro
 *     tags: [Relatórios Financeiros]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório financeiro gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/RelatorioFinanceiro'
 */
router.get('/relatorio', FinancialServicesController.getRelatorioFinanceiro);

export default router;
