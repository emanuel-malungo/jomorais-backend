import { getPagination, getPagingData } from "../utils/pagination.utils.js";
import { AppError } from "../utils/validation.utils.js";
import { convertBigIntToString } from "../utils/bigint.utils.js";
import prisma from "../config/database.js";

export class UsersServices {
  static async getAllLegacyUsers(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const { skip, take } = getPagination(page, limit);

      // Primeiro conta o total de usuários
      const totalItems = await prisma.tb_utilizadores.count();

      // Depois busca os usuários com paginação
      const users = await prisma.tb_utilizadores.findMany({
        skip,
        take,
        include: {
          tb_tipos_utilizador: true, // pega também o tipo de utilizador
        },
        orderBy: { codigo: "desc" }, // ordena por mais recente
      });

      // Converter BigInt para string antes da serialização JSON
      const convertedUsers = convertBigIntToString(users);

      res.json({
        success: true,
        message: "Lista de usuários legados obtida com sucesso",
        meta: getPagingData(totalItems, page, take),
        data: convertedUsers,
      });
    } catch (error) {
      console.error("Erro ao obter usuários legados:", error);
      throw new AppError("Erro ao obter usuários legados", 500);
    }
  }

  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const { skip, take } = getPagination(page, limit);

      const totalItems = await prisma.users.count();

      const users = await prisma.users.findMany({
        skip,
        take,
        orderBy: { created_at: "desc" },
      });

      // Converter BigInt para string antes da serialização JSON
      const convertedUsers = convertBigIntToString(users);

      res.json({
        success: true,
        message: "Lista de usuários obtida com sucesso",
        meta: getPagingData(totalItems, page, take),
        data: convertedUsers,
      });
    } catch (error) {
      console.error("Erro ao obter usuários:", error);
      throw new AppError("Erro ao obter usuários", 500);
    }
  }

  static async getUserById(userId) {
    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return convertBigIntToString(user);
  }

  static async getUserLegacyById(userId) {
    const user = await prisma.tb_utilizadores.findUnique({
      where: { codigo: parseInt(userId) },
      include: { tb_tipos_utilizador: true },
    });

    if (!user) {
      throw new AppError("Utilizador não encontrado", 404);
    }

    return convertBigIntToString(user);
  }

  static async createLegacyUser(userData) {
    try {
      // Verificar se o nome de usuário já existe
      const existingUser = await prisma.tb_utilizadores.findFirst({
        where: { user: userData.user }
      });

      if (existingUser) {
        throw new AppError("Nome de usuário já existe", 409);
      }

      // Verificar se o tipo de usuário existe
      const userType = await prisma.tb_tipos_utilizador.findUnique({
        where: { codigo: userData.codigo_Tipo_Utilizador }
      });

      if (!userType) {
        throw new AppError("Tipo de usuário não encontrado", 400);
      }

      // Criar o usuário
      const user = await prisma.tb_utilizadores.create({
        data: {
          nome: userData.nome,
          user: userData.user,
          passe: userData.passe, // Em produção, deve ser hasheada
          codigo_Tipo_Utilizador: userData.codigo_Tipo_Utilizador,
          estadoActual: userData.estadoActual || 'ATIVO',
          dataCadastro: new Date(),
          loginStatus: 'OFF'
        },
        include: {
          tb_tipos_utilizador: true
        }
      });

      return convertBigIntToString(user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Erro ao criar usuário:", error);
      throw new AppError("Erro ao criar usuário", 500);
    }
  }

  static async updateLegacyUser(userId, userData) {
    try {
      // Verificar se o usuário existe
      const existingUser = await prisma.tb_utilizadores.findUnique({
        where: { codigo: parseInt(userId) }
      });

      if (!existingUser) {
        throw new AppError("Utilizador não encontrado", 404);
      }

      // Verificar se o nome de usuário já existe (exceto para o próprio usuário)
      if (userData.user && userData.user !== existingUser.user) {
        const userWithSameUsername = await prisma.tb_utilizadores.findFirst({
          where: { 
            user: userData.user,
            codigo: { not: parseInt(userId) }
          }
        });

        if (userWithSameUsername) {
          throw new AppError("Nome de usuário já existe", 409);
        }
      }

      // Verificar se o tipo de usuário existe (se fornecido)
      if (userData.codigo_Tipo_Utilizador) {
        const userType = await prisma.tb_tipos_utilizador.findUnique({
          where: { codigo: userData.codigo_Tipo_Utilizador }
        });

        if (!userType) {
          throw new AppError("Tipo de usuário não encontrado", 400);
        }
      }

      // Preparar dados para atualização
      const updateData = {};
      if (userData.nome) updateData.nome = userData.nome;
      if (userData.user) updateData.user = userData.user;
      if (userData.passe) updateData.passe = userData.passe; // Em produção, deve ser hasheada
      if (userData.codigo_Tipo_Utilizador) updateData.codigo_Tipo_Utilizador = userData.codigo_Tipo_Utilizador;
      if (userData.estadoActual) updateData.estadoActual = userData.estadoActual;

      // Atualizar o usuário
      const user = await prisma.tb_utilizadores.update({
        where: { codigo: parseInt(userId) },
        data: updateData,
        include: {
          tb_tipos_utilizador: true
        }
      });

      return convertBigIntToString(user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Erro ao atualizar usuário:", error);
      throw new AppError("Erro ao atualizar usuário", 500);
    }
  }

  static async deleteLegacyUser(userId) {
    try {
      // Verificar se o usuário existe
      const existingUser = await prisma.tb_utilizadores.findUnique({
        where: { codigo: parseInt(userId) }
      });

      if (!existingUser) {
        throw new AppError("Utilizador não encontrado", 404);
      }

      // Verificar se o usuário tem dependências
      const [alunos, encarregados, docentes, matriculas, confirmacoes] = await Promise.all([
        prisma.tb_alunos.count({ where: { codigo_Utilizador: parseInt(userId) } }),
        prisma.tb_encarregados.count({ where: { codigo_Utilizador: parseInt(userId) } }),
        prisma.tb_docente.count({ where: { codigo_Utilizador: parseInt(userId) } }),
        prisma.tb_matriculas.count({ where: { codigo_Utilizador: parseInt(userId) } }),
        prisma.tb_confirmacoes.count({ where: { codigo_Utilizador: parseInt(userId) } })
      ]);

      const totalDependencies = alunos + encarregados + docentes + matriculas + confirmacoes;

      if (totalDependencies > 0) {
        throw new AppError(
          `Não é possível excluir o usuário. Existem ${totalDependencies} registros dependentes (alunos, encarregados, docentes, matrículas ou confirmações).`,
          409
        );
      }

      // Excluir o usuário
      await prisma.tb_utilizadores.delete({
        where: { codigo: parseInt(userId) }
      });

      return { message: "Usuário excluído com sucesso" };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Erro ao excluir usuário:", error);
      throw new AppError("Erro ao excluir usuário", 500);
    }
  }
}
