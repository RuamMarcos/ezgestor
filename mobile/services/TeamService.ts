import api from '../utils/api';

export interface TeamMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  nivel_acesso: 'administrador' | 'funcionario';
  is_active: boolean;
  date_joined: string;

}



export interface CreateTeamMemberData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  nivel_acesso: 'administrador' | 'funcionario';
}

export const getTeamMembers = async (): Promise<TeamMember[]> => {

  // O endpoint correto é /team/members/

  const response = await api.get('/accounts/team/members/');

  return response.data;

};



export const createTeamMember = async (data: CreateTeamMemberData): Promise<TeamMember> => {

  // /team/add/ está correto

  const response = await api.post('/accounts/team/add/', data);

  return response.data;

};



export const updateTeamMember = async (id: number, data: Partial<CreateTeamMemberData>): Promise<TeamMember> => {

  // O endpoint correto é /team/member/<id>/

  const response = await api.patch(`/accounts/team/member/${id}/`, data);

  return response.data;

};



export const deleteTeamMember = async (id: number): Promise<void> => {

  // O endpoint correto é /team/member/<id>/

  await api.delete(`/accounts/team/member/${id}/`);

};