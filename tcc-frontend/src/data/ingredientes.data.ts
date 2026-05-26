export type TipoIngrediente =
  | 'Goma de Tapioca'
  | 'Queijo Coalho'
  | 'Coco Ralado'
  | 'Leite Condensado';

export const INGREDIENTES_PRECOS: Record<TipoIngrediente, number> = {
  'Goma de Tapioca': 10,
  'Queijo Coalho': 15,
  'Coco Ralado': 8,
  'Leite Condensado': 12,
};
