import api from "../api";

export type ThemeSetting = 'light' | 'dark' | 'system';

export interface UserPreferenceResponse {
  theme: ThemeSetting;
  updated_at: string;
}

export async function getMyPreferences(): Promise<UserPreferenceResponse> {
  const { data } = await api.get<UserPreferenceResponse>('/accounts/me/preferences/');
  return data;
}

export async function updateMyPreferences(theme: ThemeSetting): Promise<UserPreferenceResponse> {
  const { data } = await api.put<UserPreferenceResponse>('/accounts/me/preferences/', { theme });
  return data;
}


