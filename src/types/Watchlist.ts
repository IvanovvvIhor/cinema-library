export interface WatchlistMovie {
  id: number;
  title: string;
  year: number;
  rating: number;
  posterUrl: string | null;
  runtime: number;
  genres: string[]; 
  addedAt: number; 
}

export type ListVisibility = 'Private' | 'Public';

export interface Watchlist {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  coverUrl: string | null;
  visibility: ListVisibility;
  isDefault: boolean; 
  movies: WatchlistMovie[];
  stats: {
    views: number;
    likes: number;
    dislikes: number;
  };
  createdAt: number;
}