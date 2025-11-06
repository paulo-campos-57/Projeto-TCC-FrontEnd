import type { Pedido } from '../types/pedido.interface';
import type { Bairro } from '../types/bairro.interface';

type TipoPreferencial = Bairro['preferenciaTapioca'];

const RECEITAS_PEDIDO: Record<TipoPreferencial, Omit<Pedido, 'gomaDeTapioca'>> = {
    'Gourmet e Sofisticada': {
        queijoCoalho: 2,
        cocoRalado: 0,
        leiteCondensado: 0,
    },
    'Criativa e Rápida': {
        queijoCoalho: 1,
        cocoRalado: 0,
        leiteCondensado: 1,
    },
    'Familiar e Econômica': {
        queijoCoalho: 1,
        cocoRalado: 1,
        leiteCondensado: 1,
    },
    'Saudável e Turística': {
        queijoCoalho: 1,
        cocoRalado: 0,
        leiteCondensado: 0,
    },
    'Variada e Estudantil': {
        queijoCoalho: 1,
        cocoRalado: 2,
        leiteCondensado: 1,
    },
    'Tradicional e Caseira': {
        queijoCoalho: 2,
        cocoRalado: 2,
        leiteCondensado: 0,
    },
};

/**
 * @param preferencia A preferência de tapioca definida pelo bairro do cliente.
 * @returns Um objeto que satisfaz a interface Pedido.
 */
export function criarPedidoPorPreferencia(preferencia: TipoPreferencial): Pedido {
    const receitaBase = RECEITAS_PEDIDO[preferencia];

    return {
        gomaDeTapioca: true,
        ...receitaBase
    };
}
