import {
  registerSchema,
  loginSchema,
  legacyRegisterSchema,
  legacyLoginSchema,
} from "../validations/auth.validations.js";

import { AuthService } from "../services/auth.services.js";
import { handleControllerError } from "../utils/validation.utils.js";

export class AuthController {

  static async register(req, res) {
    try {
      console.log("Dados recebidos no controller:", req.body);
      const validatedData = registerSchema.parse(req.body);
      console.log("Dados validados no controller:", validatedData);
      const user = await AuthService.registerUser(validatedData);

      res.status(201).json({
        success: true,
        message: "Usuário registrado com sucesso",
        data: user,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao registrar usuário", 400);
    }
  }

  static async login(req, res) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.loginUser(validatedData);

      res.json({
        success: true,
        message: "Login realizado com sucesso",
        data: result,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao fazer login", 401);
    }
  }

  static async legacyRegister(req, res) {
    try {
      console.log("Dados recebidos no controller legado:", req.body);
      const validatedData = legacyRegisterSchema.parse(req.body);
      console.log("Dados validados no controller legado:", validatedData);
      const user = await AuthService.registerLegacyUser(validatedData);

      res.status(201).json({
        success: true,
        message: "Utilizador registrado com sucesso",
        data: user,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao registrar utilizador", 400);
    }
  }

  static async legacyLogin(req, res) {
    try {
      const validatedData = legacyLoginSchema.parse(req.body);
      const result = await AuthService.loginLegacyUser(validatedData);

      res.json({
        success: true,
        message: "Login realizado com sucesso",
        data: result,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao fazer login", 401);
    }
  }

  static async updateProfile(req, res) {
    try {
      const validatedData = updateProfileSchema.parse(req.body);

      if (req.user?.legacy) {
        return res.status(403).json({
          success: false,
          message: "Usuários do sistema legado não podem atualizar perfil",
        });
      }

      const user = await AuthService.updateUserProfile(
        req.user.id,
        validatedData
      );

      res.json({
        success: true,
        message: "Perfil atualizado com sucesso",
        data: user,
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar perfil", 400);
    }
  }

  static async getUserTypes(req, res) {
    try {
      const types = await AuthService.getUserTypes();
      res.json({ success: true, data: types });
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
