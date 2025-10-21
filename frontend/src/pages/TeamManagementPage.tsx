import React, { useState, useEffect, useCallback } from 'react'; // 1. Adicionar useCallback
import { PlusIcon } from '@heroicons/react/24/solid';
import { getTeamMembers, type TeamMember } from '../services/teamService';
import AddTeamMemberModal from '../components/team/AddTeamMemberModal';

const TeamManagementPage: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTeamMembers();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar usuários.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]); 

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  // const handleOpenEditModal = (member: TeamMember) => {
  //   setSelectedMember(member);
  //   setIsEditModalOpen(true);
  // };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Gerenciamento de Usuários
        </h1>
        <button
          onClick={handleOpenAddModal} 
          className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Adicionar Usuário
        </button>
      </div>

      {/* Tabela de Usuários */}
      <div className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <table className="min-w-full divide-y divide-gray-300">
          <tbody className="divide-y divide-gray-200 bg-white">
            {!loading && !error && members.map((member) => (
              <tr key={member.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {member.first_name} {member.last_name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{member.email}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">{member.nivel_acesso}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {member.is_active ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      Inativo
                    </span>
                  )}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button
                    // onClick={() => handleOpenEditModal(member)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        <AddTeamMemberModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={fetchMembers} 
        />
        
        {/*
        <EditTeamMemberModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          member={selectedMember}
          onSuccess={fetchMembers}
        />
        */}
    </div>
  );
};

export default TeamManagementPage;