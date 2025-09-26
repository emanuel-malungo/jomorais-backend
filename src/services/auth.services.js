// services/auth.service.js
import prisma from '../config/database.js';
import { hashPassword, comparePasswords } from '../utils/encryption.utils.js';
import { generateToken } from '../utils/token.utils.js';
import { AppError } from '../utils/validation.utils.js';

// Seleção padrão de campos para evitar repetição
const userSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  tipo: true,
  foto: true,
  created_at: true,
  updated_at: true
};

export class AuthService {
  // ===============================
  // SISTEMA MODERNO (users)
  // ===============================

  // Registro de novo usuário
  static async registerUser(userData) {
    let { name, username, email, password, tipo } = userData;

    // Sanitização
    name = name.trim();
    username = username.trim();
    email = email.trim().toLowerCase();

    // Verificar se email OU username já existem (em uma única query)
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError('Email já está em uso', 409);
      }
      if (existingUser.username === username) {
        throw new AppError('Username já está em uso', 409);
      }
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const user = await prisma.users.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        tipo,
        created_at: new Date(),
        updated_at: new Date()
      },
      select: userSelect
    });

    return user;
  }

  // Login de usuário
  static async loginUser(loginData) {
    const { login, password } = loginData;

    // Buscar usuário por email ou username
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: login.trim().toLowerCase() },
          { username: login.trim() }
        ]
      }
    });

    if (!user) throw new AppError('Credenciais inválidas', 401);

    // Verificar senha
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) throw new AppError('Credenciais inválidas', 401);

    // Gerar token
    const token = generateToken({
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      tipo: user.tipo
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        tipo: user.tipo,
        foto: user.foto
      },
      token
    };
  }

  // ===============================
  // SISTEMA LEGADO (tb_utilizadores)
  // ===============================

  static async loginLegacyUser(loginData) {
    const { user: username, passe } = loginData;

    const user = await prisma.tb_utilizadores.findFirst({
      where: { user: username.trim() },
      include: { tb_tipos_utilizador: true }
    });

    if (!user) throw new AppError('Credenciais inválidas', 401);

    // Verificar se a senha é hash ou texto plano
    let isPasswordValid = false;
    try {
      isPasswordValid = await comparePasswords(passe, user.passe);
    } catch {
      isPasswordValid = passe === user.passe;
    }

    if (!isPasswordValid) throw new AppError('Credenciais inválidas', 401);

    await prisma.tb_utilizadores.update({
      where: { codigo: user.codigo },
      data: { loginStatus: 'ON' }
    });

    const token = generateToken({
      id: user.codigo.toString(),
      username: user.user,
      nome: user.nome,
      tipo: user.codigo_Tipo_Utilizador,
      tipoDesignacao: user.tb_tipos_utilizador.designacao,
      legacy: true
    });

    return {
      user: {
        id: user.codigo,
        nome: user.nome,
        username: user.user,
        tipo: user.codigo_Tipo_Utilizador,
        tipoDesignacao: user.tb_tipos_utilizador.designacao,
        estadoActual: user.estadoActual,
        dataCadastro: user.dataCadastro,
        legacy: true
      },
      token
    };
  }

  static async logoutLegacyUser(userId) {
    await prisma.tb_utilizadores.update({
      where: { codigo: parseInt(userId) },
      data: { loginStatus: 'OFF' }
    });
  }

  // ===============================
  // OPERAÇÕES GERAIS
  // ===============================

  static async getUserById(userId) {
    const id = BigInt(userId);

    const user = await prisma.users.findUnique({
      where: { id },
      select: userSelect
    });

    if (!user) throw new AppError('Usuário não encontrado', 404);
    return user;
  }

  static async getLegacyUserById(userId) {
    const user = await prisma.tb_utilizadores.findUnique({
      where: { codigo: parseInt(userId) },
      include: { tb_tipos_utilizador: true }
    });

    if (!user) throw new AppError('Usuário não encontrado', 404);

    return {
      id: user.codigo,
      nome: user.nome,
      username: user.user,
      tipo: user.codigo_Tipo_Utilizador,
      tipoDesignacao: user.tb_tipos_utilizador.designacao,
      estadoActual: user.estadoActual,
      dataCadastro: user.dataCadastro,
      loginStatus: user.loginStatus,
      legacy: true
    };
  }

  static async updateUserProfile(userId, updateData) {
    const { name, email, foto } = updateData;
    const id = BigInt(userId);

    if (email) {
      const existingUser = await prisma.users.findFirst({
        where: { email, NOT: { id } }
      });
      if (existingUser) throw new AppError('Email já está em uso', 409);
    }

    const user = await prisma.users.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim().toLowerCase() }),
        ...(foto && { foto: foto.trim() }),
        updated_at: new Date()
      },
      select: userSelect
    });

    return user;
  }

  static async changePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;
    const id = BigInt(userId);

    const user = await prisma.users.findUnique({ where: { id } });
    if (!user) throw new AppError('Usuário não encontrado', 404);

    const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);
    if (!isCurrentPasswordValid) throw new AppError('Senha atual incorreta', 401);

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.users.update({
      where: { id },
      data: {
        password: hashedNewPassword,
        updated_at: new Date()
      }
    });

    return { message: 'Senha alterada com sucesso' };
  }

  static async getUserTypes() {
    return await prisma.tb_tipos_utilizador.findMany({
      orderBy: { designacao: 'asc' }
    });
  }
}
