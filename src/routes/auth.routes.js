import express from 'express';
import { AuthController } from '../controller/auth.controller.js';
import { 
  authenticateToken, 
  verifyUserExists,
  requireModernUser,
  requireLegacyUser,
  requireAdmin,
  requireUserType,
  requireLegacyUserType
} from '../middleware/auth.middleware.js';

const router = express.Router();

// ========== ROTAS PÚBLICAS ==========
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/legacy/login', AuthController.legacyLogin);
router.get('/user-types', AuthController.getUserTypes);

// ========== ROTAS PROTEGIDAS ==========
router.use(authenticateToken); // aplica autenticação para todas rotas abaixo

router.get('/verify-token', AuthController.verifyToken);
router.get('/profile', verifyUserExists, AuthController.getProfile);
router.post('/logout', AuthController.logout);

// ========== SISTEMA MODERNO ==========
router.put('/profile', requireModernUser, verifyUserExists, AuthController.updateProfile);
router.put('/change-password', requireModernUser, verifyUserExists, AuthController.changePassword);

// ========== SISTEMA LEGADO ==========
router.post('/legacy/logout', requireLegacyUser, AuthController.legacyLogout);

// ========== ADMINISTRATIVO ==========
router.get('/admin/users', requireAdmin, AuthController.adminUsers);
router.get('/teacher/dashboard', requireUserType([2, 3]), AuthController.teacherDashboard);
router.get('/legacy/admin/dashboard', requireLegacyUser, verifyUserExists, requireLegacyUserType([1, 2]), AuthController.legacyAdminDashboard);

// ========== DEBUG ==========
if (process.env.NODE_ENV === 'development') {
  router.get('/debug/user-info', (req, res) => {
    res.json({
      success: true,
      data: {
        tokenInfo: req.user,
        isLegacy: req.user.legacy || false,
        userType: req.user.tipo,
        headers: req.headers
      }
    });
  });
}

export default router;
