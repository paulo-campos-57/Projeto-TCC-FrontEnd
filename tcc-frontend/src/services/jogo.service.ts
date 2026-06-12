const BASE = 'https://tapiocaria-backend.onrender.com/jogo';

export interface ItemCatalogo {
  nome: string;
  preco: number;
  porcao: number;
}

export interface ItemEstoque {
  nome: string;
  quantidade: number;
}

export interface SessaoSnapshot {
  sessao_id: string;
  dia_atual: number;
  budget: number;
  satisfacao: number;
  preco_tapioca: number;
  preco_dia_anterior: number | null;
  gasto_hoje: number;
  tapiocas_possiveis: number;
  estoque: ItemEstoque[];
  receita: Record<string, number>;
  finalizado: boolean;
  fator_inflacao: number;
}

export interface ResultadoDia {
  lucro: number;
  clientes_totais: number;
  clientes_atendidos: number;
  clientes_perdidos: number;
  clientes_perdidos_preco: number;
  clientes_perdidos_receita: number;
  estoque_esgotado: boolean;
  satisfacao_delta: number;
  delta_preco: number;
  delta_receita: number;
  mensagem: string;
  sessao: SessaoSnapshot;
}

function getToken(): string | null {
  const raw = localStorage.getItem('token');
  if (!raw) return null;
  return raw.replace(/"/g, '').trim();
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro na requisição.');
  return json as T;
}

async function put<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro ?? 'Erro na requisição.');
  return json as T;
}

export async function criarSessao(
  id_bairro: number,
  tempo_de_jogo: string,
): Promise<{
  sessao_id: string;
  sessao: SessaoSnapshot;
  catalogo: ItemCatalogo[];
}> {
  return post(`${BASE}/sessao`, { id_bairro, tempo_de_jogo });
}

export async function comprarIngrediente(
  sessao_id: string,
  nome: string,
): Promise<{
  ok: boolean;
  nome: string;
  quantidade: number;
  budget: number;
  gasto_hoje: number;
}> {
  return post(`${BASE}/sessao/${sessao_id}/comprar`, { nome });
}

export async function devolverIngrediente(
  sessao_id: string,
  nome: string,
): Promise<{
  ok: boolean;
  nome: string;
  quantidade: number;
  budget: number;
  gasto_hoje: number;
}> {
  return post(`${BASE}/sessao/${sessao_id}/devolver`, { nome });
}

export async function atualizarReceita(
  sessao_id: string,
  receita: Record<string, number>,
): Promise<{ ok: boolean; tapiocas_possiveis: number }> {
  return put(`${BASE}/sessao/${sessao_id}/receita`, { receita });
}

export async function definirPreco(
  sessao_id: string,
  preco_tapioca: number,
): Promise<{ ok: boolean }> {
  return put(`${BASE}/sessao/${sessao_id}/preco`, { preco_tapioca });
}

export async function processarDia(sessao_id: string): Promise<ResultadoDia> {
  return post(`${BASE}/sessao/${sessao_id}/processar-dia`);
}

export async function avancarDia(
  sessao_id: string,
): Promise<{ sessao: SessaoSnapshot; catalogo: ItemCatalogo[] }> {
  return post(`${BASE}/sessao/${sessao_id}/avancar-dia`);
}

export async function encerrarSessao(sessao_id: string): Promise<unknown> {
  const res = await fetch(`${BASE}/sessao/${sessao_id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao encerrar sessão');
  return res.json();
}
