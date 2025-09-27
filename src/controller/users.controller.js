import { UsersServices } from "../services/users.services.js";
import { handleControllerError } from "../utils/validation.utils.js";

export class UsersController {
  static async getAllLegacyUsers(req, res, next) {
    try {
      await UsersServices.getAllLegacyUsers(req, res);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Erro ao obter tipos de utilizador",
        500
      );
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      await UsersServices.getAllUsers(req, res);
    } catch (error) {
      handleControllerError(
        res,
        error,
        "Erro ao obter tipos de utilizador",
        500
      );
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await UsersServices.getUserById(req.params.id);
      res.json({
        success: true,
        message: "Usuário obtido com sucesso",
        data: user,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter utilizador por ID", 500);
    }
  }

  static async getUserLegacyById(req, res) {
    try {
      const user = await UsersServices.getUserLegacyById(req.params.id);
      res.json({
        success: true,
        message: "Utilizador legado obtido com sucesso",
        data: user,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter utilizador legado", 500);
    }
  }

  // ===============================
  // CONTROLADORES DE ATUALIZAÇÃO
  // ===============================

  static async updateUser(req, res) {
    try {
      const user = await UsersServices.updateUser(req.params.id, req.body);
      res.json({
        success: true,
        message: "Usuário atualizado com sucesso",
        data: user,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar usuário", 500);
    }
  }

  static async updateUserLegacy(req, res) {
    try {
      const user = await UsersServices.updateUserLegacy(req.params.id, req.body);
      res.json({
        success: true,
        message: "Utilizador legado atualizado com sucesso",
        data: user,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar utilizador legado", 500);
    }
  }

  // ===============================
  // CONTROLADORES DE MUDANÇA DE SENHA
  // ===============================

  static async changeUserPassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await UsersServices.changeUserPassword(
        req.params.id,
        currentPassword,
        newPassword
      );
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao alterar senha", 500);
    }
  }

  static async changeUserLegacyPassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await UsersServices.changeUserLegacyPassword(
        req.params.id,
        currentPassword,
        newPassword
      );
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao alterar senha do utilizador legado", 500);
    }
  }

  // ===============================
  // CONTROLADORES DE EXCLUSÃO
  // ===============================

  static async deleteUser(req, res) {
    try {
      const result = await UsersServices.deleteUser(req.params.id);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao deletar usuário", 500);
    }
  }

  static async deleteUserLegacy(req, res) {
    try {
      const result = await UsersServices.deleteUserLegacy(req.params.id);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao deletar utilizador legado", 500);
    }
  }
}
