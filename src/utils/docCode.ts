// Décomposition de la codification normalisée d'un document routier RN13

export interface DocCodeParts {
  project: string;
  lot: string;
  category: string;
  type: string;
  number: string;
  revision: string;
}

export function parseDocCode(code: string): DocCodeParts {
  const parts = code.split('-');
  return {
    project: parts[0] || 'RN13',
    lot: parts[1] || 'L01',
    category: parts[2] || 'PEC',
    type: parts[3] || 'GEN',
    number: parts[4] || '0001',
    revision: parts[5] || 'P01',
  };
}

export function generateDocCode(
  lot: string,
  category: string,
  type: string,
  number: number | string,
  revision: string = 'P01'
): string {
  const numStr = String(number).padStart(4, '0');
  return `RN13-${lot}-${category}-${type}-${numStr}-${revision}`;
}
