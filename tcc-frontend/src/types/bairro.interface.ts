// Interface de bairro para jogo

export interface Bairro {
  nome: string;
  preferenciaPreco: number;
  preferenciaTapioca:
    | 'Gourmet e Sofisticada'
    | 'Criativa e Rápida'
    | 'Familiar e Econômica'
    | 'Saudável e Turística'
    | 'Variada e Estudantil'
    | 'Tradicional e Caseira';
  satisfacaoBase: number;
}
