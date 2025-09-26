import { 
    registerSchema, loginSchema, legacyLoginSchema,
    updateProfileSchema, changePasswordSchema 
} from "../validations/auth.validations.js";

import { AuthService } from "../services/auth.services.js";
export { handleControllerError } from "../utils/validation.utils.js";

export class AuthController {
  static async register(req, res) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const user = await AuthService.registerUser(validatedData);

      res.status(201).json({
        success: true,
        message: "Usuário registrado com sucesso",
        data: user
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
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao fazer login", 401);
    }
  }

  static async legacyLogin(req, res) {
    try {
      const validatedData = legacyLoginSchema.parse(req.body);
      const result = await AuthService.loginLegacyUser(validatedData);

      res.json({
        success: true,
        message: "Login realizado com sucesso",
        data: result
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao fazer login legado", 401);
    }
  }

  static async logout(req, res) {
    try {
      if (req.user?.legacy) {
        await AuthService.logoutLegacyUser(req.user.id);
      }

      res.json({
        success: true,
        message: "Logout realizado com sucesso"
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao fazer logout", 500);
    }
  }

  static async getProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Usuário não autenticado" });
      }

      const user = req.user.legacy
        ? await AuthService.getLegacyUserById(req.user.id)
        : await AuthService.getUserById(req.user.id);

      res.json({ success: true, data: user });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter perfil", 404);
    }
  }

  static async updateProfile(req, res) {
    try {
      const validatedData = updateProfileSchema.parse(req.body);

      if (req.user?.legacy) {
        return res.status(403).json({
          success: false,
          message: "Usuários do sistema legado não podem atualizar perfil"
        });
      }

      const user = await AuthService.updateUserProfile(req.user.id, validatedData);

      res.json({
        success: true,
        message: "Perfil atualizado com sucesso",
        data: user
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao atualizar perfil", 400);
    }
  }

  static async changePassword(req, res) {
    try {
      const validatedData = changePasswordSchema.parse(req.body);

      if (req.user?.legacy) {
        return res.status(403).json({
          success: false,
          message: "Usuários do sistema legado não podem alterar senha"
        });
      }

      const result = await AuthService.changePassword(req.user.id, validatedData);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao alterar senha", 400);
    }
  }

  static async verifyToken(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Token inválido" });
      }

      res.json({
        success: true,
        message: "Token válido",
        data: { user: req.user }
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao verificar token", 401);
    }
  }

  static async getUserTypes(req, res) {
    try {
      const types = await AuthService.getUserTypes();
      res.json({ success: true, data: types });
    } catch (error) {
      handleControllerError(res, error, "Erro ao obter tipos de utilizador", 500);
    }
  }

  // Métodos adicionais para as rotas
  static async legacyLogout(req, res) {
    try {
      if (!req.user?.legacy) {
        return res.status(400).json({
          success: false,
          message: "Esta rota é apenas para usuários do sistema legado"
        });
      }

      await AuthService.logoutLegacyUser(req.user.id);

      res.json({
        success: true,
        message: "Logout realizado com sucesso"
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao fazer logout", 500);
    }
  }

  static async adminUsers(req, res) {
    try {
      res.json({
        success: true,
        message: "Acesso administrativo concedido",
        data: {
          user: req.user,
          message: "Esta é uma rota administrativa para listar usuários"
        }
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao acessar área administrativa", 500);
    }
  }

  static async teacherDashboard(req, res) {
    try {
      res.json({
        success: true,
        message: "Dashboard do professor",
        data: {
          user: req.user,
          features: ["turmas", "alunos", "notas", "frequencia"]
        }
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao acessar dashboard do professor", 500);
    }
  }

  static async legacyAdminDashboard(req, res) {
    try {
      res.json({
        success: true,
        message: "Dashboard administrativo legado",
        data: {
          user: req.user,
          userProfile: req.userProfile,
          features: ["gestao_utilizadores", "relatorios", "configuracoes"]
        }
      });
    } catch (error) {
      handleControllerError(res, error, "Erro ao acessar dashboard administrativo", 500);
    }
  }
}
