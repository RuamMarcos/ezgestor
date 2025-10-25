export interface CompanyData {
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  inscricao_estadual: string;
  endereco: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  telefone: string;
  email_contato: string;
  logotipo_url: string;
}

export interface ICompanyForm extends Omit<CompanyData, 'logotipo_url' | 'email_contato'> {
  logotipo: File | null;
  email_principal: string;
}
