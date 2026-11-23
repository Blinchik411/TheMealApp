export interface ActiveTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  targetEndTime: number;
  isRunning: boolean;
  isAlarming: boolean;
  createdAt: number;
}
