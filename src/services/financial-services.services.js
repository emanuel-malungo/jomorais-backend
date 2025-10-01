// services/financial-services.services.js
import prisma from '../config/database.js';
import { AppError } from '../utils/validation.utils.js';

export class FinancialServicesService {
  // ===============================
  // MOEDAS - CRUD COMPLETO
  // ===============================

  static async createMoeda(data) {
    try {
      const { designacao } = data;

      const existingMoeda = await prisma.tb_moedas.findFirst({
        where: {
          designacao: designacao.trim()
        }
      });

      if (existingMoeda) {
        throw new AppError('Já existe uma moeda com esta designação', 409);
      }

      return await prisma.tb_moedas.create({
        data: {
          designacao: designacao.trim()
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar moeda', 500);
    }
  }

  static async updateMoeda(id, data) {
    try {
      const existingMoeda = await prisma.tb_moedas.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingMoeda) {
        throw new AppError('Moeda não encontrada', 404);
      }

      if (data.designacao) {
        const duplicateMoeda = await prisma.tb_moedas.findFirst({
          where: {
            designacao: data.designacao.trim(),
            codigo: { not: parseInt(id) }
          }
        });

        if (duplicateMoeda) {
          throw new AppError('Já existe uma moeda com esta designação', 409);
        }
      }

      return await prisma.tb_moedas.update({
        where: { codigo: parseInt(id) },
        data: { designacao: data.designacao.trim() }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar moeda', 500);
    }
  }

  static async getMoedas(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search,
          mode: 'insensitive'
        }
      } : {};

      const [moedas, total] = await Promise.all([
        prisma.tb_moedas.findMany({
          where,
          skip,
          take: limit,
          include: {
            _count: {
              select: { tb_tipo_servicos: true }
            }
          },
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_moedas.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: moedas,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      throw new AppError('Erro ao buscar moedas', 500);
    }
  }

  static async getMoedaById(id) {
    try {
      const moeda = await prisma.tb_moedas.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_tipo_servicos: {
            select: { codigo: true, designacao: true, preco: true },
            orderBy: { designacao: 'asc' }
          }
        }
      });

      if (!moeda) {
        throw new AppError('Moeda não encontrada', 404);
      }

      return moeda;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar moeda', 500);
    }
  }

  static async deleteMoeda(id) {
    try {
      const existingMoeda = await prisma.tb_moedas.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_tipo_servicos: true
        }
      });

      if (!existingMoeda) {
        throw new AppError('Moeda não encontrada', 404);
      }

      if (existingMoeda.tb_tipo_servicos.length > 0) {
        throw new AppError('Não é possível excluir esta moeda pois possui serviços associados', 400);
      }

      await prisma.tb_moedas.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Moeda excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir moeda', 500);
    }
  }

  // ===============================
  // CATEGORIAS DE SERVIÇOS - CRUD COMPLETO
  // ===============================

  static async createCategoriaServico(data) {
    try {
      const { designacao } = data;

      if (designacao) {
        const existingCategoria = await prisma.tb_categoria_servicos.findFirst({
          where: {
            designacao: designacao.trim()
          }
        });

        if (existingCategoria) {
          throw new AppError('Já existe uma categoria com esta designação', 409);
        }
      }

      return await prisma.tb_categoria_servicos.create({
        data: {
          designacao: designacao?.trim() || ""
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar categoria de serviço', 500);
    }
  }

  static async updateCategoriaServico(id, data) {
    try {
      const existingCategoria = await prisma.tb_categoria_servicos.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingCategoria) {
        throw new AppError('Categoria de serviço não encontrada', 404);
      }

      if (data.designacao) {
        const duplicateCategoria = await prisma.tb_categoria_servicos.findFirst({
          where: {
            designacao: data.designacao.trim(),
            codigo: { not: parseInt(id) }
          }
        });

        if (duplicateCategoria) {
          throw new AppError('Já existe uma categoria com esta designação', 409);
        }
      }

      return await prisma.tb_categoria_servicos.update({
        where: { codigo: parseInt(id) },
        data: { designacao: data.designacao?.trim() || "" }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar categoria de serviço', 500);
    }
  }

  static async getCategoriasServicos(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search,
          mode: 'insensitive'
        }
      } : {};

      const [categorias, total] = await Promise.all([
        prisma.tb_categoria_servicos.findMany({
          where,
          skip,
          take: limit,
          include: {
            _count: {
              select: { tb_tipo_servicos: true }
            }
          },
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_categoria_servicos.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: categorias,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      throw new AppError('Erro ao buscar categorias de serviços', 500);
    }
  }

  static async getCategoriaServicoById(id) {
    try {
      const categoria = await prisma.tb_categoria_servicos.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_tipo_servicos: {
            select: { codigo: true, designacao: true, preco: true, status: true },
            orderBy: { designacao: 'asc' }
          }
        }
      });

      if (!categoria) {
        throw new AppError('Categoria de serviço não encontrada', 404);
      }

      return categoria;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar categoria de serviço', 500);
    }
  }

  static async deleteCategoriaServico(id) {
    try {
      const existingCategoria = await prisma.tb_categoria_servicos.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_tipo_servicos: true
        }
      });

      if (!existingCategoria) {
        throw new AppError('Categoria de serviço não encontrada', 404);
      }

      if (existingCategoria.tb_tipo_servicos.length > 0) {
        throw new AppError('Não é possível excluir esta categoria pois possui serviços associados', 400);
      }

      await prisma.tb_categoria_servicos.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Categoria de serviço excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir categoria de serviço', 500);
    }
  }

  // ===============================
  // TIPOS DE SERVIÇOS - CRUD COMPLETO
  // ===============================

  static async createTipoServico(data) {
    try {
      const {
        designacao, preco, descricao, codigo_Utilizador, codigo_Moeda,
        tipoServico, status, aplicarMulta, aplicarDesconto, codigo_Ano,
        codigoAnoLectivo, valorMulta, iva, codigoRasao, categoria, codigo_multa
      } = data;

      // Verificar entidades relacionadas
      const moedaExists = await prisma.tb_moedas.findUnique({
        where: { codigo: parseInt(codigo_Moeda) }
      });

      if (!moedaExists) {
        throw new AppError('Moeda não encontrada', 404);
      }

      const existingTipoServico = await prisma.tb_tipo_servicos.findFirst({
        where: {
          designacao: designacao.trim()
        }
      });

      if (existingTipoServico) {
        throw new AppError('Já existe um tipo de serviço com esta designação', 409);
      }

      return await prisma.tb_tipo_servicos.create({
        data: {
          designacao: designacao.trim(),
          preco: parseFloat(preco),
          descricao: descricao.trim(),
          codigo_Utilizador: parseInt(codigo_Utilizador),
          codigo_Moeda: parseInt(codigo_Moeda),
          tipoServico: tipoServico.trim(),
          status: status?.trim() || "Activo",
          aplicarMulta: aplicarMulta !== undefined ? Boolean(aplicarMulta) : false,
          aplicarDesconto: aplicarDesconto !== undefined ? Boolean(aplicarDesconto) : false,
          codigo_Ano: codigo_Ano ? parseInt(codigo_Ano) : 1,
          codigoAnoLectivo: codigoAnoLectivo ? parseInt(codigoAnoLectivo) : null,
          valorMulta: valorMulta ? parseFloat(valorMulta) : 0,
          iva: iva ? parseInt(iva) : null,
          codigoRasao: codigoRasao ? parseInt(codigoRasao) : null,
          categoria: categoria ? parseInt(categoria) : null,
          codigo_multa: codigo_multa ? parseInt(codigo_multa) : null
        },
        include: {
          tb_moedas: { select: { codigo: true, designacao: true } },
          tb_categoria_servicos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro detalhado ao criar tipo de serviço:', error);
      throw new AppError('Erro ao criar tipo de serviço', 500);
    }
  }

  static async updateTipoServico(id, data) {
    try {
      const existingTipoServico = await prisma.tb_tipo_servicos.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingTipoServico) {
        throw new AppError('Tipo de serviço não encontrado', 404);
      }

      // Verificar moeda se fornecida
      if (data.codigo_Moeda) {
        const moedaExists = await prisma.tb_moedas.findUnique({
          where: { codigo: parseInt(data.codigo_Moeda) }
        });
        if (!moedaExists) throw new AppError('Moeda não encontrada', 404);
      }

      if (data.designacao) {
        const duplicateTipoServico = await prisma.tb_tipo_servicos.findFirst({
          where: {
            designacao: data.designacao.trim(),
            codigo: { not: parseInt(id) }
          }
        });

        if (duplicateTipoServico) {
          throw new AppError('Já existe um tipo de serviço com esta designação', 409);
        }
      }

      const updateData = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          switch (key) {
            case 'designacao':
            case 'descricao':
            case 'tipoServico':
            case 'status':
              updateData[key] = data[key].trim();
              break;
            case 'preco':
            case 'valorMulta':
              updateData[key] = parseFloat(data[key]);
              break;
            case 'aplicarMulta':
            case 'aplicarDesconto':
              updateData[key] = Boolean(data[key]);
              break;
            case 'codigo_Utilizador':
            case 'codigo_Moeda':
            case 'codigo_Ano':
            case 'codigoAnoLectivo':
            case 'iva':
            case 'codigoRasao':
            case 'categoria':
            case 'codigo_multa':
              updateData[key] = parseInt(data[key]);
              break;
          }
        }
      });

      return await prisma.tb_tipo_servicos.update({
        where: { codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_moedas: { select: { codigo: true, designacao: true } },
          tb_categoria_servicos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar tipo de serviço', 500);
    }
  }

  static async getTiposServicos(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        OR: [
          {
            designacao: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            descricao: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      } : {};

      const [tiposServicos, total] = await Promise.all([
        prisma.tb_tipo_servicos.findMany({
          where,
          skip,
          take: limit,
          include: {
            tb_moedas: { select: { codigo: true, designacao: true } },
            tb_categoria_servicos: { select: { codigo: true, designacao: true } },
            _count: {
              select: { 
                tb_servicos_turma: true,
                tb_servico_aluno: true,
                tb_propina_classe: true
              }
            }
          },
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_tipo_servicos.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: tiposServicos,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      throw new AppError('Erro ao buscar tipos de serviços', 500);
    }
  }

  static async getTipoServicoById(id) {
    try {
      // Implementando abordagem step-by-step baseada na memória para evitar erros de includes complexos
      let tipoServico;
      
      try {
        // Primeira tentativa com includes completos
        tipoServico = await prisma.tb_tipo_servicos.findUnique({
          where: { codigo: parseInt(id) },
          include: {
            tb_moedas: { select: { codigo: true, designacao: true } },
            tb_categoria_servicos: { select: { codigo: true, designacao: true } },
            tb_servicos_turma: {
              select: { codigo: true, anoLectivo: true },
              take: 5
            },
            tb_servico_aluno: {
              select: { codigo: true, status: true },
              take: 5
            }
          }
        });
      } catch (includeError) {
        console.error('Erro com includes complexos, tentando abordagem simples:', includeError);
        
        // Fallback: busca simples primeiro
        tipoServico = await prisma.tb_tipo_servicos.findUnique({
          where: { codigo: parseInt(id) }
        });
        
        if (tipoServico) {
          // Buscar relacionamentos separadamente se necessário
          try {
            const [moeda, categoria] = await Promise.all([
              tipoServico.codigo_Moeda ? prisma.tb_moedas.findUnique({
                where: { codigo: tipoServico.codigo_Moeda },
                select: { codigo: true, designacao: true }
              }) : null,
              tipoServico.categoria ? prisma.tb_categoria_servicos.findUnique({
                where: { codigo: tipoServico.categoria },
                select: { codigo: true, designacao: true }
              }) : null
            ]);
            
            tipoServico.tb_moedas = moeda;
            tipoServico.tb_categoria_servicos = categoria;
          } catch (relationError) {
            console.error('Erro ao buscar relacionamentos:', relationError);
          }
        }
      }

      if (!tipoServico) {
        throw new AppError('Tipo de serviço não encontrado', 404);
      }

      return tipoServico;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro detalhado ao buscar tipo de serviço:', error);
      throw new AppError('Erro ao buscar tipo de serviço', 500);
    }
  }

  static async deleteTipoServico(id) {
    try {
      const existingTipoServico = await prisma.tb_tipo_servicos.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_servicos_turma: true,
          tb_servico_aluno: true,
          tb_propina_classe: true,
          tb_pagamentos: true
        }
      });

      if (!existingTipoServico) {
        throw new AppError('Tipo de serviço não encontrado', 404);
      }

      const dependencies = [];
      if (existingTipoServico.tb_servicos_turma.length > 0) dependencies.push('serviços de turma');
      if (existingTipoServico.tb_servico_aluno.length > 0) dependencies.push('serviços de aluno');
      if (existingTipoServico.tb_propina_classe.length > 0) dependencies.push('propinas de classe');
      if (existingTipoServico.tb_pagamentos.length > 0) dependencies.push('pagamentos');

      if (dependencies.length > 0) {
        throw new AppError(`Não é possível excluir este tipo de serviço pois possui ${dependencies.join(', ')} associados`, 400);
      }

      await prisma.tb_tipo_servicos.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Tipo de serviço excluído com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir tipo de serviço', 500);
    }
  }

  // ===============================
  // OPERAÇÕES ESPECIAIS
  // ===============================

  static async getTiposServicosPorCategoria(categoriaId) {
    try {
      const categoriaExists = await prisma.tb_categoria_servicos.findUnique({
        where: { codigo: parseInt(categoriaId) }
      });

      if (!categoriaExists) {
        throw new AppError('Categoria não encontrada', 404);
      }

      return await prisma.tb_tipo_servicos.findMany({
        where: { categoria: parseInt(categoriaId) },
        include: {
          tb_moedas: { select: { codigo: true, designacao: true } }
        },
        orderBy: { designacao: 'asc' }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar tipos de serviços por categoria', 500);
    }
  }

  static async getTiposServicosPorMoeda(moedaId) {
    try {
      const moedaExists = await prisma.tb_moedas.findUnique({
        where: { codigo: parseInt(moedaId) }
      });

      if (!moedaExists) {
        throw new AppError('Moeda não encontrada', 404);
      }

      return await prisma.tb_tipo_servicos.findMany({
        where: { codigo_Moeda: parseInt(moedaId) },
        include: {
          tb_categoria_servicos: { select: { codigo: true, designacao: true } }
        },
        orderBy: { designacao: 'asc' }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar tipos de serviços por moeda', 500);
    }
  }

  static async getTiposServicosAtivos() {
    try {
      return await prisma.tb_tipo_servicos.findMany({
        where: { status: "Activo" },
        include: {
          tb_moedas: { select: { codigo: true, designacao: true } },
          tb_categoria_servicos: { select: { codigo: true, designacao: true } }
        },
        orderBy: { designacao: 'asc' }
      });
    } catch (error) {
      throw new AppError('Erro ao buscar tipos de serviços ativos', 500);
    }
  }

  static async getTiposServicosComMulta() {
    try {
      return await prisma.tb_tipo_servicos.findMany({
        where: { aplicarMulta: true },
        include: {
          tb_moedas: { select: { codigo: true, designacao: true } },
          tb_categoria_servicos: { select: { codigo: true, designacao: true } }
        },
        orderBy: { designacao: 'asc' }
      });
    } catch (error) {
      throw new AppError('Erro ao buscar tipos de serviços com multa', 500);
    }
  }

  static async getRelatorioFinanceiro() {
    try {
      const [
        totalMoedas,
        totalCategorias,
        totalTiposServicos,
        servicosAtivos,
        servicosComMulta,
        servicosComDesconto
      ] = await Promise.all([
        prisma.tb_moedas.count(),
        prisma.tb_categoria_servicos.count(),
        prisma.tb_tipo_servicos.count(),
        prisma.tb_tipo_servicos.count({ where: { status: "Activo" } }),
        prisma.tb_tipo_servicos.count({ where: { aplicarMulta: true } }),
        prisma.tb_tipo_servicos.count({ where: { aplicarDesconto: true } })
      ]);

      return {
        resumo: {
          totalMoedas,
          totalCategorias,
          totalTiposServicos,
          servicosAtivos,
          servicosComMulta,
          servicosComDesconto
        }
      };
    } catch (error) {
      throw new AppError('Erro ao gerar relatório financeiro', 500);
    }
  }
}
