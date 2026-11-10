// ==========================================
// 1. Canonical Domain Contracts (PROJECT.md)
// ==========================================

export type QueueChannel = 'VEHICLE' | 'WALK_IN';

export type QueueStatus =
  | 'REGISTERED'
  | 'MOVING'
  | 'ARRIVED'
  | 'CALLED'
  | 'SEATED'
  | 'NO_SHOW'
  | 'CANCELLED';

export type AlightingStatus = 'NONE' | 'PARTIAL' | 'CONFIRMED';

export interface AlightingTelemetry {
  status: AlightingStatus;
  alightedCount: number;
  totalPassengers: number;
  lastSensorTime?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
}

export interface WaitingTeam {
  id: string;
  ticketNumber: number;
  customerName: string;
  phone: string;
  partySize: number;
  channel: QueueChannel;
  status: QueueStatus;
  vehicleModel?: string;
  vehicleNumber?: string;
  etaMinutes: number;
  distanceMeters?: number;
  alighting: AlightingTelemetry;
  registeredAt: string;
  calledAt?: string;
  seatedAt?: string;
  timeline: TimelineEvent[];
}

export interface PosSummary {
  totalTeams: number;
  vehicleTeams: number;
  walkInTeams: number;
  estimatedWaitMinutes: number;
}

// ==========================================
// 2. UI Layout & Navigation Types
// ==========================================

export type QueueFilterTab = 'ALL' | 'MOVING' | 'ARRIVED' | 'CALLED';

export type RightPanelMode = 'NONE' | 'DETAIL' | 'DEMO';

// ==========================================
// 3. Store & Configuration Types
// ==========================================

export interface StoreSettings {
  minutesPerTeam: number;
  arrivalBufferMin: number;
  manualWaitMin: number | null;
}

export interface StoreInfo {
  id: string;
  name: string;
  category: string;
  settings: StoreSettings;
}

// ==========================================
// 4. Backward Compatibility Bridges
// ==========================================

export type WaitingStatus = QueueStatus;
export type WaitingChannel = QueueChannel;
export type ArrivalCheckResult = 'CONFIRMED' | 'MANUAL' | 'UNCONFIRMED';

export interface WaitingItem {
  id: string;
  ticketNo: number;
  customerName?: string;
  phone?: string;
  partySize: number;
  status: WaitingStatus;
  position: number;
  etaMin: number;
  channel: WaitingChannel;
  arrivalResult?: ArrivalCheckResult | null;
  alighted?: number | null;
  vehicleModel?: string;
  vehicleNumber?: string;
  registeredAt: string;
  calledAt?: string | null;
  seatedAt?: string | null;
  timeline?: TimelineEvent[];
  alighting?: AlightingTelemetry;
}

export interface PosQueueResponse {
  store: StoreInfo;
  queue: WaitingItem[];
  aheadTeams: number;
  estimatedWaitMin: number;
}
