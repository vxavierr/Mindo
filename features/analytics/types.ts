export type ObesityLevel = 'healthy' | 'warning' | 'critical';

export interface UserMetrics {
  confidenceScore: number;
  knowledgeEntropy: number;
  synapticVelocity: number;
  streakDays: number;
  totalNodes: number;
  totalConnections: number;
  hoursThisWeek: number;
}

export interface RadarDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}
