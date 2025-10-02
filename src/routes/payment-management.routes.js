/**
 * @swagger
 * components:
 *   schemas:
 *     FormaPagamento:
 *       type: object
 *       properties:
 *         codigo:
 *           type: integer
 *           description: ID da forma de pagamento
 *         designacao:
 *           type: string
 *           description: Nome da forma de pagamento
 *     
 *     PagamentoPrincipal:
 *       type: object
 *       properties:
 *         codigo:
 *           type: integer
 *           description: ID do pagamento principal
 *         data:
 *           type: string
 *           format: date
 *           description: Data do pagamento
 *         codigo_Aluno:
 *           type: integer
 *           description: ID do aluno
 *         status:
 *           type: integer
 *           description: Status do pagamento
 *         total:
 *           type: number
 *           description: Valor total
 *         valorEntregue:
 *           type: number
 *           description: Valor entregue
 *         dataBanco:
 *           type: string
 *           format: date
 *           description: Data do banco
 *         totalDesconto:
 *           type: number
 *           description: Total de desconto
 *         obs:
 *           type: string
 *           description: Observações
 *     
 *     DetalhePagamento:
 *       type: object
 *       properties:
 *         codigo:
 *           type: integer
 *           description: ID do detalhe de pagamento
 *         codigo_Aluno:
 *           type: integer
 *           description: ID do aluno
 *         codigo_Tipo_Servico:
 *           type: integer
 *           description: ID do tipo de serviço
 *         data:
 *           type: string
 *           format: date
 *           description: Data do pagamento
 *         n_Bordoro:
 *           type: string
 *           description: Número do borderô
 *         multa:
 *           type: number
 *           description: Valor da multa
 *         mes:
 *           type: string
 *           description: Mês de referência
 *         codigo_Utilizador:
 *           type: integer
 *           description: ID do utilizador
 *         observacao:
 *           type: string
 *           description: Observação
 *         ano:
 *           type: integer
 *           description: Ano de referência
 *         contaMovimentada:
 *           type: string
 *           description: Conta movimentada
 *         quantidade:
 *           type: integer
 *           description: Quantidade
 *         desconto:
 *           type: number
 *           description: Desconto aplicado
 *         totalgeral:
 *           type: number
 *           description: Total geral
 *         codigoPagamento:
 *           type: integer
 *           description: ID do pagamento principal
 *         tipoDocumento:
 *           type: string
 *           description: Tipo de documento
 *         fatura:
 *           type: string
 *           description: Número da fatura
 *         hash:
 *           type: string
 *           description: Hash do pagamento
 *         preco:
 *           type: number
 *           description: Preço unitário
 *     
 *     NotaCredito:
 *       type: object
 *       properties:
 *         codigo:
 *           type: integer
 *           description: ID da nota de crédito
 *         designacao:
 *           type: string
 *           description: Designação da nota
 *         fatura:
 *           type: string
 *           description: Número da fatura
 *         descricao:
 *           type: string
 *           description: Descrição da nota
 *         valor:
 *           type: string
 *           description: Valor da nota
 *         codigo_aluno:
 *           type: integer
 *           description: ID do aluno
 *         documento:
 *           type: string
 *           description: Número do documento
 *     
 *     MotivoAnulacao:
 *       type: object
 *       properties:
 *         codigo:
 *           type: integer
 *           description: ID do motivo
 *         designacao:
 *           type: string
 *           description: Descrição do motivo
 *     
 *     RelatorioFinanceiro:
 *       type: object
 *       properties:
 *         totalPagamentos:
 *           type: integer
 *           description: Total de pagamentos
 *         totalValor:
 *           type: number
 *           description: Valor total
 *         totalDesconto:
 *           type: number
 *           description: Total de descontos
 *         valorLiquido:
 *           type: number
 *           description: Valor líquido
 *     
 *     DashboardFinanceiro:
 *       type: object
 *       properties:
 *         resumo:
 *           type: object
 *           properties:
 *             totalPagamentosHoje:
 *               type: integer
 *             totalPagamentosMes:
 *               type: integer
 *             valorTotalMes:
 *               type: number
 *         formasPagamentoMaisUsadas:
 *           type: array
 *           items:
 *             type: object
 *         servicosMaisPagos:
 *           type: array
 *           items:
 *             type: object
 *   
 *   tags:
 *     - name: Gestão de Pagamentos - Formas de Pagamento
 *       description: Operações relacionadas às formas de pagamento
 *     - name: Gestão de Pagamentos - Pagamentos Principais
 *       description: Operações relacionadas aos pagamentos principais
 *     - name: Gestão de Pagamentos - Detalhes de Pagamento
 *       description: Operações relacionadas aos detalhes de pagamento
 *     - name: Gestão de Pagamentos - Notas de Crédito
 *       description: Operações relacionadas às notas de crédito
 *     - name: Gestão de Pagamentos - Motivos de Anulação
 *       description: Operações relacionadas aos motivos de anulação
 *     - name: Gestão de Pagamentos - Relatórios
 *       description: Relatórios e dashboards financeiros
 */

