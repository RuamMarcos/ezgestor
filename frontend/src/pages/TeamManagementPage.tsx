import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import type { TeamMember } from '../services/teamService';
import AddTeamMemberModal from '../components/team/AddTeamMemberModal';
import EditTeamMemberModal from '../components/team/EditTeamMemberModal';
import DeleteTeamMemberModal from '../components/team/DeleteTeamMemberModal';
import TeamMemberTable from '../components/team/TeamMemberTable';

const TeamManagementPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  
  const handleAddSuccess = () => {
    setRefreshTrigger(prev => prev + 1); // Incrementa para forçar atualização da tabela
  };

  const handleOpenEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenDeleteModal = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Gerenciamento de Usuários
        </h1>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-x-2 rounded-md bg-blue-600 px-3 py-2 sm:px-3.5 sm:py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 w-full sm:w-auto"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Adicionar Usuário
        </button>
      </div>

      {/* Tabela com pesquisa, filtros e paginação */}
      <TeamMemberTable 
        refreshTrigger={refreshTrigger}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
      />

      {/* Modal de Adicionar */}
      <AddTeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Modal de Editar */}
      <EditTeamMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={selectedMember}
        onSuccess={handleEditSuccess}
      />

      {/* Modal de Excluir */}
      <DeleteTeamMemberModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        member={selectedMember}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default TeamManagementPage;