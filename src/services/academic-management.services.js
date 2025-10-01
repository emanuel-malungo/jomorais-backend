// services/academic-management.services.js
import prisma from '../config/database.js';
import { AppError } from '../utils/validation.utils.js';

export class AcademicManagementService {
  // ===============================
  // ANO LETIVO - CRUD COMPLETO
  // ===============================

  static async createAnoLectivo(data) {
    try {
      const { designacao, mesInicial, mesFinal, anoInicial, anoFinal } = data;

      const existingAno = await prisma.tb_ano_lectivo.findFirst({
        where: {
          designacao: designacao.trim()
        }
      });

      if (existingAno) {
        throw new AppError('Já existe um ano letivo com esta designação', 409);
      }

      if (parseInt(anoInicial) > parseInt(anoFinal)) {
        throw new AppError('Ano inicial não pode ser maior que ano final', 400);
      }

      return await prisma.tb_ano_lectivo.create({
        data: {
          designacao: designacao.trim(),
          mesInicial: mesInicial.trim(),
          mesFinal: mesFinal.trim(),
          anoInicial: anoInicial.trim(),
          anoFinal: anoFinal.trim()
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar ano letivo', 500);
    }
  }

  static async updateAnoLectivo(id, data) {
    try {
      const existingAno = await prisma.tb_ano_lectivo.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingAno) {
        throw new AppError('Ano letivo não encontrado', 404);
      }

      if (data.designacao) {
        const duplicateAno = await prisma.tb_ano_lectivo.findFirst({
          where: {
            designacao: data.designacao.trim(),
            codigo: { not: parseInt(id) }
          }
        });

        if (duplicateAno) {
          throw new AppError('Já existe um ano letivo com esta designação', 409);
        }
      }

      const updateData = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          updateData[key] = typeof data[key] === 'string' ? data[key].trim() : data[key];
        }
      });

      return await prisma.tb_ano_lectivo.update({
        where: { codigo: parseInt(id) },
        data: updateData
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar ano letivo', 500);
    }
  }

  static async getAnosLectivos(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search
        }
      } : {};

      const [anosLectivos, total] = await Promise.all([
        prisma.tb_ano_lectivo.findMany({
          where,
          skip,
          take: limit,
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_ano_lectivo.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: anosLectivos,
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
      throw new AppError('Erro ao buscar anos letivos', 500);
    }
  }

  static async getAnoLectivoById(id) {
    try {
      const anoLectivo = await prisma.tb_ano_lectivo.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!anoLectivo) {
        throw new AppError('Ano letivo não encontrado', 404);
      }

      return anoLectivo;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar ano letivo', 500);
    }
  }

  static async deleteAnoLectivo(id) {
    try {
      const existingAno = await prisma.tb_ano_lectivo.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingAno) {
        throw new AppError('Ano letivo não encontrado', 404);
      }

      const turmasCount = await prisma.tb_turmas.count({
        where: { codigo_AnoLectivo: parseInt(id) }
      });

      if (turmasCount > 0) {
        throw new AppError('Não é possível excluir este ano letivo pois está sendo usado por turmas', 400);
      }

      await prisma.tb_ano_lectivo.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Ano letivo excluído com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir ano letivo', 500);
    }
  }

  // ===============================
  // CURSOS - CRUD COMPLETO
  // ===============================

