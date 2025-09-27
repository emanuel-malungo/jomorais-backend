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
}
