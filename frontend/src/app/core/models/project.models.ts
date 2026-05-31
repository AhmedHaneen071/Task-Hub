import { UserSummary } from './auth.models';

export type ProjectStatusName = 'Planning' | 'Active' | 'Blocked' | 'Completed';
export type ProjectPriorityName = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatusName = 'ToDo' | 'InProgress' | 'Review' | 'Done';

export enum ProjectStatusValue {
  Planning = 1,
  Active = 2,
  Blocked = 3,
  Completed = 4
}

export enum ProjectPriorityValue {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

export enum TaskStatusValue {
  ToDo = 1,
  InProgress = 2,
  Review = 3,
  Done = 4
}

export interface Category {
  id: number;
  name: string;
  color: string;
  description: string | null;
  projectCount: number;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatusName;
  priority: ProjectPriorityName;
  dueDate: string | null;
  createdAt: string;
  ownerId: number;
  ownerName: string;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  taskCount: number;
  completedTaskCount: number;
}

export interface ActivityItem {
  id: number;
  message: string;
  createdAt: string;
  userName: string;
}

export interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  status: ProjectStatusName;
  priority: ProjectPriorityName;
  dueDate: string | null;
  createdAt: string;
  owner: UserSummary;
  category: Category;
  tasks: TaskItem[];
  activities: ActivityItem[];
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: TaskStatusName;
  dueDate: string | null;
  createdAt: string;
  projectId: number;
  projectName: string;
  assigneeId: number | null;
  assigneeName: string | null;
  commentCount: number;
}

export interface CommentItem {
  id: number;
  message: string;
  createdAt: string;
  taskId: number;
  taskTitle: string;
  authorId: number;
  authorName: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
  description: string | null;
}

export type UpdateCategoryRequest = CreateCategoryRequest;

export interface CreateProjectRequest {
  name: string;
  description: string;
  status: ProjectStatusValue;
  priority: ProjectPriorityValue;
  dueDate: string | null;
  categoryId: number;
  ownerId: number | null;
}

export type UpdateProjectRequest = CreateProjectRequest;

export interface CreateTaskRequest {
  title: string;
  description: string;
  status: TaskStatusValue;
  dueDate: string | null;
  projectId: number;
  assigneeId: number | null;
}

export type UpdateTaskRequest = CreateTaskRequest;

export interface CreateCommentRequest {
  message: string;
  taskId: number;
  authorId: number | null;
}

export interface UpdateCommentRequest {
  message: string;
}

export interface DashboardData {
  totalProjects: number;
  activeProjects: number;
  openTasks: number;
  completedTasks: number;
  priorityProjects: Project[];
  myTasks: TaskItem[];
  recentActivity: ActivityItem[];
}
