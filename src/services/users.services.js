import { getPagination, getPagingData } from "../utils/pagination.utils.js";
import { AppError } from "../utils/validation.utils.js";
import { convertBigIntToString } from "../utils/bigint.utils.js";
import bcrypt from 'bcryptjs';
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

  // ===============================
  // MÉTODOS DE ATUALIZAÇÃO
  // ===============================

  static async updateUser(userId, updateData) {
    try {
      // Verificar se o usuário existe
      const existingUser = await prisma.users.findUnique({
        where: { id: BigInt(userId) }
      });

      if (!existingUser) {
        throw new AppError("Usuário não encontrado", 404);
      }

      // Remover campos que não devem ser atualizados diretamente
      const { password, ...safeUpdateData } = updateData;

      // Verificar se email já existe (se estiver sendo alterado)
      if (safeUpdateData.email && safeUpdateData.email !== existingUser.email) {
        const emailExists = await prisma.users.findUnique({
          where: { email: safeUpdateData.email }
        });
        if (emailExists) {
          throw new AppError("Email já está em uso", 400);
        }
      }

      // Verificar se username já existe (se estiver sendo alterado)
      if (safeUpdateData.username && safeUpdateData.username !== existingUser.username) {
        const usernameExists = await prisma.users.findUnique({
          where: { username: safeUpdateData.username }
        });
        if (usernameExists) {
          throw new AppError("Username já está em uso", 400);
        }
      }

      const updatedUser = await prisma.users.update({
        where: { id: BigInt(userId) },
        data: {
          ...safeUpdateData,
          updated_at: new Date()
        }
      });

      return convertBigIntToString(updatedUser);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error("Erro ao atualizar usuário:", error);
      throw new AppError("Erro ao atualizar usuário", 500);
    }
  }

  static async updateUserLegacy(userId, updateData) {
    try {
      // Verificar se o usuário existe
      const existingUser = await prisma.tb_utilizadores.findUnique({
        where: { codigo: parseInt(userId) }
      });

      if (!existingUser) {
        throw new AppError("Utilizador não encontrado", 404);
      }

      // Remover campos que não devem ser atualizados diretamente
      const { passe, ...safeUpdateData } = updateData;

      // Verificar se username já existe (se estiver sendo alterado)
      if (safeUpdateData.user && safeUpdateData.user !== existingUser.user) {
        const userExists = await prisma.tb_utilizadores.findUnique({
          where: { user: safeUpdateData.user }
        });
        if (userExists) {
          throw new AppError("Username já está em uso", 400);
        }
      }

      const updatedUser = await prisma.tb_utilizadores.update({
        where: { codigo: parseInt(userId) },
        data: safeUpdateData,
        include: { tb_tipos_utilizador: true }
      });

      return convertBigIntToString(updatedUser);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error("Erro ao atualizar utilizador legado:", error);
      throw new AppError("Erro ao atualizar utilizador legado", 500);
    }
  }

  // ===============================
  // MÉTODOS DE MUDANÇA DE SENHA
  // ===============================

  static async changeUserPassword(userId, currentPassword, newPassword) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: BigInt(userId) }
      });

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new AppError("Senha atual incorreta", 400);
      }

      // Criptografar nova senha
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      await prisma.users.update({
        where: { id: BigInt(userId) },
        data: {
          password: hashedNewPassword,
          updated_at: new Date()
        }
      });

      return { message: "Senha alterada com sucesso" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error("Erro ao alterar senha:", error);
      throw new AppError("Erro ao alterar senha", 500);
    }
  }

  static async changeUserLegacyPassword(userId, currentPassword, newPassword) {
    try {
      const user = await prisma.tb_utilizadores.findUnique({
        where: { codigo: parseInt(userId) }
      });

      if (!user) {
        throw new AppError("Utilizador não encontrado", 404);
      }

      // Para o sistema legado, assumindo que usa MD5 (como visto no banco)
      const crypto = await import('crypto');
      const currentPasswordHash = crypto.createHash('md5').update(currentPassword).digest('hex');
      
      if (currentPasswordHash !== user.passe) {
        throw new AppError("Senha atual incorreta", 400);
      }

      // Criptografar nova senha com MD5 (mantendo compatibilidade com sistema legado)
      const hashedNewPassword = crypto.createHash('md5').update(newPassword).digest('hex');

      await prisma.tb_utilizadores.update({
        where: { codigo: parseInt(userId) },
        data: { passe: hashedNewPassword }
      });

      return { message: "Senha alterada com sucesso" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error("Erro ao alterar senha do utilizador legado:", error);
      throw new AppError("Erro ao alterar senha do utilizador legado", 500);
    }
  }

  // ===============================
  // MÉTODOS DE EXCLUSÃO
  // ===============================

  static async deleteUser(userId) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: BigInt(userId) }
      });

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      await prisma.users.delete({
        where: { id: BigInt(userId) }
      });

      return { message: "Usuário deletado com sucesso" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error("Erro ao deletar usuário:", error);
      throw new AppError("Erro ao deletar usuário", 500);
    }
  }

  static async deleteUserLegacy(userId) {
    try {
      const user = await prisma.tb_utilizadores.findUnique({
        where: { codigo: parseInt(userId) }
      });

      if (!user) {
        throw new AppError("Utilizador não encontrado", 404);
      }

      // Verificar se o usuário tem relacionamentos que impedem a exclusão
      const hasRelatedData = await this.checkUserLegacyRelations(parseInt(userId));
      
      if (hasRelatedData.hasRelations) {
        throw new AppError(
          `Não é possível deletar o utilizador. Existem registros relacionados: ${hasRelatedData.relations.join(', ')}`, 
          400
        );
      }

      await prisma.tb_utilizadores.delete({
        where: { codigo: parseInt(userId) }
      });

      return { message: "Utilizador deletado com sucesso" };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error("Erro ao deletar utilizador legado:", error);
      throw new AppError("Erro ao deletar utilizador legado", 500);
    }
  }

  // Método auxiliar para verificar relacionamentos do usuário legado
  static async checkUserLegacyRelations(userId) {
    const relations = [];
    
    try {
      // Verificar alunos
      const alunos = await prisma.tb_alunos.count({
        where: { codigo_Utilizador: userId }
      });
      if (alunos > 0) relations.push(`${alunos} aluno(s)`);

      // Verificar encarregados
      const encarregados = await prisma.tb_encarregados.count({
        where: { codigo_Utilizador: userId }
      });
      if (encarregados > 0) relations.push(`${encarregados} encarregado(s)`);

      // Verificar docentes
      const docentes = await prisma.tb_docente.count({
        where: { codigo_Utilizador: userId }
      });
      if (docentes > 0) relations.push(`${docentes} docente(s)`);

      // Verificar matrículas
      const matriculas = await prisma.tb_matriculas.count({
        where: { codigo_Utilizador: userId }
      });
      if (matriculas > 0) relations.push(`${matriculas} matrícula(s)`);

      // Verificar confirmações
      const confirmacoes = await prisma.tb_confirmacoes.count({
        where: { codigo_Utilizador: userId }
      });
      if (confirmacoes > 0) relations.push(`${confirmacoes} confirmação(ões)`);

      return {
        hasRelations: relations.length > 0,
        relations
      };
    } catch (error) {
      console.error("Erro ao verificar relacionamentos:", error);
      return { hasRelations: false, relations: [] };
    }
  }
}
