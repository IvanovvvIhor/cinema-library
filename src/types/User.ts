export type Gender = 'Male' | 'Female' | 'Other';

export interface User {
  rank: string;
  xp: number;
  level: number;
  id: string;
  username: string;
  email: string;
  password?: string;
  age: number;
  avatar: string;
  gender: Gender;
}