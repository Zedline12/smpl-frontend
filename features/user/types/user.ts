export interface User {
  id: string;

  firstName: string | null;
  lastName: string | null;
  email: string | null;
  username?: string;

  emailVerified: boolean;

  creditsBalance: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
