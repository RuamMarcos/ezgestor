import { useState, useEffect } from 'react';
import { updateTeamMember, type TeamMember, type UpdateTeamMember } from '../../services/teamService';

interface EditTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: TeamMember | null;
}

const EditTeamMemberModal: React.FC<EditTeamMemberModalProps> = ({ isOpen, onClose, onSuccess, member }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<UpdateTeamMember>({
    first_name: '',
    last_name: '',
    nivel_acesso: 'funcionario',
    is_active: true
  });

  useEffect(() => {
    if (isOpen && member) {
      setFormData({
        first_name: member.first_name,
        last_name: member.last_name,
        nivel_acesso: member.nivel_acesso,
        is_active: member.is_active
      });
      setError('');
    }
  }, [isOpen, member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!member) return;

    // Validações
    if (!formData.first_name || !formData.last_name) {
      setError('Nome e sobrenome são obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      await updateTeamMember(member.id, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Falha ao atualizar usuário:", error);
      
      let errorMsg = 'Ocorreu um erro ao atualizar. Tente novamente.';
      
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
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Editar Usuário</h2>
        
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            {/* Sobrenome */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Sobrenome</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            {/* Email (apenas visualização) */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={member.email}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">O email não pode ser alterado</p>
            </div>

            {/* Cargo */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Cargo</label>
              <select
                name="nivel_acesso"
                value={formData.nivel_acesso}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="funcionario">Funcionário</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            {/* Status (Ativo/Inativo) */}
            <div className="sm:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Usuário ativo</span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Desmarque para desativar o acesso deste usuário ao sistema
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeamMemberModal;
