import React from 'react';
import type { ICompanyForm } from '../../types/company';

interface CompanyIdentificationProps {
  formData: ICompanyForm;
  logoPreview: string | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CompanyIdentification: React.FC<CompanyIdentificationProps> = ({
  formData,
  logoPreview,
  handleChange,
  handleFileChange,
}) => {
  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Identificação da Empresa
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna do Logotipo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Pré-visualização do Logo"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-gray-400">Logo</span>
            )}
          </div>
          <label
            htmlFor="logo-upload"
            className="cursor-pointer bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Enviar Novo Logo
          </label>
          <input
            id="logo-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
          />
          <p className="text-xs text-gray-500">PNG, JPG até 2MB</p>
        </div>

        {/* Coluna de Nome Fantasia e Razão Social */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="nome_fantasia"
              className="block text-sm font-medium text-gray-600"
            >
              Nome Fantasia
            </label>
            <input
              type="text"
              id="nome_fantasia"
              name="nome_fantasia"
              value={formData.nome_fantasia}
              onChange={handleChange}
              className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="razao_social"
              className="block text-sm font-medium text-gray-600"
            >
              Razão Social
            </label>
            <input
              type="text"
              id="razao_social"
              name="razao_social"
              value={formData.razao_social}
              onChange={handleChange}
              className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
            />
          </div>
        </div>

        {/* Coluna de CNPJ e Inscrição */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="cnpj"
              className="block text-sm font-medium text-gray-600"
            >
              CNPJ
            </label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="inscricao_estadual"
              className="block text-sm font-medium text-gray-600"
            >
              Inscrição Estadual/Municipal
            </label>
            <input
              type="text"
              id="inscricao_estadual"
              name="inscricao_estadual"
              value={formData.inscricao_estadual}
              onChange={handleChange}
              className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyIdentification;
