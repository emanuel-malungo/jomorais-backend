// services/student-management.services.js
import prisma from '../config/database.js';
import { AppError } from '../utils/validation.utils.js';
import { getPagination } from '../utils/pagination.utils.js';

export class StudentManagementService {
  // ===============================
  // ENCARREGADOS - CRUD COMPLETO
  // ===============================

  static async createEncarregado(data) {
    try {
      const { nome, telefone, email, codigo_Profissao, local_Trabalho, codigo_Utilizador, dataCadastro, status } = data;

      // Verificar se o utilizador existe
      const utilizadorExists = await prisma.tb_utilizadores.findUnique({
        where: { codigo: codigo_Utilizador }
      });

      if (!utilizadorExists) {
        throw new AppError('Utilizador não encontrado', 404);
      }

      // Verificar se a profissão existe
      const profissaoExists = await prisma.tb_profissao.findUnique({
        where: { codigo: codigo_Profissao }
      });

      if (!profissaoExists) {
        throw new AppError('Profissão não encontrada', 404);
      }

      // Verificar se já existe encarregado com mesmo utilizador
      const existingEncarregado = await prisma.tb_encarregados.findFirst({
        where: { codigo_Utilizador }
      });

      if (existingEncarregado) {
        throw new AppError('Já existe um encarregado associado a este utilizador', 409);
      }

      return await prisma.tb_encarregados.create({
        data: {
          nome: nome.trim(),
          telefone: telefone.trim(),
          email: email?.trim() || null,
          codigo_Profissao,
          local_Trabalho: local_Trabalho.trim(),
          codigo_Utilizador,
          dataCadastro: dataCadastro || new Date(),
          status: status ?? 1
        },
        include: {
          tb_profissao: true,
          tb_utilizadores: {
            select: {
              codigo: true,
              nome: true,
              user: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar encarregado', 500);
    }
  }

  static async updateEncarregado(id, data) {
    try {
      const existingEncarregado = await prisma.tb_encarregados.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingEncarregado) {
        throw new AppError('Encarregado não encontrado', 404);
      }

      // Se for atualizar o utilizador, verificar se existe
      if (data.codigo_Utilizador && data.codigo_Utilizador !== existingEncarregado.codigo_Utilizador) {
        const utilizadorExists = await prisma.tb_utilizadores.findUnique({
          where: { codigo: data.codigo_Utilizador }
        });

        if (!utilizadorExists) {
          throw new AppError('Utilizador não encontrado', 404);
        }

        // Verificar se já existe outro encarregado com este utilizador
        const existingWithUser = await prisma.tb_encarregados.findFirst({
          where: { 
            codigo_Utilizador: data.codigo_Utilizador,
            codigo: { not: parseInt(id) }
          }
        });

        if (existingWithUser) {
          throw new AppError('Já existe um encarregado associado a este utilizador', 409);
        }
      }

      // Se for atualizar a profissão, verificar se existe
      if (data.codigo_Profissao) {
        const profissaoExists = await prisma.tb_profissao.findUnique({
          where: { codigo: data.codigo_Profissao }
        });

        if (!profissaoExists) {
          throw new AppError('Profissão não encontrada', 404);
        }
      }

      const updateData = { ...data };
      if (updateData.nome) updateData.nome = updateData.nome.trim();
      if (updateData.telefone) updateData.telefone = updateData.telefone.trim();
      if (updateData.email) updateData.email = updateData.email.trim();
      if (updateData.local_Trabalho) updateData.local_Trabalho = updateData.local_Trabalho.trim();

      return await prisma.tb_encarregados.update({
        where: { codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_profissao: true,
          tb_utilizadores: {
            select: {
              codigo: true,
              nome: true,
              user: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar encarregado', 500);
    }
  }

  static async getEncarregados(page = 1, limit = 10, search = '') {
    try {
      const { skip, take } = getPagination(page, limit);

      const where = search ? {
        OR: [
          { nome: { contains: search, mode: 'insensitive' } },
          { telefone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
          { local_Trabalho: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [encarregados, total] = await Promise.all([
        prisma.tb_encarregados.findMany({
          where,
          skip,
          take,
          include: {
            tb_profissao: true,
            tb_utilizadores: {
              select: {
                codigo: true,
                nome: true,
                user: true
              }
            },
            tb_alunos: {
              select: {
                codigo: true,
                nome: true
              }
            }
          },
          orderBy: { nome: 'asc' }
        }),
        prisma.tb_encarregados.count({ where })
      ]);

      return {
        data: encarregados,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new AppError('Erro ao buscar encarregados', 500);
    }
  }

  static async getEncarregadoById(id) {
    try {
      const encarregado = await prisma.tb_encarregados.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_profissao: true,
          tb_utilizadores: {
            select: {
              codigo: true,
              nome: true,
              user: true,
              email: true
            }
          },
          tb_alunos: {
            select: {
              codigo: true,
              nome: true,
              dataNascimento: true,
              sexo: true
            }
          }
        }
      });

      if (!encarregado) {
        throw new AppError('Encarregado não encontrado', 404);
      }

      return encarregado;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar encarregado', 500);
    }
  }

  static async deleteEncarregado(id) {
    try {
      const existingEncarregado = await prisma.tb_encarregados.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_alunos: true
        }
      });

      if (!existingEncarregado) {
        throw new AppError('Encarregado não encontrado', 404);
      }

      // Verificar se há alunos associados
      if (existingEncarregado.tb_alunos.length > 0) {
        throw new AppError('Não é possível excluir encarregado com alunos associados', 400);
      }

      await prisma.tb_encarregados.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Encarregado excluído com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir encarregado', 500);
    }
  }

  // ===============================
  // PROVENIÊNCIAS - CRUD COMPLETO
  // ===============================

  static async createProveniencia(data) {
    try {
      const { designacao, codigoStatus, localizacao, contacto, codigoUtilizador, dataCadastro } = data;

      // Verificar se o utilizador existe (se fornecido)
      if (codigoUtilizador) {
        const utilizadorExists = await prisma.tb_utilizadores.findUnique({
          where: { codigo: codigoUtilizador }
        });

        if (!utilizadorExists) {
          throw new AppError('Utilizador não encontrado', 404);
        }
      }

      // Verificar se já existe proveniência com mesma designação
      const existingProveniencia = await prisma.tb_proveniencias.findFirst({
        where: {
          designacao: { equals: designacao.trim(), mode: 'insensitive' }
        }
      });

      if (existingProveniencia) {
        throw new AppError('Já existe uma proveniência com esta designação', 409);
      }

      return await prisma.tb_proveniencias.create({
        data: {
          designacao: designacao.trim(),
          codigoStatus: codigoStatus ?? 1,
          localizacao: localizacao?.trim() || null,
          contacto: contacto?.trim() || null,
          codigoUtilizador: codigoUtilizador || null,
          dataCadastro: dataCadastro || new Date()
        },
        include: {
          tb_utilizadores: codigoUtilizador ? {
            select: {
              codigo: true,
              nome: true,
              user: true
            }
          } : undefined
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar proveniência', 500);
    }
  }

  static async updateProveniencia(id, data) {
    try {
      const existingProveniencia = await prisma.tb_proveniencias.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingProveniencia) {
        throw new AppError('Proveniência não encontrada', 404);
      }

      // Se for atualizar o utilizador, verificar se existe
      if (data.codigoUtilizador) {
        const utilizadorExists = await prisma.tb_utilizadores.findUnique({
          where: { codigo: data.codigoUtilizador }
        });

        if (!utilizadorExists) {
          throw new AppError('Utilizador não encontrado', 404);
        }
      }

      // Verificar se já existe outra proveniência com mesma designação
      if (data.designacao) {
        const existingWithName = await prisma.tb_proveniencias.findFirst({
          where: {
            designacao: { equals: data.designacao.trim(), mode: 'insensitive' },
            codigo: { not: parseInt(id) }
          }
        });

        if (existingWithName) {
          throw new AppError('Já existe uma proveniência com esta designação', 409);
        }
      }

      const updateData = { ...data };
      if (updateData.designacao) updateData.designacao = updateData.designacao.trim();
      if (updateData.localizacao) updateData.localizacao = updateData.localizacao.trim();
      if (updateData.contacto) updateData.contacto = updateData.contacto.trim();

      return await prisma.tb_proveniencias.update({
        where: { codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_utilizadores: updateData.codigoUtilizador ? {
            select: {
              codigo: true,
              nome: true,
              user: true
            }
          } : undefined
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar proveniência', 500);
    }
  }

  static async getProveniencias(page = 1, limit = 10, search = '') {
    try {
      const { skip, take } = getPagination(page, limit);

      const where = search ? {
        OR: [
          { designacao: { contains: search, mode: 'insensitive' } },
          { localizacao: { contains: search, mode: 'insensitive' } },
          { contacto: { contains: search } }
        ]
      } : {};

      const [proveniencias, total] = await Promise.all([
        prisma.tb_proveniencias.findMany({
          where,
          skip,
          take,
          include: {
            tb_utilizadores: {
              select: {
                codigo: true,
                nome: true,
                user: true
              }
            }
          },
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_proveniencias.count({ where })
      ]);

      return {
        data: proveniencias,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new AppError('Erro ao buscar proveniências', 500);
    }
  }

  static async getProvenienciaById(id) {
    try {
      const proveniencia = await prisma.tb_proveniencias.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_utilizadores: {
            select: {
              codigo: true,
              nome: true,
              user: true,
              email: true
            }
          }
        }
      });

      if (!proveniencia) {
        throw new AppError('Proveniência não encontrada', 404);
      }

      return proveniencia;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar proveniência', 500);
    }
  }

  static async deleteProveniencia(id) {
    try {
      const existingProveniencia = await prisma.tb_proveniencias.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingProveniencia) {
        throw new AppError('Proveniência não encontrada', 404);
      }

      await prisma.tb_proveniencias.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Proveniência excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir proveniência', 500);
    }
  }

  // ===============================
  // ALUNOS - CRUD COMPLETO
  // ===============================

  static async createAluno(data) {
    try {
      // Verificar se o encarregado existe
      const encarregadoExists = await prisma.tb_encarregados.findUnique({
        where: { codigo: data.codigo_Encarregado }
      });

      if (!encarregadoExists) {
        throw new AppError('Encarregado não encontrado', 404);
      }

      // Verificar se o utilizador existe
      const utilizadorExists = await prisma.tb_utilizadores.findUnique({
        where: { codigo: data.codigo_Utilizador }
      });

      if (!utilizadorExists) {
        throw new AppError('Utilizador não encontrado', 404);
      }

      // Verificar se o tipo de documento existe
      const tipoDocumentoExists = await prisma.tb_tipo_documento.findUnique({
        where: { codigo: data.codigoTipoDocumento }
      });

      if (!tipoDocumentoExists) {
        throw new AppError('Tipo de documento não encontrado', 404);
      }

      // Verificar se já existe aluno com mesmo documento de identificação
      if (data.n_documento_identificacao) {
        const existingAluno = await prisma.tb_alunos.findFirst({
          where: {
            n_documento_identificacao: data.n_documento_identificacao.trim(),
            codigoTipoDocumento: data.codigoTipoDocumento
          }
        });

        if (existingAluno) {
          throw new AppError('Já existe um aluno com este documento de identificação', 409);
        }
      }

      const cleanData = { ...data };
      if (cleanData.nome) cleanData.nome = cleanData.nome.trim();
      if (cleanData.pai) cleanData.pai = cleanData.pai.trim();
      if (cleanData.mae) cleanData.mae = cleanData.mae.trim();
      if (cleanData.email) cleanData.email = cleanData.email.trim();
      if (cleanData.telefone) cleanData.telefone = cleanData.telefone.trim();
      if (cleanData.n_documento_identificacao) cleanData.n_documento_identificacao = cleanData.n_documento_identificacao.trim();
      if (cleanData.morada) cleanData.morada = cleanData.morada.trim();
      if (cleanData.motivo_Desconto) cleanData.motivo_Desconto = cleanData.motivo_Desconto.trim();
      if (cleanData.provinciaEmissao) cleanData.provinciaEmissao = cleanData.provinciaEmissao.trim();
      if (cleanData.tipo_desconto) cleanData.tipo_desconto = cleanData.tipo_desconto.trim();
      if (cleanData.url_Foto) cleanData.url_Foto = cleanData.url_Foto.trim();

      // Definir dataCadastro se não fornecida
      if (!cleanData.dataCadastro) {
        cleanData.dataCadastro = new Date();
      }

      return await prisma.tb_alunos.create({
        data: cleanData,
        include: {
          tb_encarregados: {
            include: {
              tb_profissao: true
            }
          },
          tb_utilizadores: {
            select: {
              codigo: true,
              nome: true,
              user: true
            }
          },
          tb_tipo_documento: true
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar aluno', 500);
    }
  }

  static async updateAluno(id, data) {
    try {
      const existingAluno = await prisma.tb_alunos.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingAluno) {
        throw new AppError('Aluno não encontrado', 404);
      }

      // Verificações de referências se fornecidas
      if (data.codigo_Encarregado) {
        const encarregadoExists = await prisma.tb_encarregados.findUnique({
          where: { codigo: data.codigo_Encarregado }
        });

        if (!encarregadoExists) {
          throw new AppError('Encarregado não encontrado', 404);
        }
      }

      if (data.codigo_Utilizador) {
        const utilizadorExists = await prisma.tb_utilizadores.findUnique({
          where: { codigo: data.codigo_Utilizador }
        });

        if (!utilizadorExists) {
          throw new AppError('Utilizador não encontrado', 404);
        }
      }

      if (data.codigoTipoDocumento) {
        const tipoDocumentoExists = await prisma.tb_tipo_documento.findUnique({
          where: { codigo: data.codigoTipoDocumento }
        });

        if (!tipoDocumentoExists) {
          throw new AppError('Tipo de documento não encontrado', 404);
        }
      }

      // Verificar se já existe outro aluno com mesmo documento
      if (data.n_documento_identificacao && data.codigoTipoDocumento) {
        const existingWithDoc = await prisma.tb_alunos.findFirst({
          where: {
            n_documento_identificacao: data.n_documento_identificacao.trim(),
            codigoTipoDocumento: data.codigoTipoDocumento,
            codigo: { not: parseInt(id) }
          }
        });

        if (existingWithDoc) {
          throw new AppError('Já existe um aluno com este documento de identificação', 409);
        }
      }

      const updateData = { ...data };
      if (updateData.nome) updateData.nome = updateData.nome.trim();
      if (updateData.pai) updateData.pai = updateData.pai.trim();
      if (updateData.mae) updateData.mae = updateData.mae.trim();
      if (updateData.email) updateData.email = updateData.email.trim();
      if (updateData.telefone) updateData.telefone = updateData.telefone.trim();
      if (updateData.n_documento_identificacao) updateData.n_documento_identificacao = updateData.n_documento_identificacao.trim();
      if (updateData.morada) updateData.morada = updateData.morada.trim();
      if (updateData.motivo_Desconto) updateData.motivo_Desconto = updateData.motivo_Desconto.trim();
      if (updateData.provinciaEmissao) updateData.provinciaEmissao = updateData.provinciaEmissao.trim();
      if (updateData.tipo_desconto) updateData.tipo_desconto = updateData.tipo_desconto.trim();
      if (updateData.url_Foto) updateData.url_Foto = updateData.url_Foto.trim();

      return await prisma.tb_alunos.update({
        where: { codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_encarregados: {
            include: {
              tb_profissao: true
            }
          },
          tb_utilizadores: {
            select: {
              codigo: true,
              nome: true,
              user: true
            }
          },
          tb_tipo_documento: true
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar aluno', 500);
    }
  }

  static async getAlunos(page = 1, limit = 10, search = '') {
    try {
      const { skip, take } = getPagination(page, limit);

      const where = search ? {
        OR: [
          { nome: { contains: search, mode: 'insensitive' } },
          { pai: { contains: search, mode: 'insensitive' } },
          { mae: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { telefone: { contains: search } },
          { n_documento_identificacao: { contains: search } }
        ]
      } : {};

      const [alunos, total] = await Promise.all([
        prisma.tb_alunos.findMany({
          where,
          skip,
          take,
          include: {
            tb_encarregados: {
              select: {
                codigo: true,
                nome: true,
                telefone: true
              }
            },
            tb_utilizadores: {
              select: {
                codigo: true,
                nome: true,
                user: true
              }
            },
            tb_tipo_documento: true,
            tb_matriculas: {
              select: {
                codigo: true,
                data_Matricula: true,
                codigoStatus: true,
                tb_cursos: {
                  select: {
                    codigo: true,
                    designacao: true
                  }
                }
              }
            }
          },
          orderBy: { nome: 'asc' }
        }),
        prisma.tb_alunos.count({ where })
      ]);

      return {
        data: alunos,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new AppError('Erro ao buscar alunos', 500);
    }
  }

  static async getAlunoById(id) {
    try {
      const aluno = await prisma.tb_alunos.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_encarregados: {
            include: {
              tb_profissao: true,
              tb_utilizadores: {
                select: {
                  codigo: true,
                  nome: true,
                  user: true,
                  email: true
                }
              }
            }
          },
          tb_utilizadores: {
            select: {
              codigo: true,
              nome: true,
              user: true,
              email: true
            }
          },
          tb_tipo_documento: true,
          tb_matriculas: {
            include: {
              tb_cursos: true,
              tb_confirmacoes: {
                include: {
                  tb_turmas: {
                    include: {
                      tb_classes: true,
                      tb_salas: true,
                      tb_periodos: true
                    }
                  }
                }
              }
            }
          },
          tb_pagamentos: {
            take: 5,
            orderBy: { codigo: 'desc' }
          },
          tb_transferencias: {
            take: 5,
            orderBy: { codigo: 'desc' }
          }
        }
      });

      if (!aluno) {
        throw new AppError('Aluno não encontrado', 404);
      }

      return aluno;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar aluno', 500);
    }
  }

  static async deleteAluno(id) {
    try {
      const existingAluno = await prisma.tb_alunos.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_matriculas: true,
          tb_pagamentos: true
        }
      });

      if (!existingAluno) {
        throw new AppError('Aluno não encontrado', 404);
      }

      // Verificar se há matrículas ou pagamentos associados
      if (existingAluno.tb_matriculas || existingAluno.tb_pagamentos.length > 0) {
        throw new AppError('Não é possível excluir aluno com matrículas ou pagamentos associados', 400);
      }

      await prisma.tb_alunos.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Aluno excluído com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir aluno', 500);
    }
  }

  // ===============================
  // MATRÍCULAS - CRUD COMPLETO
  // ===============================

  static async createMatricula(data) {
    try {
      const { codigo_Aluno, data_Matricula, codigo_Curso, codigo_Utilizador, codigoStatus } = data;

      // Verificar se o aluno existe
      const alunoExists = await prisma.tb_alunos.findUnique({
        where: { codigo: codigo_Aluno }
      });

      if (!alunoExists) {
        throw new AppError('Aluno não encontrado', 404);
      }

      // Verificar se o curso existe
      const cursoExists = await prisma.tb_cursos.findUnique({
        where: { codigo: codigo_Curso }
      });

      if (!cursoExists) {
        throw new AppError('Curso não encontrado', 404);
      }

      // Verificar se o utilizador existe
      const utilizadorExists = await prisma.tb_utilizadores.findUnique({
        where: { codigo: codigo_Utilizador }
      });

      if (!utilizadorExists) {
        throw new AppError('Utilizador não encontrado', 404);
      }

      // Verificar se já existe matrícula para este aluno
      const existingMatricula = await prisma.tb_matriculas.findUnique({
        where: { codigo_Aluno }
      });

      if (existingMatricula) {
        throw new AppError('Já existe uma matrícula para este aluno', 409);
      }

      return await prisma.tb_matriculas.create({
        data: {
          codigo_Aluno,
          data_Matricula,
          codigo_Curso,
          codigo_Utilizador,
          codigoStatus: codigoStatus ?? 1
        },
        include: {
          tb_alunos: {
            select: {
              codigo: true,
              nome: true,
              dataNascimento: true,
              sexo: true
            }
          },
          tb_cursos: true,
          tb_utilizadores: {
            select: {
              codigo: true,
              nome: true,
              user: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar matrícula', 500);
    }
  }

  static async updateMatricula(id, data) {
    try {
      const existingMatricula = await prisma.tb_matriculas.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingMatricula) {
        throw new AppError('Matrícula não encontrada', 404);
      }

      // Verificações de referências se fornecidas
      if (data.codigo_Aluno && data.codigo_Aluno !== existingMatricula.codigo_Aluno) {
        const alunoExists = await prisma.tb_alunos.findUnique({
          where: { codigo: data.codigo_Aluno }
        });

        if (!alunoExists) {
          throw new AppError('Aluno não encontrado', 404);
        }

        // Verificar se já existe matrícula para este aluno
        const existingWithAluno = await prisma.tb_matriculas.findFirst({
          where: {
            codigo_Aluno: data.codigo_Aluno,
            codigo: { not: parseInt(id) }
          }
        });

        if (existingWithAluno) {
          throw new AppError('Já existe uma matrícula para este aluno', 409);
        }
      }

      if (data.codigo_Curso) {
        const cursoExists = await prisma.tb_cursos.findUnique({
          where: { codigo: data.codigo_Curso }
        });

        if (!cursoExists) {
          throw new AppError('Curso não encontrado', 404);
        }
      }

      if (data.codigo_Utilizador) {
        const utilizadorExists = await prisma.tb_utilizadores.findUnique({
          where: { codigo: data.codigo_Utilizador }
        });

        if (!utilizadorExists) {
          throw new AppError('Utilizador não encontrado', 404);
        }
      }

      return await prisma.tb_matriculas.update({
        where: { codigo: parseInt(id) },
        data,
        include: {
          tb_alunos: {
            select: {
              codigo: true,
              nome: true,
              dataNascimento: true,
              sexo: true
            }
          },
          tb_cursos: true,
          tb_utilizadores: {
            select: {
              codigo: true,
              nome: true,
              user: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar matrícula', 500);
    }
  }

  static async getMatriculas(page = 1, limit = 10, search = '') {
    try {
      const { skip, take } = getPagination(page, limit);

      const where = search ? {
        OR: [
          { tb_alunos: { nome: { contains: search, mode: 'insensitive' } } },
          { tb_cursos: { designacao: { contains: search, mode: 'insensitive' } } }
        ]
      } : {};

      const [matriculas, total] = await Promise.all([
        prisma.tb_matriculas.findMany({
          where,
          skip,
          take,
          include: {
            tb_alunos: {
              select: {
                codigo: true,
                nome: true,
                dataNascimento: true,
                sexo: true,
                url_Foto: true
              }
            },
            tb_cursos: true,
            tb_utilizadores: {
              select: {
                codigo: true,
                nome: true,
                user: true
              }
            },
            tb_confirmacoes: {
              take: 1,
              orderBy: { codigo: 'desc' },
              include: {
                tb_turmas: {
                  include: {
                    tb_classes: true
                  }
                }
              }
            }
          },
          orderBy: { data_Matricula: 'desc' }
        }),
        prisma.tb_matriculas.count({ where })
      ]);

      return {
        data: matriculas,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error(`Erro ao buscar matrículas: ${error.message}`, error);
      throw new AppError(`Erro ao buscar matrículas: ${error.message}`, 500);
    }
  }

  static async getMatriculaById(id) {
    try {
      const matricula = await prisma.tb_matriculas.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_alunos: {
            include: {
              tb_encarregados: {
                include: {
                  tb_profissao: true
                }
              },
              tb_tipo_documento: true
            }
          },
          tb_cursos: true,
          tb_utilizadores: {
            select: {
              codigo: true,
              nome: true,
              user: true,
              email: true
            }
          },
          tb_confirmacoes: {
            include: {
              tb_turmas: {
                include: {
                  tb_classes: true,
                  tb_salas: true,
                  tb_periodos: true
                }
              }
            }
          }
        }
      });

      if (!matricula) {
        throw new AppError('Matrícula não encontrada', 404);
      }

      return matricula;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar matrícula', 500);
    }
  }

  static async deleteMatricula(id) {
    try {
      const existingMatricula = await prisma.tb_matriculas.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_confirmacoes: true
        }
      });

      if (!existingMatricula) {
        throw new AppError('Matrícula não encontrada', 404);
      }

      // Verificar se há confirmações associadas
      if (existingMatricula.tb_confirmacoes.length > 0) {
        throw new AppError('Não é possível excluir matrícula com confirmações associadas', 400);
      }

      await prisma.tb_matriculas.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Matrícula excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir matrícula', 500);
    }
  }

  // ===============================
  // CONFIRMAÇÕES - CRUD COMPLETO
  // ===============================

  static async createConfirmacao(data) {
    try {
      // Verificar se a matrícula existe
      const matriculaExists = await prisma.tb_matriculas.findUnique({
        where: { codigo: data.codigo_Matricula }
      });

      if (!matriculaExists) {
        throw new AppError('Matrícula não encontrada', 404);
      }

      // Verificar se a turma existe
      const turmaExists = await prisma.tb_turmas.findUnique({
        where: { codigo: data.codigo_Turma }
      });

      if (!turmaExists) {
        throw new AppError('Turma não encontrada', 404);
      }

      // Verificar se o utilizador existe
      const utilizadorExists = await prisma.tb_utilizadores.findUnique({
        where: { codigo: data.codigo_Utilizador }
      });

      if (!utilizadorExists) {
        throw new AppError('Utilizador não encontrado', 404);
      }

      // Verificar se já existe confirmação para esta matrícula no mesmo ano letivo
      const existingConfirmacao = await prisma.tb_confirmacoes.findFirst({
        where: {
          codigo_Matricula: data.codigo_Matricula,
          codigo_Ano_lectivo: data.codigo_Ano_lectivo
        }
      });

      if (existingConfirmacao) {
        throw new AppError('Já existe uma confirmação para esta matrícula neste ano letivo', 409);
      }

      const cleanData = { ...data };
      if (cleanData.classificacao) cleanData.classificacao = cleanData.classificacao.trim();

      return await prisma.tb_confirmacoes.create({
        data: cleanData,
        include: {
          tb_matriculas: {
            include: {
              tb_alunos: {
                select: {
                  codigo: true,
                  nome: true,
                  dataNascimento: true,
                  sexo: true
                }
              },
              tb_cursos: true
            }
          },
          tb_turmas: {
            include: {
              tb_classes: true,
              tb_salas: true,
              tb_periodos: true
            }
          },
          tb_utilizadores: {
            select: {
              codigo: true,
              nome: true,
              user: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar confirmação', 500);
    }
  }

  static async updateConfirmacao(id, data) {
    try {
      const existingConfirmacao = await prisma.tb_confirmacoes.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingConfirmacao) {
        throw new AppError('Confirmação não encontrada', 404);
      }

      // Verificações de referências se fornecidas
      if (data.codigo_Matricula) {
        const matriculaExists = await prisma.tb_matriculas.findUnique({
          where: { codigo: data.codigo_Matricula }
        });

        if (!matriculaExists) {
          throw new AppError('Matrícula não encontrada', 404);
        }
      }

      if (data.codigo_Turma) {
        const turmaExists = await prisma.tb_turmas.findUnique({
          where: { codigo: data.codigo_Turma }
        });

        if (!turmaExists) {
          throw new AppError('Turma não encontrada', 404);
        }
      }

      if (data.codigo_Utilizador) {
        const utilizadorExists = await prisma.tb_utilizadores.findUnique({
          where: { codigo: data.codigo_Utilizador }
        });

        if (!utilizadorExists) {
          throw new AppError('Utilizador não encontrado', 404);
        }
      }

      const updateData = { ...data };
      if (updateData.classificacao) updateData.classificacao = updateData.classificacao.trim();

      return await prisma.tb_confirmacoes.update({
        where: { codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_matriculas: {
            include: {
              tb_alunos: {
                select: {
                  codigo: true,
                  nome: true,
                  dataNascimento: true,
                  sexo: true
                }
              },
              tb_cursos: true
            }
          },
          tb_turmas: {
            include: {
              tb_classes: true,
              tb_salas: true,
              tb_periodos: true
            }
          },
          tb_utilizadores: {
            select: {
              codigo: true,
              nome: true,
              user: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar confirmação', 500);
    }
  }

  static async getConfirmacoes(page = 1, limit = 10, search = '') {
    try {
      const { skip, take } = getPagination(page, limit);

      const where = search ? {
        OR: [
          { tb_matriculas: { tb_alunos: { nome: { contains: search, mode: 'insensitive' } } } },
          { tb_turmas: { designacao: { contains: search, mode: 'insensitive' } } },
          { classificacao: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [confirmacoes, total] = await Promise.all([
        prisma.tb_confirmacoes.findMany({
          where,
          skip,
          take,
          include: {
            tb_matriculas: {
              include: {
                tb_alunos: {
                  select: {
                    codigo: true,
                    nome: true,
                    dataNascimento: true,
                    sexo: true,
                    url_Foto: true
                  }
                },
                tb_cursos: true
              }
            },
            tb_turmas: {
              include: {
                tb_classes: true,
                tb_salas: true,
                tb_periodos: true
              }
            },
            tb_utilizadores: {
              select: {
                codigo: true,
                nome: true,
                user: true
              }
            }
          },
          orderBy: { data_Confirmacao: 'desc' }
        }),
        prisma.tb_confirmacoes.count({ where })
      ]);

      return {
        data: confirmacoes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new AppError('Erro ao buscar confirmações', 500);
    }
  }

  static async getConfirmacaoById(id) {
    try {
      const confirmacao = await prisma.tb_confirmacoes.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_matriculas: {
            include: {
              tb_alunos: {
                include: {
                  tb_encarregados: {
                    include: {
                      tb_profissao: true
                    }
                  },
                  tb_tipo_documento: true
                }
              },
              tb_cursos: true
            }
          },
          tb_turmas: {
            include: {
              tb_classes: true,
              tb_salas: true,
              tb_periodos: true
            }
          },
          tb_utilizadores: {
            select: {
              codigo: true,
              nome: true,
              user: true,
              email: true
            }
          }
        }
      });

      if (!confirmacao) {
        throw new AppError('Confirmação não encontrada', 404);
      }

      return confirmacao;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar confirmação', 500);
    }
  }

  static async deleteConfirmacao(id) {
    try {
      const existingConfirmacao = await prisma.tb_confirmacoes.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingConfirmacao) {
        throw new AppError('Confirmação não encontrada', 404);
      }

      await prisma.tb_confirmacoes.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Confirmação excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir confirmação', 500);
    }
  }

  // ===============================
  // TRANSFERÊNCIAS - CRUD COMPLETO
  // ===============================

  static async createTransferencia(data) {
    try {
      // Verificar se o aluno existe
      const alunoExists = await prisma.tb_alunos.findUnique({
        where: { codigo: data.codigoAluno }
      });

      if (!alunoExists) {
        throw new AppError('Aluno não encontrado', 404);
      }

      const cleanData = { ...data };
      if (cleanData.obs) cleanData.obs = cleanData.obs.trim();

      return await prisma.tb_transferencias.create({
        data: cleanData,
        include: {
          tb_alunos: {
            select: {
              codigo: true,
              nome: true,
              dataNascimento: true,
              sexo: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar transferência', 500);
    }
  }

  static async updateTransferencia(id, data) {
    try {
      const existingTransferencia = await prisma.tb_transferencias.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingTransferencia) {
        throw new AppError('Transferência não encontrada', 404);
      }

      // Verificar se o aluno existe (se fornecido)
      if (data.codigoAluno) {
        const alunoExists = await prisma.tb_alunos.findUnique({
          where: { codigo: data.codigoAluno }
        });

        if (!alunoExists) {
          throw new AppError('Aluno não encontrado', 404);
        }
      }

      const updateData = { ...data };
      if (updateData.obs) updateData.obs = updateData.obs.trim();
      if (!updateData.dataActualizacao) updateData.dataActualizacao = new Date();

      return await prisma.tb_transferencias.update({
        where: { codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_alunos: {
            select: {
              codigo: true,
              nome: true,
              dataNascimento: true,
              sexo: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar transferência', 500);
    }
  }

  static async getTransferencias(page = 1, limit = 10, search = '') {
    try {
      const { skip, take } = getPagination(page, limit);

      const where = search ? {
        OR: [
          { tb_alunos: { nome: { contains: search, mode: 'insensitive' } } },
          { obs: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [transferencias, total] = await Promise.all([
        prisma.tb_transferencias.findMany({
          where,
          skip,
          take,
          include: {
            tb_alunos: {
              select: {
                codigo: true,
                nome: true,
                dataNascimento: true,
                sexo: true,
                url_Foto: true
              }
            }
          },
          orderBy: { dataTransferencia: 'desc' }
        }),
        prisma.tb_transferencias.count({ where })
      ]);

      return {
        data: transferencias,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new AppError('Erro ao buscar transferências', 500);
    }
  }

  static async getTransferenciaById(id) {
    try {
      const transferencia = await prisma.tb_transferencias.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_alunos: {
            include: {
              tb_encarregados: {
                include: {
                  tb_profissao: true
                }
              },
              tb_matriculas: {
                include: {
                  tb_cursos: true
                }
              }
            }
          }
        }
      });

      if (!transferencia) {
        throw new AppError('Transferência não encontrada', 404);
      }

      return transferencia;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar transferência', 500);
    }
  }

  static async deleteTransferencia(id) {
    try {
      const existingTransferencia = await prisma.tb_transferencias.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingTransferencia) {
        throw new AppError('Transferência não encontrada', 404);
      }

      await prisma.tb_transferencias.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Transferência excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir transferência', 500);
    }
  }

  // ===============================
  // OPERAÇÕES ESPECIAIS E CONSULTAS
  // ===============================

  static async getAlunosByTurma(codigo_Turma) {
    try {
      const alunos = await prisma.tb_confirmacoes.findMany({
        where: {
          codigo_Turma: parseInt(codigo_Turma),
          codigo_Status: 1
        },
        include: {
          tb_matriculas: {
            include: {
              tb_alunos: {
                select: {
                  codigo: true,
                  nome: true,
                  dataNascimento: true,
                  sexo: true,
                  url_Foto: true,
                  saldo: true
                }
              }
            }
          },
          tb_turmas: {
            include: {
              tb_classes: true,
              tb_salas: true,
              tb_periodos: true
            }
          }
        }
      });

      return alunos.map(confirmacao => ({
        ...confirmacao.tb_matriculas.tb_alunos,
        confirmacao: {
          codigo: confirmacao.codigo,
          data_Confirmacao: confirmacao.data_Confirmacao,
          classificacao: confirmacao.classificacao
        },
        turma: confirmacao.tb_turmas
      }));
    } catch (error) {
      throw new AppError('Erro ao buscar alunos da turma', 500);
    }
  }

  static async getMatriculasByAnoLectivo(codigo_AnoLectivo) {
    try {
      const matriculas = await prisma.tb_confirmacoes.findMany({
        where: {
          codigo_Ano_lectivo: parseInt(codigo_AnoLectivo),
          codigo_Status: 1
        },
        include: {
          tb_matriculas: {
            include: {
              tb_alunos: {
                select: {
                  codigo: true,
                  nome: true,
                  dataNascimento: true,
                  sexo: true,
                  url_Foto: true
                }
              },
              tb_cursos: true
            }
          },
          tb_turmas: {
            include: {
              tb_classes: true,
              tb_salas: true,
              tb_periodos: true
            }
          }
        }
      });

      return matriculas;
    } catch (error) {
      throw new AppError('Erro ao buscar matrículas do ano letivo', 500);
    }
  }

  static async getConfirmacoesByTurmaAndAno(codigo_Turma, codigo_AnoLectivo) {
    try {
      const confirmacoes = await prisma.tb_confirmacoes.findMany({
        where: {
          codigo_Turma: parseInt(codigo_Turma),
          codigo_Ano_lectivo: parseInt(codigo_AnoLectivo),
          codigo_Status: 1
        },
        include: {
          tb_matriculas: {
            include: {
              tb_alunos: {
                select: {
                  codigo: true,
                  nome: true,
                  dataNascimento: true,
                  sexo: true,
                  url_Foto: true,
                  saldo: true
                }
              },
              tb_cursos: true
            }
          },
          tb_turmas: {
            include: {
              tb_classes: true,
              tb_salas: true,
              tb_periodos: true
            }
          }
        }
      });

      return confirmacoes;
    } catch (error) {
      throw new AppError('Erro ao buscar confirmações da turma e ano', 500);
    }
  }

  static async getAlunosWithoutMatricula() {
    try {
      const alunos = await prisma.tb_alunos.findMany({
        where: {
          codigo_Status: 1,
          tb_matriculas: null
        },
        include: {
          tb_encarregados: {
            select: {
              codigo: true,
              nome: true,
              telefone: true
            }
          },
          tb_tipo_documento: true
        },
        orderBy: { nome: 'asc' }
      });

      return alunos;
    } catch (error) {
      throw new AppError('Erro ao buscar alunos sem matrícula', 500);
    }
  }

  static async getMatriculasWithoutConfirmacao() {
    try {
      const matriculas = await prisma.tb_matriculas.findMany({
        where: {
          codigoStatus: 1,
          tb_confirmacoes: {
            none: {}
          }
        },
        include: {
          tb_alunos: {
            select: {
              codigo: true,
              nome: true,
              dataNascimento: true,
              sexo: true,
              url_Foto: true
            }
          },
          tb_cursos: true
        },
        orderBy: { data_Matricula: 'desc' }
      });

      return matriculas;
    } catch (error) {
      throw new AppError('Erro ao buscar matrículas sem confirmação', 500);
    }
  }
}