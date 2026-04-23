import type { IconifyName } from '@shared/ui';

export type IPostItem = {
  id: string;
  title: string;
  coverUrl: string;
  totalViews: number;
  description: string;
  totalShares: number;
  totalComments: number;
  totalFavorites: number;
  postedAt: string | number | null;
  author: {
    name: string;
    avatarUrl: string;
  };
  favoritePerson?: Array<{
    name: string;
    avatarUrl: string;
  }>;
  shareLinks?: {
    facebook?: IconifyName;
    instagram?: IconifyName;
    linkedin?: IconifyName;
    twitter?: IconifyName;
  };
};
