export interface ProcessarDiaPayload {
    id_bairro: number;
    preco_tapioca: number;
    estoque_disponivel: number;
}

export interface ProcessarDiaResult {
    lucro: number;
    clientes_totais: number;
    clientes_atendidos: number;
    clientes_perdidos: number;
    estoque_esgotado: boolean;
    satisfacao_delta: number;
    mensagem: string;
}

export async function processarDia(
    payload: ProcessarDiaPayload
): Promise<ProcessarDiaResult> {
    const response = await fetch(
        'http://127.0.0.1:5000/jogo/processar-dia',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.erro ?? 'Erro ao processar o dia.');
    }

    return response.json() as Promise<ProcessarDiaResult>;
}