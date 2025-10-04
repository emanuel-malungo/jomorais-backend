// services/payment-management.services.js
import prisma from '../config/database.js';
import { AppError } from '../utils/validation.utils.js';
import { getPagination } from '../utils/pagination.utils.js';

export class PaymentManagementService {
  // ===============================
  // FORMAS DE PAGAMENTO - CRUD COMPLETO
  // ===============================

  static async createFormaPagamento(data) {
    try {
      const formaPagamento = await prisma.tb_forma_pagamento.create({
        data: {
          designacao: data.designacao
        }
      });

      return formaPagamento;
    } catch (error) {
      console.error('Erro ao criar forma de pagamento:', error);
      throw new AppError('Erro ao criar forma de pagamento', 500);
    }
  }

  static async getFormasPagamento(page = 1, limit = 10, search = '') {
    try {
      const { skip, take } = getPagination(page, limit);
      
      const where = search ? {
        designacao: {
          contains: search,
          mode: 'insensitive'
        }
      } : {};

      const [formasPagamento, total] = await Promise.all([
        prisma.tb_forma_pagamento.findMany({
          where,
          skip,
          take,
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_forma_pagamento.count({ where })
      ]);

      return {
        data: formasPagamento,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
      throw new AppError('Erro ao buscar formas de pagamento', 500);
    }
  }

  static async getFormaPagamentoById(id) {
    try {
      const formaPagamento = await prisma.tb_forma_pagamento.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!formaPagamento) {
        throw new AppError('Forma de pagamento não encontrada', 404);
      }

      return formaPagamento;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao buscar forma de pagamento:', error);
      throw new AppError('Erro ao buscar forma de pagamento', 500);
    }
  }

  static async updateFormaPagamento(id, data) {
    try {
      const existingFormaPagamento = await this.getFormaPagamentoById(id);

      const updatedFormaPagamento = await prisma.tb_forma_pagamento.update({
        where: { codigo: parseInt(id) },
        data: {
          designacao: data.designacao
        }
      });

      return updatedFormaPagamento;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao atualizar forma de pagamento:', error);
      throw new AppError('Erro ao atualizar forma de pagamento', 500);
    }
  }

  static async deleteFormaPagamento(id) {
    try {
      const existingFormaPagamento = await this.getFormaPagamentoById(id);

      // Verificar se há pagamentos associados
      const pagamentosCount = await prisma.tb_pagamentos.count({
        where: { codigo_FormaPagamento: parseInt(id) }
      });

      if (pagamentosCount > 0) {
        throw new AppError('Não é possível excluir forma de pagamento com pagamentos associados', 400);
      }

      await prisma.tb_forma_pagamento.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Forma de pagamento excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao excluir forma de pagamento:', error);
      throw new AppError('Erro ao excluir forma de pagamento', 500);
    }
  }

  // ===============================
  // PAGAMENTO PRINCIPAL (tb_pagamentoi) - CRUD COMPLETO
  // ===============================

  static async createPagamentoi(data) {
    try {
      // Verificar se o aluno existe
      const alunoExists = await prisma.tb_alunos.findUnique({
        where: { codigo: data.codigo_Aluno }
      });

      if (!alunoExists) {
        throw new AppError('Aluno não encontrado', 404);
      }

      // Verificar se o utilizador existe (se fornecido)
      if (data.codigoUtilizador) {
        const utilizadorExists = await prisma.tb_utilizadores.findUnique({
          where: { codigo: data.codigoUtilizador }
        });

        if (!utilizadorExists) {
          throw new AppError('Utilizador não encontrado', 404);
        }
      }

      const pagamentoi = await prisma.tb_pagamentoi.create({
        data: {
          data: data.data,
          codigo_Aluno: data.codigo_Aluno,
          status: data.status,
          total: data.total,
          valorEntregue: data.valorEntregue,
          dataBanco: data.dataBanco,
          totalDesconto: data.totalDesconto || 0,
          obs: data.obs,
          borderoux: data.borderoux,
          saldoAnterior: data.saldoAnterior || 0,
          descontoSaldo: data.descontoSaldo || 0,
          saldo: data.saldo || 0,
          codigoPagamento: data.codigoPagamento || 0,
          saldoOperacao: data.saldoOperacao || 0,
          codigoUtilizador: data.codigoUtilizador,
          hash: data.hash,
          tipoDocumento: data.tipoDocumento,
          totalIva: data.totalIva,
          nifCliente: data.nifCliente,
          troco: data.troco
        },
        include: {
          tb_pagamentos: {
            select: {
              codigo: true,
              mes: true,
              totalgeral: true,
              tipoDocumento: true
            }
          },
          tb_nota_credito: {
            select: {
              codigo: true,
              designacao: true,
              valor: true
            }
          }
        }
      });

      return pagamentoi;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao criar pagamento principal:', error);
      throw new AppError('Erro ao criar pagamento principal', 500);
    }
  }

  static async getPagamentois(page = 1, limit = 10, filters = {}) {
    try {
      const { skip, take } = getPagination(page, limit);
      
      let where = {};

      // Aplicar filtros
      if (filters.codigo_Aluno) {
        where.codigo_Aluno = filters.codigo_Aluno;
      }

      if (filters.status !== undefined) {
        where.status = filters.status;
      }

      if (filters.dataInicio && filters.dataFim) {
        where.data = {
          gte: new Date(filters.dataInicio),
          lte: new Date(filters.dataFim)
        };
      } else if (filters.dataInicio) {
        where.data = {
          gte: new Date(filters.dataInicio)
        };
      } else if (filters.dataFim) {
        where.data = {
          lte: new Date(filters.dataFim)
        };
      }

      // Implementação robusta baseada na memória - step-by-step query approach
      let pagamentois, total;

      try {
        [pagamentois, total] = await Promise.all([
          prisma.tb_pagamentoi.findMany({
            where,
            skip,
            take,
            orderBy: { data: 'desc' }
          }),
          prisma.tb_pagamentoi.count({ where })
        ]);

        // Buscar dados relacionados para cada pagamento
        const pagamentoisComDados = await Promise.all(
          pagamentois.map(async (pagamento) => {
            try {
              const [aluno, pagamentosDetalhes] = await Promise.all([
                // Buscar dados do aluno
                prisma.tb_alunos.findUnique({
                  where: { codigo: pagamento.codigo_Aluno },
                  select: {
                    codigo: true,
                    nome: true
                  }
                }).catch(() => null),
                
                // Buscar detalhes dos pagamentos
                prisma.tb_pagamentos.findMany({
                  where: { codigoPagamento: pagamento.codigo },
                  select: {
                    codigo: true,
                    codigo_Tipo_Servico: true,
                    preco: true,
                    quantidade: true,
                    desconto: true,
                    totalgeral: true,
                    tipoServico: {
                      select: {
                        codigo: true,
                        designacao: true
                      }
                    }
                  }
                }).catch(() => [])
              ]);

              return {
                ...pagamento,
                aluno,
                detalhes: pagamentosDetalhes
              };
            } catch (error) {
              console.error(`Erro ao buscar dados relacionados para pagamento ${pagamento.codigo}:`, error);
              return pagamento;
            }
          })
        );

        return {
          data: pagamentoisComDados,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
          }
        };

      } catch (error) {
        console.error('Erro ao buscar pagamentos principais:', error);
        throw new AppError('Erro ao buscar pagamentos principais', 500);
      }
    } catch (error) {
      console.error('Erro geral ao buscar pagamentos principais:', error);
      throw new AppError('Erro ao buscar pagamentos principais', 500);
    }
  }

  static async getPagamentoiById(id) {
    try {
      // Implementação robusta baseada na memória - step-by-step query approach
      let pagamentoi;

      try {
        pagamentoi = await prisma.tb_pagamentoi.findUnique({
          where: { codigo: parseInt(id) }
        });

        if (!pagamentoi) {
          throw new AppError('Pagamento não encontrado', 404);
        }

        // Buscar dados relacionados
        const [aluno, detalhes, notasCredito] = await Promise.all([
          // Dados do aluno
          prisma.tb_alunos.findUnique({
            where: { codigo: pagamentoi.codigo_Aluno },
            select: {
              codigo: true,
              nome: true,
              email: true,
              telefone: true
            }
          }).catch(() => null),

          // Detalhes dos pagamentos
          prisma.tb_pagamentos.findMany({
            where: { codigoPagamento: pagamentoi.codigo },
            include: {
              tipoServico: {
                select: {
                  codigo: true,
                  designacao: true,
                  preco: true
                }
              },
              formaPagamento: {
                select: {
                  codigo: true,
                  designacao: true
                }
              },
              utilizador: {
                select: {
                  codigo: true,
                  nome: true
                }
              }
            }
          }).catch(() => []),

          // Notas de crédito associadas
          prisma.tb_nota_credito.findMany({
            where: { codigoPagamentoi: pagamentoi.codigo }
          }).catch(() => [])
        ]);

        return {
          ...pagamentoi,
          aluno,
          detalhes,
          notasCredito
        };

      } catch (error) {
        if (error instanceof AppError) throw error;
        console.error('Erro ao buscar pagamento por ID:', error);
        throw new AppError('Erro ao buscar pagamento', 500);
      }
    } catch (error) {
      console.error('Erro geral ao buscar pagamento por ID:', error);
      throw new AppError('Erro ao buscar pagamento', 500);
    }
  }

  static async updatePagamentoi(id, data) {
    try {
      const existingPagamentoi = await this.getPagamentoiById(id);

      const updatedPagamentoi = await prisma.tb_pagamentoi.update({
        where: { codigo: parseInt(id) },
        data: {
          data: data.data,
          status: data.status,
          total: data.total,
          valorEntregue: data.valorEntregue,
          dataBanco: data.dataBanco,
          totalDesconto: data.totalDesconto,
          obs: data.obs,
          borderoux: data.borderoux,
          saldoAnterior: data.saldoAnterior,
          descontoSaldo: data.descontoSaldo,
          saldo: data.saldo,
          saldoOperacao: data.saldoOperacao,
          codigoUtilizador: data.codigoUtilizador,
          hash: data.hash,
          tipoDocumento: data.tipoDocumento,
          totalIva: data.totalIva,
          nifCliente: data.nifCliente,
          troco: data.troco
        }
      });

      return updatedPagamentoi;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao atualizar pagamento principal:', error);
      throw new AppError('Erro ao atualizar pagamento principal', 500);
    }
  }

  static async deletePagamentoi(id) {
    try {
      const existingPagamentoi = await this.getPagamentoiById(id);

      // Verificar se há detalhes de pagamento associados
      const detalhesCount = await prisma.tb_pagamentos.count({
        where: { codigoPagamento: parseInt(id) }
      });

      if (detalhesCount > 0) {
        throw new AppError('Não é possível excluir pagamento com detalhes associados', 400);
      }

      await prisma.tb_pagamentoi.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Pagamento excluído com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao excluir pagamento principal:', error);
      throw new AppError('Erro ao excluir pagamento principal', 500);
    }
  }

  // ===============================
  // DETALHES DE PAGAMENTO (tb_pagamentos) - CRUD COMPLETO
  // ===============================

  static async createPagamento(data) {
    try {
      // Verificações de integridade
      const [alunoExists, tipoServicoExists, utilizadorExists, pagamentoiExists, formaPagamentoExists] = await Promise.all([
        prisma.tb_alunos.findUnique({ where: { codigo: data.codigo_Aluno } }),
        data.codigo_Tipo_Servico ? prisma.tb_tipo_servicos.findUnique({ where: { codigo: data.codigo_Tipo_Servico } }) : Promise.resolve(true),
        prisma.tb_utilizadores.findUnique({ where: { codigo: data.codigo_Utilizador } }),
        prisma.tb_pagamentoi.findUnique({ where: { codigo: data.codigoPagamento } }),
        data.codigo_FormaPagamento ? prisma.tb_forma_pagamento.findUnique({ where: { codigo: data.codigo_FormaPagamento } }) : Promise.resolve(true)
      ]);

      if (!alunoExists) {
        throw new AppError('Aluno não encontrado', 404);
      }

      if (data.codigo_Tipo_Servico && !tipoServicoExists) {
        throw new AppError('Tipo de serviço não encontrado', 404);
      }

      if (!utilizadorExists) {
        throw new AppError('Utilizador não encontrado', 404);
      }

      if (!pagamentoiExists) {
        throw new AppError('Pagamento principal não encontrado', 404);
      }

      if (data.codigo_FormaPagamento && !formaPagamentoExists) {
        throw new AppError('Forma de pagamento não encontrada', 404);
      }

      const pagamento = await prisma.tb_pagamentos.create({
        data: {
          codigo_Aluno: data.codigo_Aluno,
          codigo_Tipo_Servico: data.codigo_Tipo_Servico,
          data: data.data,
          n_Bordoro: data.n_Bordoro,
          multa: data.multa || 0,
          mes: data.mes,
          codigo_Utilizador: data.codigo_Utilizador,
          observacao: data.observacao || '',
          ano: data.ano || new Date().getFullYear(),
          contaMovimentada: data.contaMovimentada,
          quantidade: data.quantidade,
          desconto: data.desconto,
          totalgeral: data.totalgeral,
          dataBanco: data.dataBanco,
          codigo_Estatus: data.codigo_Estatus || 1,
          codigo_Empresa: data.codigo_Empresa || 1,
          codigo_FormaPagamento: data.codigo_FormaPagamento || 1,
          saldo_Anterior: data.saldo_Anterior || 0,
          codigoPagamento: data.codigoPagamento,
          descontoSaldo: data.descontoSaldo || 1,
          tipoDocumento: data.tipoDocumento,
          next: data.next || '',
          codoc: data.codoc || 0,
          fatura: data.fatura,
          taxa_iva: data.taxa_iva,
          hash: data.hash,
          preco: data.preco || 0,
          indice_mes: data.indice_mes,
          indice_ano: data.indice_ano
        }
      });

      return pagamento;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao criar detalhe de pagamento:', error);
      throw new AppError('Erro ao criar detalhe de pagamento', 500);
    }
  }

  static async getPagamentos(page = 1, limit = 10, filters = {}) {
    try {
      const { skip, take } = getPagination(page, limit);
      
      let where = {};

      // Aplicar filtros similares aos pagamentois
      if (filters.codigo_Aluno) {
        where.codigo_Aluno = filters.codigo_Aluno;
      }

      if (filters.codigo_Tipo_Servico) {
        where.codigo_Tipo_Servico = filters.codigo_Tipo_Servico;
      }

      if (filters.dataInicio && filters.dataFim) {
        where.data = {
          gte: new Date(filters.dataInicio),
          lte: new Date(filters.dataFim)
        };
      }

      const [pagamentos, total] = await Promise.all([
        prisma.tb_pagamentos.findMany({
          where,
          skip,
          take,
          include: {
            aluno: {
              select: { codigo: true, nome: true }
            },
            tipoServico: {
              select: { codigo: true, designacao: true }
            },
            formaPagamento: {
              select: { codigo: true, designacao: true }
            }
          },
          orderBy: { data: 'desc' }
        }),
        prisma.tb_pagamentos.count({ where })
      ]);

      return {
        data: pagamentos,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes de pagamento:', error);
      throw new AppError('Erro ao buscar detalhes de pagamento', 500);
    }
  }

  static async getPagamentoById(id) {
    try {
      const pagamento = await prisma.tb_pagamentos.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          aluno: {
            select: { codigo: true, nome: true, email: true }
          },
          tipoServico: {
            select: { codigo: true, designacao: true, preco: true }
          },
          formaPagamento: {
            select: { codigo: true, designacao: true }
          },
          utilizador: {
            select: { codigo: true, nome: true }
          },
          pagamento: {
            select: { codigo: true, data: true, total: true }
          }
        }
      });

      if (!pagamento) {
        throw new AppError('Detalhe de pagamento não encontrado', 404);
      }

      return pagamento;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao buscar detalhe de pagamento:', error);
      throw new AppError('Erro ao buscar detalhe de pagamento', 500);
    }
  }

  static async updatePagamento(id, data) {
    try {
      const existingPagamento = await this.getPagamentoById(id);

      const updatedPagamento = await prisma.tb_pagamentos.update({
        where: { codigo: parseInt(id) },
        data: {
          codigo_Tipo_Servico: data.codigo_Tipo_Servico,
          data: data.data,
          n_Bordoro: data.n_Bordoro,
          multa: data.multa,
          mes: data.mes,
          observacao: data.observacao,
          ano: data.ano,
          contaMovimentada: data.contaMovimentada,
          quantidade: data.quantidade,
          desconto: data.desconto,
          totalgeral: data.totalgeral,
          dataBanco: data.dataBanco,
          codigo_FormaPagamento: data.codigo_FormaPagamento,
          saldo_Anterior: data.saldo_Anterior,
          descontoSaldo: data.descontoSaldo,
          tipoDocumento: data.tipoDocumento,
          next: data.next,
          fatura: data.fatura,
          taxa_iva: data.taxa_iva,
          hash: data.hash,
          preco: data.preco,
          indice_mes: data.indice_mes,
          indice_ano: data.indice_ano
        }
      });

      return updatedPagamento;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao atualizar detalhe de pagamento:', error);
      throw new AppError('Erro ao atualizar detalhe de pagamento', 500);
    }
  }

  static async deletePagamento(id) {
    try {
      const existingPagamento = await this.getPagamentoById(id);

      await prisma.tb_pagamentos.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Detalhe de pagamento excluído com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao excluir detalhe de pagamento:', error);
      throw new AppError('Erro ao excluir detalhe de pagamento', 500);
    }
  }

  // ===============================
  // NOTAS DE CRÉDITO - CRUD COMPLETO
  // ===============================

  static async createNotaCredito(data) {
    try {
      // Verificar se o aluno existe
      const alunoExists = await prisma.tb_alunos.findUnique({
        where: { codigo: data.codigo_aluno }
      });

      if (!alunoExists) {
        throw new AppError('Aluno não encontrado', 404);
      }

      const notaCredito = await prisma.tb_nota_credito.create({
        data: {
          designacao: data.designacao,
          fatura: data.fatura,
          descricao: data.descricao,
          valor: data.valor,
          codigo_aluno: data.codigo_aluno,
          documento: data.documento,
          next: data.next || '',
          dataOperacao: data.dataOperacao || '00-00-0000',
          hash: data.hash,
          codigoPagamentoi: data.codigoPagamentoi
        }
      });

      return notaCredito;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao criar nota de crédito:', error);
      throw new AppError('Erro ao criar nota de crédito', 500);
    }
  }

  static async getNotasCredito(page = 1, limit = 10, search = '') {
    try {
      const { skip, take } = getPagination(page, limit);
      
      const where = search ? {
        OR: [
          { designacao: { contains: search, mode: 'insensitive' } },
          { fatura: { contains: search, mode: 'insensitive' } },
          { documento: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [notasCredito, total] = await Promise.all([
        prisma.tb_nota_credito.findMany({
          where,
          skip,
          take,
          include: {
            tb_alunos: {
              select: { codigo: true, nome: true }
            },
            tb_pagamentoi: {
              select: { codigo: true, data: true, total: true }
            }
          },
          orderBy: { codigo: 'desc' }
        }),
        prisma.tb_nota_credito.count({ where })
      ]);

      return {
        data: notasCredito,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Erro ao buscar notas de crédito:', error);
      throw new AppError('Erro ao buscar notas de crédito', 500);
    }
  }

  static async getNotaCreditoById(id) {
    try {
      const notaCredito = await prisma.tb_nota_credito.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_alunos: {
            select: { codigo: true, nome: true, email: true }
          },
          tb_pagamentoi: {
            select: { codigo: true, data: true, total: true }
          }
        }
      });

      if (!notaCredito) {
        throw new AppError('Nota de crédito não encontrada', 404);
      }

      return notaCredito;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao buscar nota de crédito:', error);
      throw new AppError('Erro ao buscar nota de crédito', 500);
    }
  }

  static async updateNotaCredito(id, data) {
    try {
      const existingNotaCredito = await this.getNotaCreditoById(id);

      const updatedNotaCredito = await prisma.tb_nota_credito.update({
        where: { codigo: parseInt(id) },
        data: {
          designacao: data.designacao,
          fatura: data.fatura,
          descricao: data.descricao,
          valor: data.valor,
          documento: data.documento,
          next: data.next,
          dataOperacao: data.dataOperacao,
          hash: data.hash,
          codigoPagamentoi: data.codigoPagamentoi
        }
      });

      return updatedNotaCredito;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao atualizar nota de crédito:', error);
      throw new AppError('Erro ao atualizar nota de crédito', 500);
    }
  }

  static async deleteNotaCredito(id) {
    try {
      const existingNotaCredito = await this.getNotaCreditoById(id);

      await prisma.tb_nota_credito.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Nota de crédito excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao excluir nota de crédito:', error);
      throw new AppError('Erro ao excluir nota de crédito', 500);
    }
  }

  // ===============================
  // MOTIVOS DE ANULAÇÃO - CRUD COMPLETO
  // ===============================

  static async createMotivoAnulacao(data) {
    try {
      const motivoAnulacao = await prisma.tb_motivos_anulacao.create({
        data: {
          designacao: data.designacao
        }
      });

      return motivoAnulacao;
    } catch (error) {
      console.error('Erro ao criar motivo de anulação:', error);
      throw new AppError('Erro ao criar motivo de anulação', 500);
    }
  }

  static async getMotivosAnulacao(page = 1, limit = 10, search = '') {
    try {
      const { skip, take } = getPagination(page, limit);
      
      const where = search ? {
        designacao: {
          contains: search,
          mode: 'insensitive'
        }
      } : {};

      const [motivosAnulacao, total] = await Promise.all([
        prisma.tb_motivos_anulacao.findMany({
          where,
          skip,
          take,
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_motivos_anulacao.count({ where })
      ]);

      return {
        data: motivosAnulacao,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Erro ao buscar motivos de anulação:', error);
      throw new AppError('Erro ao buscar motivos de anulação', 500);
    }
  }

  static async getMotivoAnulacaoById(id) {
    try {
      const motivoAnulacao = await prisma.tb_motivos_anulacao.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!motivoAnulacao) {
        throw new AppError('Motivo de anulação não encontrado', 404);
      }

      return motivoAnulacao;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao buscar motivo de anulação:', error);
      throw new AppError('Erro ao buscar motivo de anulação', 500);
    }
  }

  static async updateMotivoAnulacao(id, data) {
    try {
      const existingMotivoAnulacao = await this.getMotivoAnulacaoById(id);

      const updatedMotivoAnulacao = await prisma.tb_motivos_anulacao.update({
        where: { codigo: parseInt(id) },
        data: {
          designacao: data.designacao
        }
      });

      return updatedMotivoAnulacao;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao atualizar motivo de anulação:', error);
      throw new AppError('Erro ao atualizar motivo de anulação', 500);
    }
  }

  static async deleteMotivoAnulacao(id) {
    try {
      const existingMotivoAnulacao = await this.getMotivoAnulacaoById(id);

      await prisma.tb_motivos_anulacao.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Motivo de anulação excluído com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao excluir motivo de anulação:', error);
      throw new AppError('Erro ao excluir motivo de anulação', 500);
    }
  }

  // ===============================
  // DASHBOARDS E ESTATÍSTICAS
  // ===============================

  static async getDashboardFinanceiro() {
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      const [
        totalPagamentosHoje,
        totalPagamentosMes,
        valorTotalMes,
        formasPagamentoMaisUsadas,
        servicosMaisPagos
      ] = await Promise.all([
        // Pagamentos de hoje
        prisma.tb_pagamentos.count({
          where: {
            data: {
              gte: new Date(hoje.setHours(0, 0, 0, 0)),
              lte: new Date(hoje.setHours(23, 59, 59, 999))
            }
          }
        }),

        // Pagamentos do mês
        prisma.tb_pagamentos.count({
          where: {
            data: {
              gte: inicioMes,
              lte: fimMes
            }
          }
        }),

        // Valor total do mês
        prisma.tb_pagamentos.aggregate({
          where: {
            data: {
              gte: inicioMes,
              lte: fimMes
            }
          },
          _sum: { totalgeral: true }
        }),

        // Formas de pagamento mais usadas
        prisma.tb_pagamentos.groupBy({
          by: ['codigo_FormaPagamento'],
          where: {
            data: {
              gte: inicioMes,
              lte: fimMes
            }
          },
          _count: { codigo: true },
          orderBy: { _count: { codigo: 'desc' } },
          take: 5
        }),

        // Serviços mais pagos
        prisma.tb_pagamentos.groupBy({
          by: ['codigo_Tipo_Servico'],
          where: {
            data: {
              gte: inicioMes,
              lte: fimMes
            },
            codigo_Tipo_Servico: { not: null }
          },
          _count: { codigo: true },
          _sum: { totalgeral: true },
          orderBy: { _count: { codigo: 'desc' } },
          take: 5
        })
      ]);

      return {
        resumo: {
          totalPagamentosHoje,
          totalPagamentosMes,
          valorTotalMes: valorTotalMes._sum.totalgeral || 0
        },
        formasPagamentoMaisUsadas,
        servicosMaisPagos
      };
    } catch (error) {
      console.error('Erro ao obter dashboard financeiro:', error);
      throw new AppError('Erro ao obter dashboard financeiro', 500);
    }
  }

  static async getEstatisticasPagamentos(periodo = '30') {
    try {
      const dias = parseInt(periodo);
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - dias);

      const estatisticas = await prisma.tb_pagamentos.groupBy({
        by: ['data'],
        where: {
          data: {
            gte: dataInicio
          }
        },
        _count: { codigo: true },
        _sum: { totalgeral: true },
        orderBy: { data: 'asc' }
      });

      return {
        periodo: `${dias} dias`,
        estatisticas: estatisticas.map(stat => ({
          data: stat.data,
          totalPagamentos: stat._count.codigo,
          valorTotal: stat._sum.totalgeral || 0
        }))
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de pagamentos:', error);
      throw new AppError('Erro ao obter estatísticas de pagamentos', 500);
    }
  }

  // ===============================
  // RELATÓRIOS FINANCEIROS
  // ===============================

  static async getRelatorioFinanceiro(filters) {
    try {
      const { dataInicio, dataFim, codigo_Aluno, codigo_FormaPagamento, tipoRelatorio } = filters;

      let where = {
        data: {
          gte: new Date(dataInicio),
          lte: new Date(dataFim)
        }
      };

      if (codigo_Aluno) {
        where.codigo_Aluno = codigo_Aluno;
      }

      if (codigo_FormaPagamento) {
        where.codigo_FormaPagamento = codigo_FormaPagamento;
      }

      switch (tipoRelatorio) {
        case 'resumo':
          return await this.getRelatorioResumo(where);
        case 'detalhado':
          return await this.getRelatorioDetalhado(where);
        case 'por_aluno':
          return await this.getRelatorioPorAluno(where);
        case 'por_servico':
          return await this.getRelatorioPorServico(where);
        default:
          return await this.getRelatorioResumo(where);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error);
      throw new AppError('Erro ao gerar relatório financeiro', 500);
    }
  }

  static async getRelatorioResumo(where) {
    try {
      const [totalPagamentos, totalValor, totalDesconto, totalIva] = await Promise.all([
        prisma.tb_pagamentos.count({ where }),
        prisma.tb_pagamentos.aggregate({
          where,
          _sum: { totalgeral: true }
        }),
        prisma.tb_pagamentos.aggregate({
          where,
          _sum: { desconto: true }
        }),
        prisma.tb_pagamentos.aggregate({
          where,
          _sum: { taxa_iva: true }
        })
      ]);

      return {
        totalPagamentos,
        totalValor: totalValor._sum.totalgeral || 0,
        totalDesconto: totalDesconto._sum.desconto || 0,
        totalIva: totalIva._sum.taxa_iva || 0,
        valorLiquido: (totalValor._sum.totalgeral || 0) - (totalDesconto._sum.desconto || 0)
      };
    } catch (error) {
      console.error('Erro ao gerar relatório resumo:', error);
      throw new AppError('Erro ao gerar relatório resumo', 500);
    }
  }

  static async getRelatorioDetalhado(where) {
    try {
      const pagamentos = await prisma.tb_pagamentos.findMany({
        where,
        include: {
          aluno: {
            select: {
              codigo: true,
              nome: true
            }
          },
          tipoServico: {
            select: {
              codigo: true,
              designacao: true
            }
          },
          formaPagamento: {
            select: {
              codigo: true,
              designacao: true
            }
          },
          utilizador: {
            select: {
              codigo: true,
              nome: true
            }
          }
        },
        orderBy: { data: 'desc' }
      });

      return { pagamentos };
    } catch (error) {
      console.error('Erro ao gerar relatório detalhado:', error);
      throw new AppError('Erro ao gerar relatório detalhado', 500);
    }
  }

  static async getRelatorioPorAluno(where) {
    try {
      const pagamentosPorAluno = await prisma.tb_pagamentos.groupBy({
        by: ['codigo_Aluno'],
        where,
        _sum: {
          totalgeral: true,
          desconto: true
        },
        _count: {
          codigo: true
        }
      });

      // Buscar nomes dos alunos
      const alunosIds = pagamentosPorAluno.map(p => p.codigo_Aluno);
      const alunos = await prisma.tb_alunos.findMany({
        where: { codigo: { in: alunosIds } },
        select: { codigo: true, nome: true }
      });

      const alunosMap = alunos.reduce((acc, aluno) => {
        acc[aluno.codigo] = aluno.nome;
        return acc;
      }, {});

      return {
        pagamentosPorAluno: pagamentosPorAluno.map(p => ({
          codigo_Aluno: p.codigo_Aluno,
          nomeAluno: alunosMap[p.codigo_Aluno] || 'Nome não encontrado',
          totalPagamentos: p._count.codigo,
          valorTotal: p._sum.totalgeral || 0,
          totalDesconto: p._sum.desconto || 0,
          valorLiquido: (p._sum.totalgeral || 0) - (p._sum.desconto || 0)
        }))
      };
    } catch (error) {
      console.error('Erro ao gerar relatório por aluno:', error);
      throw new AppError('Erro ao gerar relatório por aluno', 500);
    }
  }

  static async getRelatorioPorServico(where) {
    try {
      const pagamentosPorServico = await prisma.tb_pagamentos.groupBy({
        by: ['codigo_Tipo_Servico'],
        where: {
          ...where,
          codigo_Tipo_Servico: { not: null }
        },
        _sum: {
          totalgeral: true,
          desconto: true
        },
        _count: {
          codigo: true
        }
      });

      // Buscar nomes dos serviços
      const servicosIds = pagamentosPorServico.map(p => p.codigo_Tipo_Servico).filter(Boolean);
      const servicos = await prisma.tb_tipo_servicos.findMany({
        where: { codigo: { in: servicosIds } },
        select: { codigo: true, designacao: true }
      });

      const servicosMap = servicos.reduce((acc, servico) => {
        acc[servico.codigo] = servico.designacao;
        return acc;
      }, {});

      return {
        pagamentosPorServico: pagamentosPorServico.map(p => ({
          codigo_Tipo_Servico: p.codigo_Tipo_Servico,
          nomeServico: servicosMap[p.codigo_Tipo_Servico] || 'Serviço não encontrado',
          totalPagamentos: p._count.codigo,
          valorTotal: p._sum.totalgeral || 0,
          totalDesconto: p._sum.desconto || 0,
          valorLiquido: (p._sum.totalgeral || 0) - (p._sum.desconto || 0)
        }))
      };
    } catch (error) {
      console.error('Erro ao gerar relatório por serviço:', error);
      throw new AppError('Erro ao gerar relatório por serviço', 500);
    }
  }

  // ===============================
  // NOVA GESTÃO FINANCEIRA
  // ===============================

  static async createPagamento(data) {
    try {
      // Criar pagamento
      
      // Gerar hash para o pagamento
      const hash = `PAG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Criar pagamento principal primeiro
      const pagamentoPrincipal = await prisma.tb_pagamentoi.create({
        data: {
          data: new Date(),
          codigo_Aluno: data.codigo_Aluno,
          status: 1, // Ativo
          total: data.preco,
          valorEntregue: data.preco,
          dataBanco: new Date(),
          totalDesconto: 0,
          obs: data.observacao || '',
          borderoux: `BOR_${Date.now()}`,
          hash: hash
        }
      });

      // Criar registro de pagamento detalhado
      const pagamento = await prisma.tb_pagamentos.create({
        data: {
          codigo_Aluno: data.codigo_Aluno,
          codigo_Tipo_Servico: data.codigo_Tipo_Servico,
          data: new Date(),
          n_Bordoro: `BOR_${Date.now()}`,
          multa: 0,
          mes: data.mes,
          codigo_Utilizador: 1, // TODO: Pegar do usuário logado
          observacao: data.observacao || '',
          ano: data.ano,
          contaMovimentada: 'CAIXA',
          quantidade: 1,
          desconto: 0,
          totalgeral: data.preco,
          dataBanco: new Date(),
          codigo_Estatus: 1,
          codigo_Empresa: 1,
          codigo_FormaPagamento: data.codigo_FormaPagamento || 1,
          saldo_Anterior: 0,
          codigoPagamento: pagamentoPrincipal.codigo,
          descontoSaldo: 0,
          tipoDocumento: 'FATURA',
          next: 'NEXT',
          codoc: 0,
          fatura: `FAT_${Date.now()}`,
          taxa_iva: 0,
          hash: hash,
          preco: data.preco,
          indice_mes: this.getIndiceMes(data.mes),
          indice_ano: data.ano
        },
        include: {
          aluno: {
            select: {
              codigo: true,
              nome: true,
              n_documento_identificacao: true
            }
          },
          tipoServico: {
            select: {
              codigo: true,
              designacao: true
            }
          }
        }
      });

      // Verificar se o tipo de serviço é propina e atualizar status
      await this.atualizarStatusPropina(data, pagamento);

      // Pagamento criado com sucesso
      return pagamento;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw new AppError('Erro ao criar pagamento', 500);
    }
  }

  // Método para atualizar status de propina quando pagamento for de propina
  static async atualizarStatusPropina(dadosPagamento, pagamento) {
    try {
      // Verificar se o tipo de serviço é propina
      const tipoServico = pagamento.tipoServico;
      if (!tipoServico || !tipoServico.designacao) {
        return; // Não é possível determinar se é propina
      }

      const isPropina = tipoServico.designacao.toLowerCase().includes('propina');
      if (!isPropina) {
        return; // Não é pagamento de propina
      }

      console.log(`Atualizando status de propina para aluno ${dadosPagamento.codigo_Aluno}, mês ${dadosPagamento.mes}, ano ${dadosPagamento.ano}`);

      // Buscar dados do aluno para atualizar saldo
      const aluno = await prisma.tb_alunos.findUnique({
        where: { codigo: dadosPagamento.codigo_Aluno },
        select: { saldo: true }
      });

      if (aluno) {
        // Atualizar saldo do aluno (subtrair o valor pago)
        const novoSaldo = (aluno.saldo || 0) - dadosPagamento.preco;
        await prisma.tb_alunos.update({
          where: { codigo: dadosPagamento.codigo_Aluno },
          data: { saldo: Math.max(0, novoSaldo) } // Não permitir saldo negativo
        });

        console.log(`Saldo do aluno atualizado: ${aluno.saldo} -> ${Math.max(0, novoSaldo)}`);
      }

      // Aqui poderia implementar lógica adicional para marcar o mês como pago
      // em uma tabela de controle de propinas, se existir
      
    } catch (error) {
      console.error('Erro ao atualizar status de propina:', error);
      // Não lançar erro para não interromper o fluxo principal
    }
  }

  static async getAlunosConfirmados(page = 1, limit = 10, filters = {}) {
    try {
      const { skip, take } = getPagination(page, limit);
      
      // Construir filtros
      let whereClause = {
        tb_matriculas: {
          tb_confirmacoes: {
            some: {
              codigo_Status: 1 // Apenas confirmações ativas
            }
          }
        }
      };

      // Nota: Busca será feita localmente após carregar os dados
      // devido a problemas com o Prisma mode: 'insensitive'

      // Filtro por turma
      if (filters.turma) {
        whereClause.tb_matriculas.tb_confirmacoes.some.codigo_Turma = parseInt(filters.turma);
      }

      // Filtro por curso
      if (filters.curso) {
        whereClause.tb_matriculas.codigo_Curso = parseInt(filters.curso);
      }

      // Se há busca, carregar muito mais dados para filtrar localmente
      const searchLimit = filters.search ? Math.max(take * 100, 1000) : take;
      const searchSkip = filters.search ? 0 : skip;
      
      const [allAlunos, total] = await Promise.all([
        prisma.tb_alunos.findMany({
          where: whereClause,
          skip: searchSkip,
          take: searchLimit,
          include: {
            tb_matriculas: {
              include: {
                tb_cursos: {
                  select: {
                    codigo: true,
                    designacao: true
                  }
                },
                tb_confirmacoes: {
                  where: {
                    codigo_Status: 1
                  },
                  include: {
                    tb_turmas: {
                      select: {
                        codigo: true,
                        designacao: true,
                        tb_classes: {
                          select: {
                            designacao: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            nome: 'asc'
          }
        }),
        prisma.tb_alunos.count({ where: whereClause })
      ]);

      // Aplicar busca local se necessário
      let alunos = allAlunos;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        // Dividir o termo de busca em palavras para busca mais flexível
        const searchWords = searchTerm.split(' ').filter(word => word.length > 0);
        
        // Função para normalizar texto (remover acentos)
        const normalizeText = (text) => {
          return text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '');
        };
        
        alunos = allAlunos.filter(aluno => {
          const nome = normalizeText(aluno.nome || '');
          const email = normalizeText(aluno.email || '');
          const documento = normalizeText(aluno.n_documento_identificacao || '');
          const telefone = normalizeText(aluno.telefone || '');
          const normalizedSearch = normalizeText(searchTerm);
          
          // Se é uma busca por palavras, verificar se todas as palavras estão presentes
          if (searchWords.length > 1) {
            const normalizedWords = searchWords.map(word => normalizeText(word));
            return normalizedWords.every(word => 
              nome.includes(word) || 
              email.includes(word) || 
              documento.includes(word) ||
              telefone.includes(word)
            );
          }
          
          // Busca simples por termo único
          return nome.includes(normalizedSearch) ||
                 email.includes(normalizedSearch) ||
                 documento.includes(normalizedSearch) ||
                 telefone.includes(normalizedSearch);
        });
        
        // Aplicar paginação após filtro local
        const startIndex = (page - 1) * limit;
        alunos = alunos.slice(startIndex, startIndex + limit);
      }

      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      };

      return {
        data: alunos,
        pagination
      };
    } catch (error) {
      console.error('Erro ao buscar alunos confirmados:', error);
      throw new AppError('Erro ao buscar alunos confirmados', 500);
    }
  }

  static async getDadosFinanceirosAluno(alunoId, anoLectivoId = null) {
    try {
      // Buscar dados do aluno
      const aluno = await prisma.tb_alunos.findUnique({
        where: { codigo: alunoId },
        include: {
          tb_matriculas: {
            include: {
              tb_cursos: {
                select: {
                  codigo: true,
                  designacao: true
                }
              },
              tb_confirmacoes: {
                where: {
                  codigo_Status: 1
                },
                include: {
                  tb_turmas: {
                    select: {
                      codigo: true,
                      designacao: true,
                      codigo_AnoLectivo: true,
                      tb_classes: {
                        select: {
                          designacao: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!aluno) {
        throw new AppError('Aluno não encontrado', 404);
      }

      // Determinar ano letivo (usar o da confirmação ativa ou o fornecido)
      const anoLectivo = anoLectivoId || 
        aluno.tb_matriculas[0]?.tb_confirmacoes[0]?.tb_turmas?.codigo_AnoLectivo || 
        new Date().getFullYear(); // Usar ano atual como padrão

      // Buscar pagamentos do aluno
      console.log(`Buscando pagamentos para aluno ${alunoId}, ano lectivo: ${anoLectivo}`);
      
      // Primeiro buscar todos os pagamentos do aluno para debug
      const todosPagamentos = await prisma.tb_pagamentos.findMany({
        where: {
          codigo_Aluno: alunoId
        },
        include: {
          tipoServico: {
            select: {
              designacao: true
            }
          }
        },
        orderBy: {
          data: 'desc'
        }
      });
      
      console.log(`Total de pagamentos do aluno ${alunoId}: ${todosPagamentos.length}`);
      if (todosPagamentos.length > 0) {
        console.log('Anos dos pagamentos:', todosPagamentos.map(p => p.ano));
        console.log('Tipos de serviço:', todosPagamentos.map(p => p.tipoServico?.designacao));
      }
      
      // Filtrar pagamentos por ano letivo
      const pagamentos = await prisma.tb_pagamentos.findMany({
        where: {
          codigo_Aluno: alunoId,
          ano: {
            in: [anoLectivo - 1, anoLectivo, anoLectivo + 1] // Incluir ano anterior, atual e próximo
          }
        },
        include: {
          tipoServico: {
            select: {
              designacao: true
            }
          }
        },
        orderBy: {
          data: 'desc'
        }
      });
      
      console.log(`Encontrados ${pagamentos.length} pagamentos para o aluno ${alunoId}`);
      if (pagamentos.length > 0) {
        console.log('Primeiro pagamento:', pagamentos[0]);
      }

      // Meses do ano letivo (Setembro a Julho)
      const mesesAnoLectivo = [
        'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
        'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO'
      ];

      // Valor da propina (valor padrão - pode ser configurado posteriormente)
      const valorPropina = 0; // Valor padrão em Kz - inicia com 0 quando pendente

      // Criar status dos meses
      const mesesPropina = mesesAnoLectivo.map(mes => {
        const pagamentoMes = pagamentos.find(p => 
          p.mes === mes && 
          p.tipoServico?.designacao?.toLowerCase().includes('propina')
        );

        return {
          mes,
          status: pagamentoMes ? 'PAGO' : 'NÃO_PAGO',
          valor: pagamentoMes ? pagamentoMes.preco : valorPropina, // Usar valor real se pago, senão valor padrão
          dataPagamento: pagamentoMes?.data || null,
          codigoPagamento: pagamentoMes?.codigo || null
        };
      });

      // Histórico financeiro (outros serviços)
      const historicoFinanceiro = pagamentos
        .filter(p => !p.tipoServico?.designacao?.toLowerCase().includes('propina'))
        .map(p => ({
          codigo: p.codigo,
          data: p.data,
          servico: p.tipoServico?.designacao || 'Serviço',
          valor: p.preco,
          observacao: p.observacao,
          fatura: p.fatura
        }));

      return {
        aluno: {
          codigo: aluno.codigo,
          nome: aluno.nome,
          documento: aluno.n_documento_identificacao,
          email: aluno.email,
          telefone: aluno.telefone,
          curso: aluno.tb_matriculas[0]?.tb_cursos?.designacao,
          turma: aluno.tb_matriculas[0]?.tb_confirmacoes[0]?.tb_turmas?.designacao,
          classe: aluno.tb_matriculas[0]?.tb_confirmacoes[0]?.tb_turmas?.tb_classes?.designacao
        },
        mesesPropina,
        historicoFinanceiro,
        resumo: {
          totalMeses: mesesAnoLectivo.length,
          mesesPagos: mesesPropina.filter(m => m.status === 'PAGO').length,
          mesesPendentes: mesesPropina.filter(m => m.status === 'NÃO_PAGO').length,
          valorMensal: valorPropina, // Valor padrão (0 para pendentes)
          totalPago: mesesPropina.filter(m => m.status === 'PAGO').reduce((total, mes) => total + (mes.valor || 0), 0),
          totalPendente: mesesPropina.filter(m => m.status === 'NÃO_PAGO').length * valorPropina // 0 para pendentes
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Erro ao obter dados financeiros do aluno:', error);
      throw new AppError('Erro ao obter dados financeiros do aluno', 500);
    }
  }

  static async gerarFaturaPDF(pagamentoId) {
    try {
      // Buscar dados do pagamento
      const pagamento = await prisma.tb_pagamentos.findUnique({
        where: { codigo: pagamentoId },
        include: {
          aluno: {
            select: {
              codigo: true,
              nome: true,
              n_documento_identificacao: true,
              email: true,
              telefone: true
            }
          },
          tipoServico: {
            select: {
              designacao: true
            }
          },
          formaPagamento: {
            select: {
              designacao: true
            }
          }
        }
      });

      if (!pagamento) {
        throw new AppError('Pagamento não encontrado', 404);
      }

      // TODO: Implementar geração de PDF
      // Por enquanto, retornar dados para o frontend gerar
      return {
        pagamento,
        instituicao: {
          nome: 'INSTITUTO MÉDIO POLITÉCNICO JO MORAIS',
          endereco: 'Luanda, Angola',
          telefone: '+244 XXX XXX XXX',
          email: 'info@jomorais.ao'
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Erro ao gerar fatura PDF:', error);
      throw new AppError('Erro ao gerar fatura PDF', 500);
    }
  }

  // Utilitários
  static getIndiceMes(mes) {
    const meses = {
      'JANEIRO': 1, 'FEVEREIRO': 2, 'MARÇO': 3, 'ABRIL': 4,
      'MAIO': 5, 'JUNHO': 6, 'JULHO': 7, 'AGOSTO': 8,
      'SETEMBRO': 9, 'OUTUBRO': 10, 'NOVEMBRO': 11, 'DEZEMBRO': 12
    };
    return meses[mes.toUpperCase()] || 1;
  }

  // Métodos auxiliares
  static async getTiposServico() {
    try {
      const tiposServico = await prisma.tb_tipo_servicos.findMany({
        select: {
          codigo: true,
          designacao: true,
          preco: true // Incluir o campo preço
        },
        orderBy: {
          designacao: 'asc'
        }
      });
      return tiposServico;
    } catch (error) {
      console.error('Erro ao buscar tipos de serviço:', error);
      throw new AppError('Erro ao buscar tipos de serviço', 500);
    }
  }

  static async getFormasPagamento() {
    try {
      const formasPagamento = await prisma.tb_forma_pagamento.findMany({
        orderBy: {
          designacao: 'asc'
        }
      });
      return formasPagamento;
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
      throw new AppError('Erro ao buscar formas de pagamento', 500);
    }
  }

  // Método para buscar dados completos de um aluno específico
  static async getAlunoCompleto(alunoId) {
    try {
      const aluno = await prisma.tb_alunos.findUnique({
        where: { codigo: parseInt(alunoId) },
        include: {
          tb_matriculas: {
            include: {
              tb_cursos: {
                select: {
                  codigo: true,
                  designacao: true
                }
              },
              tb_confirmacoes: {
                where: {
                  codigo_Status: 1 // Apenas confirmações ativas
                },
                include: {
                  tb_turmas: {
                    select: {
                      codigo: true,
                      designacao: true,
                      tb_classes: {
                        select: {
                          codigo: true,
                          designacao: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!aluno) {
        throw new AppError('Aluno não encontrado', 404);
      }

      // Extrair dados da matrícula ativa
      const matricula = aluno.tb_matriculas;
      const confirmacao = matricula?.tb_confirmacoes?.[0];
      const turma = confirmacao?.tb_turmas;
      const classe = turma?.tb_classes;
      const curso = matricula?.tb_cursos;

      return {
        ...aluno,
        dadosAcademicos: {
          curso: curso?.designacao || 'Curso não especificado',
          classe: classe?.designacao || 'Classe não especificada',
          turma: turma?.designacao || 'Turma não especificada'
        }
      };
    } catch (error) {
      console.error('Erro ao buscar dados completos do aluno:', error);
      throw new AppError('Erro ao buscar dados do aluno', 500);
    }
  }
}
