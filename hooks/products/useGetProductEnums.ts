'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCategoriesAction,
  getSubcategoriesAction,
} from '@/actions/products';
import { ProductCategory, ProductSubcategory } from '@/types';
import toast from 'react-hot-toast';

interface UseGetProductEnumsResult {
  categories: ProductCategory[];
  subcategories: ProductSubcategory[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGetProductEnums(): UseGetProductEnumsResult {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnums = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [categoriesResult, subcategoriesResult] = await Promise.all([
        getCategoriesAction(),
        getSubcategoriesAction(),
      ]);

      if (categoriesResult) {
        setCategories(categoriesResult);
      } else {
        const errorMessage = 'Error al obtener las categorías';
        setError(errorMessage);
        toast.error(errorMessage);
      }

      if (subcategoriesResult) {
        setSubcategories(subcategoriesResult);
      } else {
        const errorMessage = 'Error al obtener las subcategorías';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch {
      const errorMessage =
        'Error de conexión al obtener categorías y subcategorías';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnums();
  }, [fetchEnums]);

  return {
    categories,
    subcategories,
    isLoading,
    error,
    refetch: fetchEnums,
  };
}
