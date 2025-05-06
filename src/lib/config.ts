// API configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://dy-backend.codeindia.tech/api";

// API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USERS: `${API_BASE_URL}/users`,
  USER: (id: string) => `${API_BASE_URL}/users/${id}`,

  // Todo endpoints
  TODOS: `${API_BASE_URL}/todos`,
  TODO: (id: string) => `${API_BASE_URL}/todos/${id}`,
  TODO_NOTES: (id: string) => `${API_BASE_URL}/todos/${id}/notes`,
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;

// Priority options
export const PRIORITY_OPTIONS = [
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];
