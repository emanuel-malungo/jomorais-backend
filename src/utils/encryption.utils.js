import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || 12;

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  return await bcrypt.hash(password, salt);
};

export const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

