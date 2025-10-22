import { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { deleteTeamMember, type TeamMember } from '../../services/teamService';

interface DeleteTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: TeamMember | null;
}

const DeleteTeamMemberModal: React.FC<DeleteTeamMemberModalProps> = ({ isOpen, onClose, onSuccess, member }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!member) return;

    setLoading(true);
    setError('');

    try {
      await deleteTeamMember(member.id);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Falha ao excluir usuário:", error);
      
      let errorMsg = 'Ocorreu um erro ao excluir. Tente novamente.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMsg = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Excluir Usuário Permanentemente</h2>
        </div>

        {error && <p className="text-red-500 text-sm mb-3 bg-red-50 p-3 rounded">{error}</p>}
        
        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            Você está prestes a <span className="font-bold text-red-600">excluir permanentemente</span> o usuário:
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <p className="font-semibold text-gray-900">
              {member.first_name} {member.last_name}
            </p>
            <p className="text-sm text-gray-600">{member.email}</p>
            <p className="text-sm text-gray-600 capitalize mt-1">
              Cargo: {member.nivel_acesso === 'administrador' ? 'Administrador' : 'Funcionário'}
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-bold">ATENÇÃO:</span> Esta ação é <span className="font-bold">irreversível</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>⚠️ O usuário será <strong>removido permanentemente</strong> do sistema</p>
            <p>⚠️ Todos os dados associados serão perdidos</p>
            <p>⚠️ O acesso será <strong>revogado imediatamente</strong></p>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica:</strong> Se você deseja apenas impedir o acesso temporariamente, 
              use a opção de <strong>Editar</strong> e desmarque "Usuário ativo" em vez de excluir.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Excluindo...' : 'Sim, Excluir Permanentemente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTeamMemberModal;
