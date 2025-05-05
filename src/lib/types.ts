// User types
export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Note type
export interface Note {
  _id: string;
  content: string;
  createdBy: User | string;
  createdAt: string;
}

// Priority enum
export enum Priority {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

// Todo type
export interface Todo {
  _id: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  mentionedUsers: User[] | string[];
  notes: Note[];
  createdBy: User | string;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}
