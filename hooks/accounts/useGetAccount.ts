'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccountById } from '@/actions/accounts';
import { Account } from '@/types';
import toast from 'react-hot-toast';

interface UseGetAccountResult {
  account: Account | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGetAccount(documentId: string | null): UseGetAccountResult {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    if (!documentId) {
      setAccount(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getAccountById(documentId);

      if (result.success && result.data) {
        setAccount(result.data);
      } else {
        const errorMessage = result.error || 'Error al obtener la cuenta';
        setError(errorMessage);
        toast.error(errorMessage);
        setAccount(null);
      }
    } catch {
      const errorMessage = 'Error de conexión al obtener la cuenta';
      setError(errorMessage);
      toast.error(errorMessage);
      setAccount(null);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  return {
    account,
    isLoading,
    error,
    refetch: fetchAccount,
  };
}
