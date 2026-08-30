import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema } from '../validations/auth';
import {
  createUser,
  getUserByEmail,
} from '../repositories/user.repository';

export async function registerUser(input: unknown) {
  const data = registerSchema.parse(input);

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await createUser({
    email: data.email,
    username: data.username,
    name: data.name,
    passwordHash,
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
  };
}

export async function verifyPassword(
  password: string,
  passwordHash: string
) {
  return bcrypt.compare(password, passwordHash);
}

export async function loginUser(input: unknown) {
  const data = loginSchema.parse(input);

  const user = await getUserByEmail(data.email);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const passwordValid = await verifyPassword(
    data.password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new Error('Invalid email or password');
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
  };
}