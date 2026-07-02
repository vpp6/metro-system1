import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface IncidentType {
  type_name: string;
}

export interface IncidentDetection {
  discovered_by?: string;
  first_reporter?: string;
  detection_time?: string;
  occ_notification_time?: string;
  occ_response_time?: string;
  emergency_code?: string;
  permit_number?: string;
}

export interface Passenger {
  name?: string;
  age?: number;
  phone?: string;
  emergency_contact?: string;
  passenger_status?: string;
  first_aid_given?: string;
  ambulance_request_time?: string;
  arrival_time?: string;
  handover_time?: string;
  departure_time?: string;
  hospital_name?: string;
  ambulance_reference?: string;
}

export interface TrainOperation {
  train_number?: string;
  current_location?: string;
  destination?: string;
  operation_mode?: string;
  rescue_train_number?: string;
  rescue_start_time?: string;
  rescue_end_time?: string;
  handover_to_occ?: string;
  return_to_service?: string;
}

export interface StationEvacuation {
  evacuation_order_time?: string;
  evacuation_start_time?: string;
  evacuation_completion_time?: string;
  station_clear_notification_time?: string;
  station_reopening_time?: string;
}

export interface StaffMember {
  role?: string;
  name?: string;
  employee_id?: string;
  digital_signature?: string;
}

export interface ImpactAssessment {
  incident_duration?: number;
  response_duration?: number;
  evacuation_duration?: number;
  train_rescue_duration?: number;
  train_delays?: number;
  passengers_affected?: number;
  equipment_affected?: string;
  injuries?: number;
  fatalities?: number;
  cause?: string;
  corrective_actions?: string;
  lessons_learned?: string;
  incident_closed?: boolean;
}

export interface Incident {
  id: number;
  incident_number: string;
  created_by_name?: string;
  created_by_employee_id?: string;
  date?: string;
  day?: string;
  time?: string;
  shift?: string;
  station?: string;
  location?: string;
  platform?: string;
  concourse?: string;
  street_level?: string;
  track?: string;
  equipment_room?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  detection?: IncidentDetection;
  incident_types?: IncidentType[];
  passengers?: Passenger[];
  train_operations?: TrainOperation;
  evacuation?: StationEvacuation;
  staff?: StaffMember[];
  impact?: ImpactAssessment;
}

export interface IncidentCreate {
  created_by_name?: string;
  created_by_employee_id?: string;
  date?: string;
  day?: string;
  time?: string;
  shift?: string;
  station?: string;
  location?: string;
  platform?: string;
  concourse?: string;
  street_level?: string;
  track?: string;
  equipment_room?: string;
  description?: string;
  detection?: IncidentDetection;
  incident_types?: IncidentType[];
  passengers?: Passenger[];
  train_operations?: TrainOperation;
  evacuation?: StationEvacuation;
  staff?: StaffMember[];
  impact?: ImpactAssessment;
}

export interface KPISummary {
  total_incidents: number;
  open_incidents: number;
  closed_incidents: number;
  avg_response_time?: number;
  avg_rescue_time?: number;
  avg_evacuation_time?: number;
  total_injuries: number;
  total_fatalities: number;
  incidents_by_type: { name: string; count: number }[];
  incidents_by_station: { name: string; count: number }[];
  incidents_by_shift: { name: string; count: number }[];
  monthly_trend: { month: string; count: number }[];
}

export const incidentsApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get<Incident[]>('/incidents', { params }),
  get: (id: number) =>
    api.get<Incident>(`/incidents/${id}`),
  create: (data: IncidentCreate) =>
    api.post<Incident>('/incidents', data),
  update: (id: number, data: Partial<IncidentCreate>) =>
    api.put<Incident>(`/incidents/${id}`, data),
  delete: (id: number) =>
    api.delete(`/incidents/${id}`),
  report: (id: number) =>
    api.get(`/incidents/${id}/report`, { responseType: 'blob' }),
};

export const kpiApi = {
  summary: () =>
    api.get<KPISummary>('/kpi/summary'),
};