import express from 'express';
import { PaymentManagementController } from '../controller/payment-management.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// ===============================
// FORMAS DE PAGAMENTO
// ===============================

/**
 * @swagger
 * /api/payment-management/formas-pagamento:
 *   post:
 *     summary: Criar forma de pagamento
 *     tags: [Gestão de Pagamentos - Formas de Pagamento]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - designacao
 *             properties:
 *               designacao:
 *                 type: string
 *                 maxLength: 45
 *                 example: "Dinheiro"
 *     responses:
 *       201:
 *         description: Forma de pagamento criada com sucesso
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
 *                   example: "Forma de pagamento criada com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/FormaPagamento'
 *   get:
 *     summary: Listar formas de pagamento
 *     tags: [Gestão de Pagamentos - Formas de Pagamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por designação
 *     responses:
 *       200:
 *         description: Lista de formas de pagamento
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FormaPagamento'
 *                 pagination:
 *                   type: object
 */
router.post('/formas-pagamento', PaymentManagementController.createFormaPagamento);
router.get('/formas-pagamento', PaymentManagementController.getFormasPagamento);

/**
 * @swagger
 * /api/payment-management/formas-pagamento/{id}:
 *   get:
 *     summary: Buscar forma de pagamento por ID
 *     tags: [Gestão de Pagamentos - Formas de Pagamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da forma de pagamento
 *     responses:
 *       200:
 *         description: Forma de pagamento encontrada
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
 *                   $ref: '#/components/schemas/FormaPagamento'
 *   put:
 *     summary: Atualizar forma de pagamento
 *     tags: [Gestão de Pagamentos - Formas de Pagamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da forma de pagamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designacao:
 *                 type: string
 *                 maxLength: 45
 *     responses:
 *       200:
 *         description: Forma de pagamento atualizada
 *   delete:
 *     summary: Excluir forma de pagamento
 *     tags: [Gestão de Pagamentos - Formas de Pagamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da forma de pagamento
 *     responses:
 *       200:
 *         description: Forma de pagamento excluída
 */
router.get('/formas-pagamento/:id', PaymentManagementController.getFormaPagamentoById);
router.put('/formas-pagamento/:id', PaymentManagementController.updateFormaPagamento);
router.delete('/formas-pagamento/:id', PaymentManagementController.deleteFormaPagamento);

// ===============================
// PAGAMENTOS PRINCIPAIS
// ===============================

/**
 * @swagger
 * /api/payment-management/pagamentos-principais:
 *   post:
 *     summary: Criar pagamento principal
 *     tags: [Gestão de Pagamentos - Pagamentos Principais]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *               - codigo_Aluno
 *               - status
 *               - valorEntregue
 *               - dataBanco
 *             properties:
 *               data:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               codigo_Aluno:
 *                 type: integer
 *                 example: 123
 *               status:
 *                 type: integer
 *                 example: 1
 *               valorEntregue:
 *                 type: number
 *                 example: 15000
 *               dataBanco:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               totalDesconto:
 *                 type: number
 *                 example: 0
 *               obs:
 *                 type: string
 *                 maxLength: 200
 *   get:
 *     summary: Listar pagamentos principais
 *     tags: [Gestão de Pagamentos - Pagamentos Principais]
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
 *         name: codigo_Aluno
 *         schema:
 *           type: integer
 *         description: Filtrar por aluno
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data início (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data fim (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de pagamentos principais
 */
