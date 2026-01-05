export interface User {
  id: string;

  firstName: string | null;
  lastName: string | null;
  email: string | null;

  emailVerified: boolean;

  walletBalance: number;
  plan: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
