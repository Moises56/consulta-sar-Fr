export type UserRole = 'ADMIN' | 'OPERADOR';

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  role: string;
  name: string;
  identidad: string;
  Nempleado: string;
  gerencia: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserDTO extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateUserDTO extends Partial<CreateUserDTO> {
  currentPassword?: string;
  newPassword?: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  message: string;
}
