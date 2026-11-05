export interface User {
  id?: number | string;
  login: string;
  email: string;
  nom: string;
  prenom: string;
  role?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSignUp {
  login: string;
  email: string;
  nom: string;
  prenom: string;
  password: string;
  role?: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  user?: User;
  id?: number | string;
  [key: string]: any;
}
