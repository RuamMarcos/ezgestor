export interface IPlano {
  id_plano: number;
  nome: string;
  preco_mensal: string;
}

export interface IAssinatura {
  id_assinatura: number;
  plano: IPlano;
  status: string; 
  data_proximo_pagamento: string;
}

export interface IPagamento {
  id_pagamento: number;
  data_pagamento: string; 
  valor: string;
  status: string;
}