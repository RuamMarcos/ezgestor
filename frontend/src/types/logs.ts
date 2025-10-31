export interface LogUser {
  id_usuario: string;
  username: string;
  email: string;
}

export interface Log {
  id: number;
  user: string;
  action_type: string;
  details: string;
  timestamp: string;
}

export interface PaginatedLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Log[];
}