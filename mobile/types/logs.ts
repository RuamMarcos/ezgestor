export interface LogUser {
  id_usuario: string;
  username: string;
  email: string;
}

export interface RawLog {
  id: number;
  user: LogUser | null;
  action_type_display: string;
  description: string;
  action_time: string;
}

export interface PaginatedLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawLog[];
}