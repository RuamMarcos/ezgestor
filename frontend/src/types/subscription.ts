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
  metodo_pagamento_padrao: string | null;
  cartao_final: string | null;
  cartao_bandeira: string | null;
  cartao_validade: string | null;
}

export interface IPagamento {
  id_pagamento: number;
  data_pagamento: string; 
  valor: string;
  status: string;
  metodo: string;
}