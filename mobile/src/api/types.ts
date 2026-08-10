export type Role = 'staff' | 'buyer' | 'admin';
export type AccountStatus = 'active' | 'blocked';
export type ShoppingStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type PresenceStatus = 'present' | 'absent' | 'late' | 'sick';
export type VacationType = 'vacation' | 'sick' | 'unpaid' | 'other';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  birthDate?: string | null;
  startWorkDate?: string | null;
  role: Role;
  accountStatus: AccountStatus;
}

export interface ShoppingItem {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  quantity: number;
  unit: string;
  price?: number | null;
  plannedOn: string;
  status: ShoppingStatus;
  createdById: string;
  createdBy?: { id: string; firstName: string; lastName: string };
  updatedBy?: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  htmlContent: string;
  publishedAt: string;
}

export interface Presence {
  id: string;
  userId: string;
  date: string;
  status: PresenceStatus;
  notes?: string | null;
  user?: { id: string; firstName: string; lastName: string };
}

export interface Vacation {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  type: VacationType;
  status: string;
  user?: { id: string; firstName: string; lastName: string };
}
