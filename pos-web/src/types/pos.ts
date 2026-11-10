export type WaitingStatus = 'REGISTERED' | 'ARRIVED' | 'CALLED' | 'SEATED' | 'NO_SHOW' | 'CANCELLED';

export type ArrivalCheckResult = 'CONFIRMED' | 'MANUAL' | 'UNCONFIRMED';

export type WaitingChannel = 'VEHICLE' | 'WALK_IN';

export interface WaitingItem {
  id: string;
  ticketNo: number;
  partySize: number;
  status: WaitingStatus;
  position: number;
  etaMin: number;
  channel: WaitingChannel;
  arrivalResult?: ArrivalCheckResult | null;
  alighted?: number | null;
  registeredAt: string;
  calledAt?: string | null;
}

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

export interface PosQueueResponse {
  store: StoreInfo;
  queue: WaitingItem[];
  aheadTeams: number;
  estimatedWaitMin: number;
}
