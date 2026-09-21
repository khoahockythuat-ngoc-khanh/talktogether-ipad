import { PICTOGRAM_LABEL_ALIASES } from '../data/constants';

function pictogramSlug(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function pictogramPath(label: string): string {
  return `/pictograms/arasaac/${pictogramSlug(PICTOGRAM_LABEL_ALIASES[label] || label)}.png`;
}