router.post('/pagamentos-principais', PaymentManagementController.createPagamentoi);
router.get('/pagamentos-principais', PaymentManagementController.getPagamentois);

/**
 * @swagger
 * /api/payment-management/pagamentos-principais/{id}:
 *   get:
 *     summary: Buscar pagamento principal por ID
 *     tags: [Gestão de Pagamentos - Pagamentos Principais]
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
 *         description: Pagamento principal encontrado
 *   put:
 *     summary: Atualizar pagamento principal
 *     tags: [Gestão de Pagamentos - Pagamentos Principais]
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
 *         description: Pagamento principal atualizado
 *   delete:
 *     summary: Excluir pagamento principal
 *     tags: [Gestão de Pagamentos - Pagamentos Principais]
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
 *         description: Pagamento principal excluído
 */
router.get('/pagamentos-principais/:id', PaymentManagementController.getPagamentoiById);
router.put('/pagamentos-principais/:id', PaymentManagementController.updatePagamentoi);
router.delete('/pagamentos-principais/:id', PaymentManagementController.deletePagamentoi);

// ===============================
// DETALHES DE PAGAMENTO
// ===============================

/**
 * @swagger
 * /api/payment-management/pagamentos:
 *   post:
 *     summary: Criar detalhe de pagamento
 *     tags: [Gestão de Pagamentos - Detalhes de Pagamento]
 *     security:
 *       - bearerAuth: []
 *   get:
 *     summary: Listar detalhes de pagamento
 *     tags: [Gestão de Pagamentos - Detalhes de Pagamento]
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
 *         name: codigo_Aluno
 *         schema:
 *           type: integer
 *         description: Filtrar por aluno
 *       - in: query
 *         name: codigo_Tipo_Servico
 *         schema:
 *           type: integer
 *         description: Filtrar por tipo de serviço
 */
router.post('/pagamentos', PaymentManagementController.createPagamento);
router.get('/pagamentos', PaymentManagementController.getPagamentos);

/**
 * @swagger
 * /api/payment-management/pagamentos/{id}:
 *   get:
 *     summary: Buscar detalhe de pagamento por ID
 *     tags: [Gestão de Pagamentos - Detalhes de Pagamento]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Atualizar detalhe de pagamento
 *     tags: [Gestão de Pagamentos - Detalhes de Pagamento]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Excluir detalhe de pagamento
 *     tags: [Gestão de Pagamentos - Detalhes de Pagamento]
 *     security:
 *       - bearerAuth: []
 */
router.get('/pagamentos/:id', PaymentManagementController.getPagamentoById);
router.put('/pagamentos/:id', PaymentManagementController.updatePagamento);
router.delete('/pagamentos/:id', PaymentManagementController.deletePagamento);

// ===============================
// NOTAS DE CRÉDITO
// ===============================

/**
 * @swagger
 * /api/payment-management/notas-credito:
 *   post:
 *     summary: Criar nota de crédito
 *     tags: [Gestão de Pagamentos - Notas de Crédito]
 *     security:
 *       - bearerAuth: []
 *   get:
 *     summary: Listar notas de crédito
 *     tags: [Gestão de Pagamentos - Notas de Crédito]
 *     security:
 *       - bearerAuth: []
 */
router.post('/notas-credito', PaymentManagementController.createNotaCredito);
router.get('/notas-credito', PaymentManagementController.getNotasCredito);

/**
 * @swagger
 * /api/payment-management/notas-credito/{id}:
 *   get:
 *     summary: Buscar nota de crédito por ID
 *     tags: [Gestão de Pagamentos - Notas de Crédito]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Atualizar nota de crédito
 *     tags: [Gestão de Pagamentos - Notas de Crédito]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Excluir nota de crédito
 *     tags: [Gestão de Pagamentos - Notas de Crédito]
 *     security:
 *       - bearerAuth: []
 */
