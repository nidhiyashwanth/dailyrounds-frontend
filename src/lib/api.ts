"use client";

import { API_ENDPOINTS } from "@/lib/config";
import { ApiResponse, PaginatedResponse, Todo, User } from "@/lib/types";

// Generic fetch function with error handling
async function fetchAPI<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "An error occurred");
  }

  return response.json();
}

// User API functions
export async function getUsers(): Promise<ApiResponse<User[]>> {
  return fetchAPI<ApiResponse<User[]>>(API_ENDPOINTS.USERS);
}

export async function getUser(id: string): Promise<ApiResponse<User>> {
  return fetchAPI<ApiResponse<User>>(API_ENDPOINTS.USER(id));
}

export async function createUser(
  userData: Partial<User>
): Promise<ApiResponse<User>> {
  return fetchAPI<ApiResponse<User>>(API_ENDPOINTS.USERS, {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// Todo API functions
export async function getTodos(
  page = 1,
  limit = 10,
  filters: Record<string, string> = {}
): Promise<PaginatedResponse<Todo>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  return fetchAPI<PaginatedResponse<Todo>>(
    `${API_ENDPOINTS.TODOS}?${params.toString()}`
  );
}

export async function getTodo(id: string): Promise<ApiResponse<Todo>> {
  return fetchAPI<ApiResponse<Todo>>(API_ENDPOINTS.TODO(id));
}

export async function createTodo(
  todoData: Partial<Todo>
): Promise<ApiResponse<Todo>> {
  return fetchAPI<ApiResponse<Todo>>(API_ENDPOINTS.TODOS, {
    method: "POST",
    body: JSON.stringify(todoData),
  });
}

export async function updateTodo(
  id: string,
  todoData: Partial<Todo>
): Promise<ApiResponse<Todo>> {
  return fetchAPI<ApiResponse<Todo>>(API_ENDPOINTS.TODO(id), {
    method: "PUT",
    body: JSON.stringify(todoData),
  });
}

export async function deleteTodo(id: string): Promise<ApiResponse<{}>> {
  return fetchAPI<ApiResponse<{}>>(API_ENDPOINTS.TODO(id), {
    method: "DELETE",
  });
}

// Notes API functions
export async function getTodoNotes(todoId: string): Promise<ApiResponse<Todo>> {
  return fetchAPI<ApiResponse<Todo>>(API_ENDPOINTS.TODO_NOTES(todoId));
}

export async function addTodoNote(
  todoId: string,
  content: string,
  createdBy: string
): Promise<ApiResponse<Todo>> {
  return fetchAPI<ApiResponse<Todo>>(API_ENDPOINTS.TODO_NOTES(todoId), {
    method: "POST",
    body: JSON.stringify({ content, createdBy }),
  });
}
