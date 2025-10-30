export interface LogUser {
  id_usuario: string;
  username: string;
  email: string;
}

export interface LogEntry {
  id: number;
  user: LogUser | null;
  action_time: string;
  action_type: string;
  action_type_display: string;
  model_name: string;
  object_id: number;
  description: string;
}

export interface PaginatedLogResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LogEntry[];
}