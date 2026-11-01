export interface User {
  id: string;

  firstName: string | null;
  lastName: string | null;
  email: string | null;
  username?: string;

  emailVerified: boolean;

  creditsBalance: number;
  plan: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
