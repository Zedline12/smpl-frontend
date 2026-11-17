export const PRODUCT_MAX_IMAGES = 10;

/** A user's product: a name and its photos, sent to the ads model as references. */
export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  createdAt?: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  images: string[];
}

/** One of our preset avatars (isPreset) or one the user uploaded. */
export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  isPreset: boolean;
}

/** A preset as the admin sees it. */
export interface AdminAvatar {
  id: string;
  name: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface AvatarInput {
  name: string;
  imageUrl: string;
}
