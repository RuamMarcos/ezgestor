export const aplicarMascaraCnpj = (valor: string): string => {
  return valor
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
};

export const aplicarMascaraTelefone = (valor: string): string => {
  return valor
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d)(\d{4})$/, "$1-$2")
    .slice(0, 15);
};


export const aplicarMascaraCartao = (valor: string): string => {
  return valor
    .replace(/\D/g, "")
    .replace(/(\d{4})/g, '$1 ')
    .trim()
    .slice(0, 19);
};

export const aplicarMascaraValidade = (valor: string): string => {
  return valor
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, '$1/$2')
    .slice(0, 5);
};

export const aplicarMascaraCvv = (valor: string): string => {
  return valor
    .replace(/\D/g, "")
    .slice(0, 4);
};
