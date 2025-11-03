export interface Pedido {
    gomaDeTapioca: boolean;
    queijoCoalho: number;
    cocoRalado: number;
    leiteCondensado: number;
}

export interface Cliente {
    paciencia: number;
    pedido: Pedido;
    pago: number;
    status: 'esperando' | 'em_preparo' | 'servido' | 'saiu';
}