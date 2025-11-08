// /types/course.ts
export interface Topic {
  currency: string;
  title: string;
  id: string;
  name: string;
  instructor: string;
  thumbnail: string;
  rating: number;
  reviewsCount: number;
  current_price: number;
  original_price: number;
  time?: string;
  level: string;
  isBestseller?: boolean;
  updatedDate?: string;
  shortDescription?: string;
  learningPoints?: string[];
  description?: string;
  badge?: string;
  domains: string[];
  discount: number;
}

export interface TopicDetails {
  id?: string;
  name?: string;
  description?: string;
  instructor?: string;
  lastUpdated?: string;
  language?: string;
  subtitles?: string[];
  rating?: number;
  ratingCount?: number;
  studentsCount?: number;
  isBestseller?: boolean;
  domains: string[];
  time: string;
  level: string;
  relatedTopics?: string[];
}

export interface CourseHeaderDetails {
  id: string;
  title: string;
  description: string;
  instructor: string;
  language: string;
  subtitles: string[];
  rating: number;
  ratingCount: number;
  studentsCount: number;
  isBestseller: boolean;
  lastUpdated: string;
}

// Define a type for cart items
export type CartItem = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  thumbnail: string;
  duration: string;
  level: string;
  isBestseller: boolean;
};



