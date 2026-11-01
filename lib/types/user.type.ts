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

export interface UserProfile {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  socialLinks: {
    instagram?: string;
    pinterest?: string;
    facebook?: string;
    x?: string;
  };
  followersCount: number;
  followingCount: number;
  totalViews: number;
  totalLikes: number;
  createdAt: string;
  publishedMediaCount: number;
  isFollowing: boolean;
}
