export interface Machine {
  id: number;
  machine_id: string;
  name: string;
  type: string;
  location: string;
  manufacturer?: string;
  model?: string;
  installation_date?: string;
  operating_hours: number;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  current_health?: 'Healthy' | 'Warning' | 'Critical';
  last_prediction_date?: string;
}

export interface MachineListResponse {
  total: number;
  items: Machine[];
}

export interface RuleViolation {
  parameter: string;
  observed_value: number;
  threshold: number;
  severity: 'Warning' | 'Critical';
  message: string;
}

export interface MLPredictionResult {
  prediction: 'Healthy' | 'Warning' | 'Critical';
  confidence: number;
  probabilities: Record<string, number>;
}

export interface RulePredictionResult {
  prediction: 'Healthy' | 'Warning' | 'Critical';
  violations: RuleViolation[];
}

export interface AnomalyPredictionResult {
  prediction: 'Normal' | 'Anomaly';
  anomaly_score: number;
  is_anomaly: boolean;
}

export interface PredictionResponse {
  id?: number;
  machine_id: string;
  overall_status: 'Healthy' | 'Warning' | 'Critical';
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  ml_result: MLPredictionResult;
  rule_result: RulePredictionResult;
  anomaly_result: AnomalyPredictionResult;
  detected_factors: string[];
  explanation: string;
  recommended_action: string;
  input_features: Record<string, number>;
  created_at: string;
}

export interface PredictionHistoryItem {
  id: number;
  machine_id: string;
  ml_prediction: string;
  ml_confidence: number;
  rule_prediction: string;
  rule_violations: RuleViolation[];
  anomaly_prediction: string;
  anomaly_score: number;
  overall_status: 'Healthy' | 'Warning' | 'Critical';
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  explanation: string;
  recommended_action: string;
  input_features: Record<string, number>;
  created_at: string;
}

export interface PredictionHistoryResponse {
  total: number;
  items: PredictionHistoryItem[];
}

export interface DashboardStats {
  total_machines: number;
  healthy_machines: number;
  warning_machines: number;
  critical_machines: number;
  inactive_machines: number;
  anomalies_detected_today: number;
  predictions_today: number;
  fleet_health_score: number;
}

export interface MaintenanceAlert {
  machine_id: string;
  machine_name: string;
  machine_type: string;
  location: string;
  status: 'Healthy' | 'Warning' | 'Critical';
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  primary_issue: string;
  last_prediction_date: string;
}

export interface FleetAnalyticsOverview {
  health_distribution: {
    healthy: number;
    warning: number;
    critical: number;
    inactive: number;
  };
  top_at_risk_machines: MaintenanceAlert[];
  recent_predictions: PredictionHistoryItem[];
  fleet_health_score: number;
  total_sensor_readings: number;
}

export interface SensorTrendPoint {
  recorded_at: string;
  temperature: number;
  vibration: number;
  pressure: number;
  voltage: number;
  current: number;
  rpm: number;
  operating_hours: number;
}
