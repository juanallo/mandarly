/**
 * API Contracts for Square UI Redesign
 * 
 * Feature: 002-square-ui-redesign
 * Date: 2026-01-19
 * 
 * Note: Most endpoints remain unchanged. This file documents
 * the enhanced dashboard response structure.
 */

import { z } from 'zod';

// ============================================
// Dashboard Stats Enhancement
// ============================================

/**
 * Trend data for a single metric
 */
export const TrendDataSchema = z.object({
  current: z.number(),
  previous: z.number(),
  change: z.number(), // Percentage change: ((current - previous) / previous) * 100
  direction: z.enum(['up', 'down', 'stable']),
});

export type TrendData = z.infer<typeof TrendDataSchema>;

/**
 * Enhanced dashboard stats response
 * 
 * GET /api/dashboard
 * 
 * Adds trend data to existing response for stats card display.
 */
export const DashboardStatsResponseSchema = z.object({
  // Existing fields (unchanged)
  totalTasks: z.number(),
  activeTasks: z.number(),
  completedToday: z.number(),
  failedToday: z.number(),
  tasksByStatus: z.record(z.string(), z.number()),
  tasksByEnvironment: z.record(z.string(), z.number()),
  recentTasks: z.array(z.any()), // TaskWithProject[]

  // NEW: Trend data for stats cards
  trends: z.object({
    totalTasks: TrendDataSchema,
    activeTasks: TrendDataSchema,
    completedToday: TrendDataSchema,
    failedToday: TrendDataSchema,
  }).optional(), // Optional for backward compatibility
});

export type DashboardStatsResponse = z.infer<typeof DashboardStatsResponseSchema>;

// ============================================
// Component Props Contracts
// ============================================

/**
 * Stats Card Component Props
 */
export const StatsCardPropsSchema = z.object({
  title: z.string(),
  value: z.number(),
  icon: z.any(), // React.ComponentType<{ className?: string }>
  trend: TrendDataSchema.optional(),
  description: z.string().optional(),
  className: z.string().optional(),
});

export type StatsCardProps = z.infer<typeof StatsCardPropsSchema>;

/**
 * Kanban Column Props
 */
export const KanbanColumnPropsSchema = z.object({
  status: z.enum(['pending', 'running', 'paused', 'completed', 'failed', 'disconnected']),
  title: z.string(),
  tasks: z.array(z.any()), // TaskWithProject[]
  count: z.number(),
  color: z.string(),
  icon: z.any(), // React.ComponentType
});

export type KanbanColumnProps = z.infer<typeof KanbanColumnPropsSchema>;

/**
 * Kanban Board Props
 */
export const KanbanBoardPropsSchema = z.object({
  tasks: z.array(z.any()), // TaskWithProject[]
  isLoading: z.boolean().optional(),
  onTaskClick: z.function().optional(),
});

export type KanbanBoardProps = z.infer<typeof KanbanBoardPropsSchema>;

/**
 * Sidebar Props
 */
export const SidebarPropsSchema = z.object({
  collapsed: z.boolean().optional(),
  onCollapsedChange: z.function().optional(),
});

export type SidebarProps = z.infer<typeof SidebarPropsSchema>;

/**
 * Breadcrumb Item
 */
export const BreadcrumbItemSchema = z.object({
  label: z.string(),
  href: z.string().optional(),
  current: z.boolean().optional(),
});

export type BreadcrumbItem = z.infer<typeof BreadcrumbItemSchema>;

/**
 * Header Props
 */
export const HeaderPropsSchema = z.object({
  title: z.string(),
  breadcrumbs: z.array(BreadcrumbItemSchema).optional(),
  actions: z.any().optional(), // React.ReactNode
});

export type HeaderProps = z.infer<typeof HeaderPropsSchema>;

// ============================================
// Status Configuration
// ============================================

/**
 * Status display configuration for kanban columns
 */
export const StatusConfigSchema = z.object({
  status: z.enum(['pending', 'running', 'paused', 'completed', 'failed', 'disconnected']),
  label: z.string(),
  color: z.string(),
  bgColor: z.string(),
  borderColor: z.string(),
  iconName: z.string(),
});

export type StatusConfig = z.infer<typeof StatusConfigSchema>;

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: {
    status: 'pending',
    label: 'Pending',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    iconName: 'Circle',
  },
  running: {
    status: 'running',
    label: 'In Progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    iconName: 'Play',
  },
  paused: {
    status: 'paused',
    label: 'Paused',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    iconName: 'Pause',
  },
  completed: {
    status: 'completed',
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    iconName: 'CheckCircle',
  },
  failed: {
    status: 'failed',
    label: 'Failed',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    iconName: 'XCircle',
  },
  disconnected: {
    status: 'disconnected',
    label: 'Disconnected',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    iconName: 'Unplug',
  },
};
