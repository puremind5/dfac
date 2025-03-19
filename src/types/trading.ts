export type Time = string | number;

export interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type PredictionType = 'UP' | 'DOWN' | null; 