const BASE_URL = 'https://tapiocaria-backend.onrender.com/resultados';

export interface StatsData {
  geral: {
    total_partidas: number;
    lucro_acumulado: number;
    media_satisfacao: number;
    melhor_lucro: number;
  };
  graficos: {
    labels: string[];
    lucro_por_partida: number[];
    satisfacao_por_partida: number[];
  };
}

export interface RankingItem {
  posicao: number;
  nome: string;
  bairro: string;
  lucro: number;
  satisfacao: number;
  data: string;
}

function getHeaders() {
  const token = localStorage.getItem('token')?.replace(/"/g, '').trim();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const resultadoService = {
  async obterEstatisticas(userId: string): Promise<StatsData> {
    const response = await fetch(`${BASE_URL}/${userId}/estatisticas`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar estatísticas');
    }

    return response.json();
  },

  async obterRanking(
    bairro?: string,
    ordenar: string = 'lucro',
  ): Promise<RankingItem[]> {
    const params = new URLSearchParams({ ordenar });
    if (bairro) params.append('bairro', bairro);

    const response = await fetch(`${BASE_URL}/ranking?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao buscar ranking');
    }

    return response.json();
  },
};
