// services/auth.service.js
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken } from '../utils/token.utils.js';
import { AppError } from '../utils/validation.utils.js';
import { convertBigIntToString } from '../utils/bigint.utils.js';
import { hashPassword, comparePasswords } from '../utils/encryption.utils.js';

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
    let { name, email, password, tipo, username } = userData;

    // Sanitização
    name = name.trim();
    email = email.trim().toLowerCase();
    password = password.trim();
    tipo = tipo || 2;

    // Gerar username se não fornecido
    if (!username) {
      // Criar username baseado no email (parte antes do @)
      username = email.split('@')[0].toLowerCase();
      
      // Verificar se username já existe e adicionar número se necessário
      let baseUsername = username;
      let counter = 1;
      while (await prisma.users.findFirst({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
    } else {
      username = username.trim().toLowerCase();
    }

    // Verificar se email ou username já existem (em uma única query)
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
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
      },
      select: userSelect
    });

    // Converter BigInt para string para serialização JSON
    return convertBigIntToString(user);
  }

  // Login de usuário
  static async loginUser(loginData) {
    const { login, password } = loginData;

    // Buscar usuário por email ou username
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: login.trim().toLowerCase() },
          { username: login.trim().toLowerCase() },
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
      user: convertBigIntToString({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        tipo: user.tipo,
        foto: user.foto
      }),
      token
    };
  }

  // ===============================
  // SISTEMA LEGADO (tb_utilizadores)
  // ===============================

  // Registro de usuário legado
  static async registerLegacyUser(userData) {
    let { nome, user: username, passe, codigo_Tipo_Utilizador, estadoActual } = userData;

    // Sanitização com verificação de existência
    nome = nome?.trim() || '';
    username = username?.trim()?.toLowerCase() || '';
    passe = passe?.trim() || '';
    codigo_Tipo_Utilizador = codigo_Tipo_Utilizador || 2;
    estadoActual = estadoActual?.trim() || "Activo";

    // Validações básicas
    if (!nome) throw new AppError('Nome é obrigatório', 400);
    if (!username) throw new AppError('Username é obrigatório', 400);
    if (!passe) throw new AppError('Senha é obrigatória', 400);

    // Verificar se username já existe
    const existingUser = await prisma.tb_utilizadores.findFirst({
      where: { user: username }
    });

    if (existingUser) {
      throw new AppError('Username já está em uso', 409);
    }

    // Verificar se o tipo de utilizador existe
    const tipoUtilizador = await prisma.tb_tipos_utilizador.findUnique({
      where: { codigo: codigo_Tipo_Utilizador }
    });

    if (!tipoUtilizador) {
      throw new AppError('Tipo de utilizador inválido', 400);
    }

    // Hash da senha
    const hashedPassword = await hashPassword(passe);

    // Criar usuário legado
    const user = await prisma.tb_utilizadores.create({
      data: {
        nome,
        user: username,
        passe: hashedPassword,
        codigo_Tipo_Utilizador,
        estadoActual,
        dataCadastro: new Date(),
        loginStatus: 'OFF'
      },
      include: { tb_tipos_utilizador: true }
    });

    return {
      id: user.codigo,
      nome: user.nome,
      username: user.user,
      tipo: user.codigo_Tipo_Utilizador,
      tipoDesignacao: user.tb_tipos_utilizador.designacao,
      estadoActual: user.estadoActual,
      dataCadastro: user.dataCadastro,
      legacy: true
    };
  }

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

  static async getUserTypes() {
    return await prisma.tb_tipos_utilizador.findMany({
      orderBy: { designacao: 'asc' }
    });
  }
}
