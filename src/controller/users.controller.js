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
}