  static async createCurso(data) {
    try {
      const { designacao, codigo_Status } = data;

      if (designacao) {
        const existingCurso = await prisma.tb_cursos.findFirst({
          where: {
            designacao: designacao.trim()
          }
        });

        if (existingCurso) {
          throw new AppError('Já existe um curso com esta designação', 409);
        }
      }

      return await prisma.tb_cursos.create({
        data: {
          designacao: designacao?.trim() || null,
          codigo_Status: codigo_Status ? parseInt(codigo_Status) : 1
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar curso', 500);
    }
  }

  static async updateCurso(id, data) {
    try {
      const existingCurso = await prisma.tb_cursos.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingCurso) {
        throw new AppError('Curso não encontrado', 404);
      }

      if (data.designacao) {
        const duplicateCurso = await prisma.tb_cursos.findFirst({
          where: {
            designacao: data.designacao.trim(),
            codigo: { not: parseInt(id) }
          }
        });

        if (duplicateCurso) {
          throw new AppError('Já existe um curso com esta designação', 409);
        }
      }

      const updateData = {};
      if (data.designacao !== undefined) {
        updateData.designacao = data.designacao?.trim() || null;
      }
      if (data.codigo_Status !== undefined) {
        updateData.codigo_Status = data.codigo_Status ? parseInt(data.codigo_Status) : null;
      }

      return await prisma.tb_cursos.update({
        where: { codigo: parseInt(id) },
        data: updateData
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar curso', 500);
    }
  }

  static async getCursos(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search
        }
      } : {};

      const [cursos, total] = await Promise.all([
        prisma.tb_cursos.findMany({
          where,
          skip,
          take: limit,
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_cursos.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: cursos,
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
      throw new AppError('Erro ao buscar cursos', 500);
    }
  }

  static async getCursoById(id) {
    try {
      const curso = await prisma.tb_cursos.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!curso) {
        throw new AppError('Curso não encontrado', 404);
      }

      return curso;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar curso', 500);
    }
  }

  static async deleteCurso(id) {
    try {
      const existingCurso = await prisma.tb_cursos.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_disciplinas: true,
          tb_turmas: true,
          tb_grade_curricular: true
        }
      });

      if (!existingCurso) {
        throw new AppError('Curso não encontrado', 404);
      }

      if (existingCurso.tb_disciplinas.length > 0 || 
          existingCurso.tb_turmas.length > 0 || 
          existingCurso.tb_grade_curricular.length > 0) {
        throw new AppError('Não é possível excluir este curso pois possui dependências', 400);
      }

      await prisma.tb_cursos.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Curso excluído com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir curso', 500);
    }
  }

  // ===============================
  // CLASSES - CRUD COMPLETO
  // ===============================

  static async createClasse(data) {
    try {
      const { designacao, status, notaMaxima, exame } = data;

      const existingClasse = await prisma.tb_classes.findFirst({
        where: {
          designacao: designacao.trim()
        }
      });

      if (existingClasse) {
        throw new AppError('Já existe uma classe com esta designação', 409);
      }

      return await prisma.tb_classes.create({
        data: {
          designacao: designacao.trim(),
          status: status ? parseInt(status) : 1,
          notaMaxima: notaMaxima ? parseFloat(notaMaxima) : 0,
          exame: exame !== undefined ? Boolean(exame) : false
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar classe', 500);
    }
  }

  static async updateClasse(id, data) {
    try {
      const existingClasse = await prisma.tb_classes.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingClasse) {
        throw new AppError('Classe não encontrada', 404);
      }

      if (data.designacao) {
        const duplicateClasse = await prisma.tb_classes.findFirst({
          where: {
            designacao: data.designacao.trim(),
            codigo: { not: parseInt(id) }
          }
        });

        if (duplicateClasse) {
          throw new AppError('Já existe uma classe com esta designação', 409);
        }
      }

      const updateData = {};
      if (data.designacao !== undefined) updateData.designacao = data.designacao.trim();
      if (data.status !== undefined) updateData.status = parseInt(data.status);
      if (data.notaMaxima !== undefined) updateData.notaMaxima = parseFloat(data.notaMaxima);
      if (data.exame !== undefined) updateData.exame = Boolean(data.exame);

      return await prisma.tb_classes.update({
        where: { codigo: parseInt(id) },
        data: updateData
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar classe', 500);
    }
  }

  static async getClasses(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search
        }
      } : {};

      const [classes, total] = await Promise.all([
        prisma.tb_classes.findMany({
          where,
          skip,
          take: limit,
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_classes.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: classes,
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
      throw new AppError('Erro ao buscar classes', 500);
    }
  }

  static async getClasseById(id) {
    try {
      const classe = await prisma.tb_classes.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!classe) {
        throw new AppError('Classe não encontrada', 404);
      }

      return classe;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar classe', 500);
    }
  }

  static async deleteClasse(id) {
    try {
      const existingClasse = await prisma.tb_classes.findUnique({
        where: { codigo: parseInt(id) },
        include: { tb_turmas: true, tb_grade_curricular: true }
      });

      if (!existingClasse) {
        throw new AppError('Classe não encontrada', 404);
      }

      if (existingClasse.tb_turmas.length > 0 || existingClasse.tb_grade_curricular.length > 0) {
        throw new AppError('Não é possível excluir esta classe pois possui dependências', 400);
      }

      await prisma.tb_classes.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Classe excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir classe', 500);
    }
  }

  // ===============================
  // DISCIPLINAS - CRUD COMPLETO
  // ===============================

  static async createDisciplina(data) {
    try {
      const { designacao, codigo_Curso, status, cadeiraEspecifica } = data;

      const cursoExists = await prisma.tb_cursos.findUnique({
        where: { codigo: parseInt(codigo_Curso) }
      });

      if (!cursoExists) {
        throw new AppError('Curso não encontrado', 404);
      }

      const existingDisciplina = await prisma.tb_disciplinas.findFirst({
        where: {
          designacao: designacao.trim(),
          codigo_Curso: parseInt(codigo_Curso)
        }
      });

      if (existingDisciplina) {
        throw new AppError('Já existe uma disciplina com esta designação neste curso', 409);
      }

      return await prisma.tb_disciplinas.create({
        data: {
          designacao: designacao.trim(),
          codigo_Curso: parseInt(codigo_Curso),
          status: status ? parseInt(status) : 1,
          cadeiraEspecifica: cadeiraEspecifica ? parseInt(cadeiraEspecifica) : 0
        },
        include: {
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro detalhado ao criar disciplina:', error);
      throw new AppError('Erro ao criar disciplina', 500);
    }
  }

  static async updateDisciplina(id, data) {
    try {
      const existingDisciplina = await prisma.tb_disciplinas.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingDisciplina) {
        throw new AppError('Disciplina não encontrada', 404);
      }

      if (data.codigo_Curso) {
        const cursoExists = await prisma.tb_cursos.findUnique({
          where: { codigo: parseInt(data.codigo_Curso) }
        });
        if (!cursoExists) throw new AppError('Curso não encontrado', 404);
      }

      const updateData = {};
      if (data.designacao !== undefined) updateData.designacao = data.designacao.trim();
      if (data.codigo_Curso !== undefined) updateData.codigo_Curso = parseInt(data.codigo_Curso);
      if (data.status !== undefined) updateData.status = parseInt(data.status);
      if (data.cadeiraEspecifica !== undefined) updateData.cadeiraEspecifica = parseInt(data.cadeiraEspecifica);

      return await prisma.tb_disciplinas.update({
        where: { codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar disciplina', 500);
    }
  }

  static async deleteDisciplina(id) {
    try {
      const existingDisciplina = await prisma.tb_disciplinas.findUnique({
        where: { codigo: parseInt(id) },
        include: { 
          tb_grade_curricular: {
            include: {
              tb_classes: { select: { designacao: true } },
              tb_cursos: { select: { designacao: true } }
            }
          }
        }
      });

      if (!existingDisciplina) {
        throw new AppError('Disciplina não encontrada', 404);
      }

      if (existingDisciplina.tb_grade_curricular.length > 0) {
        const count = existingDisciplina.tb_grade_curricular.length;
        const gradeInfo = existingDisciplina.tb_grade_curricular.map(gc => ({
          classe: gc.tb_classes?.designacao || `Classe ${gc.codigo_Classe}`,
          curso: gc.tb_cursos?.designacao || `Curso ${gc.codigo_Curso}`
        }));
        
        const details = gradeInfo.length > 0 
          ? ` Está sendo usada nas seguintes grades: ${gradeInfo.map(info => `${info.classe} - ${info.curso}`).join(', ')}.`
          : '';
          
        throw new AppError(
          `Não é possível excluir esta disciplina pois ela está sendo usada em ${count} item(ns) da grade curricular.${details} Remova-a da grade curricular primeiro.`, 
          400
        );
      }

      await prisma.tb_disciplinas.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Disciplina excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir disciplina', 500);
    }
  }

  static async getDisciplinas(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search
        }
      } : {};

      const [disciplinas, total] = await Promise.all([
        prisma.tb_disciplinas.findMany({
          where,
          skip,
          take: limit,
          include: {
            tb_cursos: { select: { codigo: true, designacao: true } },
            tb_grade_curricular: { select: { codigo: true } }
          },
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_disciplinas.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: disciplinas,
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
      throw new AppError('Erro ao buscar disciplinas', 500);
    }
  }

  static async getDisciplinaById(id) {
    try {
      const disciplina = await prisma.tb_disciplinas.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });

      if (!disciplina) {
        throw new AppError('Disciplina não encontrada', 404);
      }

      return disciplina;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar disciplina', 500);
    }
  }

  // ===============================
  // SALAS - CRUD COMPLETO
  // ===============================

  static async createSala(data) {
    try {
      const { designacao } = data;

      const existingSala = await prisma.tb_salas.findFirst({
        where: {
          designacao: { equals: designacao.trim(), mode: 'insensitive' }
        }
      });

      if (existingSala) {
        throw new AppError('Já existe uma sala com esta designação', 409);
      }

      return await prisma.tb_salas.create({
        data: { designacao: designacao.trim() }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar sala', 500);
    }
  }

  static async updateSala(id, data) {
    try {
      const existingSala = await prisma.tb_salas.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingSala) {
        throw new AppError('Sala não encontrada', 404);
      }

      return await prisma.tb_salas.update({
        where: { codigo: parseInt(id) },
        data: { designacao: data.designacao.trim() }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar sala', 500);
    }
  }

  static async deleteSala(id) {
    try {
      const existingSala = await prisma.tb_salas.findUnique({
        where: { codigo: parseInt(id) },
        include: { tb_turmas: true }
      });

      if (!existingSala) {
        throw new AppError('Sala não encontrada', 404);
      }

      if (existingSala.tb_turmas.length > 0) {
        throw new AppError('Não é possível excluir esta sala pois possui turmas associadas', 400);
      }

      await prisma.tb_salas.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Sala excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir sala', 500);
    }
  }

  static async getSalas(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search,
          mode: 'insensitive'
        }
      } : {};

      const [salas, total] = await Promise.all([
        prisma.tb_salas.findMany({
          where,
          skip,
          take: limit,
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_salas.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: salas,
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
      throw new AppError('Erro ao buscar salas', 500);
    }
  }

  static async getSalaById(id) {
    try {
      const sala = await prisma.tb_salas.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!sala) {
        throw new AppError('Sala não encontrada', 404);
      }

      return sala;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar sala', 500);
    }
  }

  // ===============================
  // PERÍODOS - CRUD COMPLETO
  // ===============================

  static async createPeriodo(data) {
    try {
      const { designacao } = data;

      const existingPeriodo = await prisma.tb_periodos.findFirst({
        where: {
          designacao: { equals: designacao.trim(), mode: 'insensitive' }
        }
      });

      if (existingPeriodo) {
        throw new AppError('Já existe um período com esta designação', 409);
      }

      return await prisma.tb_periodos.create({
        data: { designacao: designacao.trim() }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar período', 500);
    }
  }

  static async updatePeriodo(id, data) {
    try {
      const existingPeriodo = await prisma.tb_periodos.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingPeriodo) {
        throw new AppError('Período não encontrado', 404);
      }

      return await prisma.tb_periodos.update({
        where: { codigo: parseInt(id) },
        data: { designacao: data.designacao.trim() }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar período', 500);
    }
  }

  static async deletePeriodo(id) {
    try {
      const existingPeriodo = await prisma.tb_periodos.findUnique({
        where: { codigo: parseInt(id) },
        include: { tb_turmas: true }
      });

      if (!existingPeriodo) {
        throw new AppError('Período não encontrado', 404);
      }

      if (existingPeriodo.tb_turmas.length > 0) {
        throw new AppError('Não é possível excluir este período pois possui turmas associadas', 400);
      }

      await prisma.tb_periodos.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Período excluído com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir período', 500);
    }
  }

  static async getPeriodos(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search,
          mode: 'insensitive'
        }
      } : {};

      const [periodos, total] = await Promise.all([
        prisma.tb_periodos.findMany({
          where,
          skip,
          take: limit,
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_periodos.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: periodos,
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
      throw new AppError('Erro ao buscar períodos', 500);
    }
  }

  static async getPeriodoById(id) {
    try {
      const periodo = await prisma.tb_periodos.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!periodo) {
        throw new AppError('Período não encontrado', 404);
      }

      return periodo;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar período', 500);
    }
  }

  // ===============================
  // TURMAS - CRUD COMPLETO
  // ===============================

  static async createTurma(data) {
    try {
      const {
        designacao, codigo_Classe, codigo_Curso, codigo_Sala,
        codigo_Periodo, status, codigo_AnoLectivo, max_Alunos
      } = data;

      // Verificar entidades relacionadas
      const [classe, curso, sala, periodo] = await Promise.all([
        prisma.tb_classes.findUnique({ where: { codigo: parseInt(codigo_Classe) } }),
        prisma.tb_cursos.findUnique({ where: { codigo: parseInt(codigo_Curso) } }),
        prisma.tb_salas.findUnique({ where: { codigo: parseInt(codigo_Sala) } }),
        prisma.tb_periodos.findUnique({ where: { codigo: parseInt(codigo_Periodo) } })
      ]);

      if (!classe) throw new AppError('Classe não encontrada', 404);
      if (!curso) throw new AppError('Curso não encontrado', 404);
      if (!sala) throw new AppError('Sala não encontrada', 404);
      if (!periodo) throw new AppError('Período não encontrado', 404);

      const existingTurma = await prisma.tb_turmas.findFirst({
        where: {
          designacao: { equals: designacao.trim(), mode: 'insensitive' }
        }
      });

      if (existingTurma) {
        throw new AppError('Já existe uma turma com esta designação', 409);
      }

      return await prisma.tb_turmas.create({
        data: {
          designacao: designacao.trim(),
          codigo_Classe: parseInt(codigo_Classe),
          codigo_Curso: parseInt(codigo_Curso),
          codigo_Sala: parseInt(codigo_Sala),
          codigo_Periodo: parseInt(codigo_Periodo),
          status: status?.trim() || "Activo",
          codigo_AnoLectivo: codigo_AnoLectivo ? parseInt(codigo_AnoLectivo) : 1,
          max_Alunos: max_Alunos ? parseInt(max_Alunos) : 30
        },
        include: {
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } },
          tb_salas: { select: { codigo: true, designacao: true } },
          tb_periodos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar turma', 500);
    }
  }

  static async updateTurma(id, data) {
    try {
      const existingTurma = await prisma.tb_turmas.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingTurma) {
        throw new AppError('Turma não encontrada', 404);
      }

      const updateData = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          if (key === 'designacao' || key === 'status') {
            updateData[key] = data[key].trim();
          } else if (['codigo_Classe', 'codigo_Curso', 'codigo_Sala', 'codigo_Periodo', 'codigo_AnoLectivo', 'max_Alunos'].includes(key)) {
            updateData[key] = parseInt(data[key]);
          }
        }
      });

      return await prisma.tb_turmas.update({
        where: { codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } },
          tb_salas: { select: { codigo: true, designacao: true } },
          tb_periodos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar turma', 500);
    }
  }

  static async deleteTurma(id) {
    try {
      const existingTurma = await prisma.tb_turmas.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingTurma) {
        throw new AppError('Turma não encontrada', 404);
      }

      await prisma.tb_turmas.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Turma excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir turma', 500);
    }
  }

  static async getTurmas(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        designacao: {
          contains: search,
          mode: 'insensitive'
        }
      } : {};

      const [turmas, total] = await Promise.all([
        prisma.tb_turmas.findMany({
          where,
          skip,
          take: limit,
          include: {
            tb_classes: { select: { codigo: true, designacao: true } },
            tb_cursos: { select: { codigo: true, designacao: true } },
            tb_salas: { select: { codigo: true, designacao: true } },
            tb_periodos: { select: { codigo: true, designacao: true } }
          },
          orderBy: { designacao: 'asc' }
        }),
        prisma.tb_turmas.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: turmas,
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
      throw new AppError('Erro ao buscar turmas', 500);
    }
  }

  static async getTurmaById(id) {
    try {
      const turma = await prisma.tb_turmas.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } },
          tb_salas: { select: { codigo: true, designacao: true } },
          tb_periodos: { select: { codigo: true, designacao: true } }
        }
      });

      if (!turma) {
        throw new AppError('Turma não encontrada', 404);
      }

      return turma;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar turma', 500);
    }
  }

  // ===============================
  // GRADE CURRICULAR - CRUD COMPLETO
  // ===============================

  static async createGradeCurricular(data) {
    try {
      const {
        codigo_disciplina, codigo_Classe, codigo_Curso,
        codigo_user, codigo_empresa, status, codigoTipoNota
      } = data;

      // Verificar entidades relacionadas
      const [disciplina, classe, curso] = await Promise.all([
        prisma.tb_disciplinas.findUnique({ where: { codigo: parseInt(codigo_disciplina) } }),
        prisma.tb_classes.findUnique({ where: { codigo: parseInt(codigo_Classe) } }),
        prisma.tb_cursos.findUnique({ where: { codigo: parseInt(codigo_Curso) } })
      ]);

      if (!disciplina) throw new AppError('Disciplina não encontrada', 404);
      if (!classe) throw new AppError('Classe não encontrada', 404);
      if (!curso) throw new AppError('Curso não encontrado', 404);

      // Verificar se já existe essa combinação
      const existingGrade = await prisma.tb_grade_curricular.findFirst({
        where: {
          codigo_disciplina: parseInt(codigo_disciplina),
          codigo_Classe: parseInt(codigo_Classe),
          codigo_Curso: parseInt(codigo_Curso)
        }
      });

      if (existingGrade) {
        throw new AppError('Esta disciplina já está na grade curricular para esta classe e curso', 409);
      }

      return await prisma.tb_grade_curricular.create({
        data: {
          codigo_disciplina: parseInt(codigo_disciplina),
          codigo_Classe: parseInt(codigo_Classe),
          codigo_Curso: parseInt(codigo_Curso),
          codigo_user: parseInt(codigo_user),
          codigo_empresa: parseInt(codigo_empresa),
          status: parseInt(status),
          codigoTipoNota: parseInt(codigoTipoNota)
        },
        include: {
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao criar grade curricular', 500);
    }
  }

  static async updateGradeCurricular(id, data) {
    try {
      const existingGrade = await prisma.tb_grade_curricular.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingGrade) {
        throw new AppError('Grade curricular não encontrada', 404);
      }

      const updateData = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          updateData[key] = parseInt(data[key]);
        }
      });

      return await prisma.tb_grade_curricular.update({
        where: { codigo: parseInt(id) },
        data: updateData,
        include: {
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar grade curricular', 500);
    }
  }

  static async deleteGradeCurricular(id) {
    try {
      const existingGrade = await prisma.tb_grade_curricular.findUnique({
        where: { codigo: parseInt(id) }
      });

      if (!existingGrade) {
        throw new AppError('Grade curricular não encontrada', 404);
      }

      await prisma.tb_grade_curricular.delete({
        where: { codigo: parseInt(id) }
      });

      return { message: 'Grade curricular excluída com sucesso' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao excluir grade curricular', 500);
    }
  }

  static async getGradeCurricular(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      const where = search ? {
        OR: [
          {
            tb_disciplinas: {
              designacao: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            tb_classes: {
              designacao: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            tb_cursos: {
              designacao: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        ]
      } : {};

      const [gradeCurricular, total] = await Promise.all([
        prisma.tb_grade_curricular.findMany({
          where,
          skip,
          take: limit,
          include: {
            tb_disciplinas: { select: { codigo: true, designacao: true } },
            tb_classes: { select: { codigo: true, designacao: true } },
            tb_cursos: { select: { codigo: true, designacao: true } }
          },
          orderBy: { codigo: 'asc' }
        }),
        prisma.tb_grade_curricular.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: gradeCurricular,
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
      throw new AppError('Erro ao buscar grade curricular', 500);
    }
  }

  static async getGradeCurricularById(id) {
    try {
      const gradeCurricular = await prisma.tb_grade_curricular.findUnique({
        where: { codigo: parseInt(id) },
        include: {
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });

      if (!gradeCurricular) {
        throw new AppError('Grade curricular não encontrada', 404);
      }

      return gradeCurricular;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar grade curricular', 500);
    }
  }

  // ===============================
  // OPERAÇÕES ESPECIAIS
  // ===============================

  static async getGradeByCursoAndClasse(codigo_Curso, codigo_Classe) {
    try {
      return await prisma.tb_grade_curricular.findMany({
        where: {
          codigo_Curso: parseInt(codigo_Curso),
          codigo_Classe: parseInt(codigo_Classe)
        },
        include: {
          tb_disciplinas: { select: { codigo: true, designacao: true } },
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      throw new AppError('Erro ao buscar grade curricular', 500);
    }
  }

  static async getTurmasByAnoLectivo(codigo_AnoLectivo) {
    try {
      return await prisma.tb_turmas.findMany({
        where: { codigo_AnoLectivo: parseInt(codigo_AnoLectivo) },
        include: {
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } },
          tb_salas: { select: { codigo: true, designacao: true } },
          tb_periodos: { select: { codigo: true, designacao: true } }
        }
      });
    } catch (error) {
      throw new AppError('Erro ao buscar turmas do ano letivo', 500);
    }
  }

  static async getDisciplinasByCurso(codigo_Curso) {
    try {
      return await prisma.tb_disciplinas.findMany({
        where: { codigo_Curso: parseInt(codigo_Curso) },
        include: {
          tb_cursos: { select: { codigo: true, designacao: true } }
        },
        orderBy: { designacao: 'asc' }
      });
    } catch (error) {
      throw new AppError('Erro ao buscar disciplinas do curso', 500);
    }
  }

  static async getTurmasByClasseAndCurso(codigo_Classe, codigo_Curso) {
    try {
      return await prisma.tb_turmas.findMany({
        where: {
          codigo_Classe: parseInt(codigo_Classe),
          codigo_Curso: parseInt(codigo_Curso)
        },
        include: {
          tb_classes: { select: { codigo: true, designacao: true } },
          tb_cursos: { select: { codigo: true, designacao: true } },
          tb_salas: { select: { codigo: true, designacao: true } },
          tb_periodos: { select: { codigo: true, designacao: true } }
        },
        orderBy: { designacao: 'asc' }
      });
    } catch (error) {
      throw new AppError('Erro ao buscar turmas por classe e curso', 500);
    }
  }
}
