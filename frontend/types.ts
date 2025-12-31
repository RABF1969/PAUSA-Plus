
export type TenantId = string;

export enum EventStatus {
  NORMAL = 'normal',
  ABOVE_RECOMMENDED = 'above_recommended',
  ABOVE_MAXIMUM = 'above_maximum'
}

export enum PauseTypeCategory {
  BATHROOM = 'WC',
  SNACK = 'Lanche',
  REST = 'Descanso',
  CUSTOMER_SERVICE = 'Atendimento',
  OTHER = 'Outro'
}

export interface PauseType {
  id: string;
  name: string;
  category: PauseTypeCategory;
  recommendedMinutes: number;
  maxMinutes: number;
  isConcurrent: boolean; // Se verdadeiro, apenas N pessoas podem usar por vez
  capacity: number;
  icon: string; // Novo campo para ícone do Material Symbols
}

export interface Employee {
  id: string;
  registration: string;
  name: string;
  sectorId: string;
  role: string;
  pin: string;
  avatar?: string;
}

export interface PauseEvent {
  id: string;
  employeeId: string;
  pauseTypeId: string;
  startTime: Date;
  endTime?: Date;
  status: EventStatus;
  notes?: string;
  closedBy?: 'employee' | 'manager';
}

export interface DashboardStats {
  freeSlots: number;
  totalSlots: number;
  activePauses: number;
  averageTimeToday: string;
  efficiency: number;
}
