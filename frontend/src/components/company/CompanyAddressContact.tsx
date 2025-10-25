import React from 'react';
import type { ICompanyForm } from '../../types/company';

interface CompanyAddressContactProps {
  formData: ICompanyForm;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CompanyAddressContact: React.FC<CompanyAddressContactProps> = ({
  formData,
  handleChange,
}) => {
  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Endereço e Contato
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna 1 */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="endereco"
              className="block text-sm font-medium text-gray-600"
            >
              Endereço
            </label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="cep"
              className="block text-sm font-medium text-gray-600"
            >
              CEP
            </label>
            <input
              type="text"
              id="cep"
              name="cep"
              value={formData.cep}
              onChange={handleChange}
              className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
            />
          </div>
        </div>
        {/* Coluna 2 */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="bairro"
              className="block text-sm font-medium text-gray-600"
            >
              Bairro
            </label>
            <input
              type="text"
              id="bairro"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="cidade"
              className="block text-sm font-medium text-gray-600"
            >
              Cidade
            </label>
            <input
              type="text"
              id="cidade"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
            />
          </div>
        </div>
        {/* Coluna 3 */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="estado"
              className="block text-sm font-medium text-gray-600"
            >
              Estado
            </label>
            <input
              type="text"
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="pais"
              className="block text-sm font-medium text-gray-600"
            >
              País
            </label>
            <input
              type="text"
              id="pais"
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAddressContact;
