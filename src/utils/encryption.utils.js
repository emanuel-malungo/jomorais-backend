import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

export const hashPassword = async (password) => {
  // Usar salt rounds menor para garantir que o hash caiba na coluna
  const saltRounds = Math.min(BCRYPT_SALT_ROUNDS, 10);
  return await bcrypt.hash(password, saltRounds);
};

export const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

