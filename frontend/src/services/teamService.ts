import api from '../api';

export interface TeamMember {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  nivel_acesso: 'administrador' | 'funcionario';
  is_active: boolean;
}

export interface NewTeamMember {
  email: string;
  first_name: string;
  last_name: string;
  nivel_acesso: 'administrador' | 'funcionario';
  password: string;
}

export interface UpdateTeamMember {
  first_name: string;
  last_name: string;
  nivel_acesso: 'administrador' | 'funcionario';
  is_active: boolean;
}

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const { data } = await api.get('/accounts/team/members/');
  return data;
};

export const addTeamMember = async (memberData: NewTeamMember): Promise<TeamMember> => {
  const { data } = await api.post('/accounts/team/add/', memberData);
  return data;
};

export const updateTeamMember = async (id: number, memberData: Partial<UpdateTeamMember>): Promise<TeamMember> => {
  const { data } = await api.patch(`/accounts/team/member/${id}/`, memberData);
  return data;
};

export const deleteTeamMember = async (id: number): Promise<void> => {
  await api.delete(`/accounts/team/member/${id}/`);
};

export const getTeamMemberDetails = async (id: number): Promise<TeamMember> => {
  const { data } = await api.get(`/accounts/team/member/${id}/`);
  return data;
};