router.get('/notas-credito/:id', PaymentManagementController.getNotaCreditoById);
router.put('/notas-credito/:id', PaymentManagementController.updateNotaCredito);
router.delete('/notas-credito/:id', PaymentManagementController.deleteNotaCredito);

// ===============================
// MOTIVOS DE ANULAÇÃO
// ===============================

/**
 * @swagger
 * /api/payment-management/motivos-anulacao:
 *   post:
 *     summary: Criar motivo de anulação
 *     tags: [Gestão de Pagamentos - Motivos de Anulação]
 *     security:
 *       - bearerAuth: []
 *   get:
 *     summary: Listar motivos de anulação
 *     tags: [Gestão de Pagamentos - Motivos de Anulação]
 *     security:
 *       - bearerAuth: []
 */
router.post('/motivos-anulacao', PaymentManagementController.createMotivoAnulacao);
router.get('/motivos-anulacao', PaymentManagementController.getMotivosAnulacao);

/**
 * @swagger
 * /api/payment-management/motivos-anulacao/{id}:
 *   get:
 *     summary: Buscar motivo de anulação por ID
 *     tags: [Gestão de Pagamentos - Motivos de Anulação]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Atualizar motivo de anulação
 *     tags: [Gestão de Pagamentos - Motivos de Anulação]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Excluir motivo de anulação
 *     tags: [Gestão de Pagamentos - Motivos de Anulação]
 *     security:
 *       - bearerAuth: []
 */
router.get('/motivos-anulacao/:id', PaymentManagementController.getMotivoAnulacaoById);
router.put('/motivos-anulacao/:id', PaymentManagementController.updateMotivoAnulacao);
router.delete('/motivos-anulacao/:id', PaymentManagementController.deleteMotivoAnulacao);

// ===============================
// RELATÓRIOS E DASHBOARDS
// ===============================

/**
 * @swagger
 * /api/payment-management/relatorio:
 *   get:
 *     summary: Gerar relatório financeiro
 *     tags: [Gestão de Pagamentos - Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data início (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: dataFim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data fim (YYYY-MM-DD)
 *         example: "2024-12-31"
 *       - in: query
 *         name: tipoRelatorio
 *         schema:
 *           type: string
 *           enum: [resumo, detalhado, por_aluno, por_servico]
 *           default: resumo
 *         description: Tipo de relatório
 *       - in: query
 *         name: codigo_Aluno
 *         schema:
 *           type: integer
 *         description: Filtrar por aluno específico
 *       - in: query
 *         name: codigo_FormaPagamento
 *         schema:
 *           type: integer
 *         description: Filtrar por forma de pagamento
 *     responses:
 *       200:
 *         description: Relatório financeiro gerado
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
 *                   example: "Relatório financeiro gerado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/RelatorioFinanceiro'
 *                 filtros:
 *                   type: object
 */
router.get('/relatorio', PaymentManagementController.getRelatorioFinanceiro);

/**
 * @swagger
 * /api/payment-management/dashboard:
 *   get:
 *     summary: Obter dashboard financeiro
 *     tags: [Gestão de Pagamentos - Relatórios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard financeiro
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
 *                   example: "Dashboard financeiro obtido com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/DashboardFinanceiro'
 */
router.get('/dashboard', PaymentManagementController.getDashboardFinanceiro);

/**
 * @swagger
 * /api/payment-management/estatisticas:
 *   get:
 *     summary: Obter estatísticas de pagamentos
 *     tags: [Gestão de Pagamentos - Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           default: "30"
 *         description: Período em dias (ex: 30, 60, 90)
 *         example: "30"
 *     responses:
 *       200:
 *         description: Estatísticas de pagamentos
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
 *                   example: "Estatísticas de pagamentos obtidas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     periodo:
 *                       type: string
 *                       example: "30 dias"
 *                     estatisticas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           data:
 *                             type: string
 *                             format: date
 *                           totalPagamentos:
 *                             type: integer
 *                           valorTotal:
 *                             type: number
 */
router.get('/estatisticas', PaymentManagementController.getEstatisticasPagamentos);

export default router;
