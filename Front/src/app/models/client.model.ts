export interface ClientSignUp {
  login: string;
  email: string;
  nom: string;
  prenom: string;
  password: string;
}

export interface ClientResponse {
  success: boolean;
  message: string;
  user?: {
    id?: string | number;
    login: string;
    email: string;
    nom: string;
    prenom: string;
    createdAt?: string;
  };
  [key: string]: any;
}
