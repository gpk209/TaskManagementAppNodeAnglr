/**
 * Data Transfer Objects for Tasks
 * Separates API contract from internal entities
 */

// ============================================
// REQUEST DTOs
// ============================================

export interface CreateTaskRequestDto {
  title: string;
  description?: string;
  status?: number;
  priority?: number;
  dueDate?: string;
}

export interface UpdateTaskRequestDto {
  title?: string;
  description?: string;
  status?: number;
  priority?: number;
  dueDate?: string;
}

export interface TaskFilterRequestDto {
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: 'dueDate' | 'priority' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface TaskResponseDto {
  id: string;
  title: string;
  description: string;
  status: number;
  priority: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListResponseDto {
  success: boolean;
  data: TaskResponseDto[];
  count: number;
}

export interface TaskSingleResponseDto {
  success: boolean;
  data: TaskResponseDto;
}

export interface TaskDeleteResponseDto {
  success: boolean;
  message: string;
}
