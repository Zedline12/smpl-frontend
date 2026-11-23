export interface User {
  id: string;

  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  username?: string;
  email: string | null;

  emailVerified: boolean;

  creditsBalance: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
