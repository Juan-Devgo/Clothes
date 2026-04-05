'use client';

import { SortableColumn } from '@/types';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

export interface PaginatedParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  searchableFields?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

interface UseServerTableParams<T> {
  fetchAction: (params: PaginatedParams) => Promise<PaginatedResult<T>>;
  initialData: T[];
  initialTotal: number;
  initialPage?: number;
  initialPageSize?: number;
}

export function useServerTable<T>({
  fetchAction,
  initialData,
  initialTotal,
  initialPage = 1,
  initialPageSize = 10,
}: UseServerTableParams<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [totalRows, setTotalRows] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPageSize);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFields, setSearchFields] = useState<string[]>([]);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, startTransition] = useTransition();
  const isInitialMount = useRef(true);

  const fetchData = useCallback(() => {
    startTransition(async () => {
      const result = await fetchAction({
        page: currentPage,
        pageSize: perPage,
        search: searchQuery,
        sortField: sortField || undefined,
        sortDirection,
        searchableFields: searchFields.length > 0 ? searchFields : undefined,
      });
      setData(result.data);
      setTotalRows(result.total);
    });
  }, [fetchAction, currentPage, perPage, searchQuery, searchFields, sortField, sortDirection, startTransition]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchData();
  }, [fetchData]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  }, []);

  const handleSort = useCallback((column: SortableColumn, direction: 'asc' | 'desc') => {
    setSortField(column.sortField || '');
    setSortDirection(direction);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((query: string, fields: string[]) => {
    setSearchQuery(query);
    setSearchFields(fields);
    setCurrentPage(1);
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    totalRows,
    loading: isLoading,
    currentPage,
    perPage,
    hasActiveSearch: searchQuery.length > 0,
    handlePageChange,
    handlePerPageChange,
    handleSort,
    handleSearch,
    refetch,
  };
}
