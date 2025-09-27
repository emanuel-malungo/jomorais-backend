import { getPagination, getPagingData } from "../utils/pagination.utils.js";
import { AppError } from "../utils/validation.utils.js";
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

      res.json({
        success: true,
        message: "Lista de usuários legados obtida com sucesso",
        meta: getPagingData(totalItems, page, take),
        data: users,
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
        include: {
          profile: true,
          posts: true,
        },
        orderBy: { created_at: "desc" },
      });

      res.json({
        success: true,
        message: "Lista de usuários obtida com sucesso",
        meta: getPagingData(totalItems, page, take),
        data: users,
      });
    } catch (error) {
      console.error("Erro ao obter usuários:", error);
      throw new AppError("Erro ao obter usuários", 500);
    }
  }

}

