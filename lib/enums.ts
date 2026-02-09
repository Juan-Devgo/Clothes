import { cmsApi } from './paths';
import { getContent } from '@/service/cms';

/**
 * Obtener el documentId de un estado de cuenta por su nombre
 */
async function getAccountStateId(stateName: string): Promise<string | null> {
  try {
    const result = await getContent(
      `${cmsApi.ACCOUNT_STATES}?filters[name][$eq]=${stateName}`,
    );
    if (!result.success) return null;
    return result.data?.[0]?.documentId ?? null;
  } catch {
    return null;
  }
}

export const ACCOUNT_STATES = {
  FREE: async () => await getAccountStateId('FREE'),
  SEPARATE: async () => await getAccountStateId('SEPARATE'),
  CREDIT: async () => await getAccountStateId('CREDIT'),
  COMBINED: async () => await getAccountStateId('COMBINED'),
} as const;
