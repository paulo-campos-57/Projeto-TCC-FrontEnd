import type { Bairro } from '../types/bairro.interface';

type TipoTapioca = Bairro['preferenciaTapioca'];

/**
 * @param nomeDoBairro O nome do bairro.
 * @returns Um objeto que satisfaz a interface Bairro.
 */
export function criarBairroComPreferencias(nomeDoBairro: string): Bairro {
    let preferenciaPreco: number;
    let preferenciaTapioca: TipoTapioca;

    const nomeNormalizado = nomeDoBairro.toLowerCase().trim();

    switch (nomeNormalizado) {
        case 'boa viagem':
            preferenciaPreco = 4;
            preferenciaTapioca = 'Saudável e Turística';
            break;
        case 'casa forte':
            preferenciaPreco = 5;
            preferenciaTapioca = 'Gourmet e Sofisticada';
            break;
        case 'várzea':
            preferenciaPreco = 3;
            preferenciaTapioca = 'Variada e Estudantil';
            break;
        case 'ibura':
            preferenciaPreco = 1;
            preferenciaTapioca = 'Familiar e Econômica';
            break;
        case 'recife antigo':
            preferenciaPreco = 2;
            preferenciaTapioca = 'Criativa e Rápida';
            break;
        case 'areias':
            preferenciaPreco = 1;
            preferenciaTapioca = 'Tradicional e Caseira';
            break;
        default:
            preferenciaPreco = 3;
            preferenciaTapioca = 'Tradicional e Caseira';
            break;
    }

    return {
        nome: nomeDoBairro,
        preferenciaPreco: preferenciaPreco,
        preferenciaTapioca: preferenciaTapioca
    };
}