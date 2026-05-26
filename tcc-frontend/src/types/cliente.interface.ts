import type { Bairro } from './bairro.interface';
import type { Pedido } from './pedido.interface';

export interface Cliente {
  pedido: Pedido;
  bairro: Bairro;
  satisfacao: number;
  status: 'esperando' | 'em_preparo' | 'servido' | 'saiu';
}
