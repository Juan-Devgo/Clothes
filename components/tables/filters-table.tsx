'use client';

import { Filter } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import FilterIcon from '../icons/filter';

interface FiltersTableProps<T> {
  allFilters: Filter[];
  data: T[];
  records: T[];
  setRecords: (records: T[]) => void;
}

export default function FiltersTable<T>({
  allFilters,
  data,
  setRecords,
}: FiltersTableProps<T>) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filter[] | undefined>(
    allFilters,
  );

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setActiveFilters(allFilters);
  }, [allFilters]);

  const filterRecords = useCallback(
    (query: string, filters: Filter[] | undefined) => {
      if (!query) {
        setRecords(data);
        return;
      }

      const filteredRecords = data.filter((record) => {
        if (!filters || filters.length === 0) {
          return true;
        }

        return filters.some((filter) => {
          const fieldValue = (record as Record<string, unknown>)[filter.column];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(query);
          }
          if (typeof fieldValue === 'number') {
            return fieldValue.toString().includes(query);
          }
          if (typeof fieldValue === 'object' && fieldValue !== null) {
            const obj = fieldValue as Record<string, unknown>;
            const textValue = (obj.label ?? obj.name ?? '') as string;
            return textValue.toLowerCase().includes(query);
          }
          return false;
        });
      });

      setRecords(filteredRecords);
    },
    [data, setRecords],
  );

  useEffect(() => {
    filterRecords(searchQuery, activeFilters);
  }, [activeFilters, searchQuery, filterRecords]);

  function toggleFiltersList() {
    setShowFilterMenu(!showFilterMenu);
  }

  function toggleFilter(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    const isChecked = event.target.checked;

    if (isChecked) {
      const filterToAdd = allFilters?.find((filter) => filter.column === value);

      if (!filterToAdd) return;

      const newActiveFilters = activeFilters
        ? [...activeFilters, filterToAdd]
        : [filterToAdd];
      setActiveFilters(newActiveFilters);
    } else {
      const filteredActiveFilters = activeFilters?.filter(
        (filter) => filter.column !== value,
      );
      setActiveFilters(filteredActiveFilters);
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(event.target.value.toLowerCase());
  }

  return (
    <div className="flex flex-row items-center gap-2 relative">
      <input
        type="text"
        placeholder="Buscar"
        onChange={handleInputChange}
        className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
      />
      <button
        onClick={toggleFiltersList}
        className="px-4 py-2.5 cursor-pointer p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:ring-2 hover:ring-green-500 transition-all"
        aria-label="Mostrar filtros"
      >
        <FilterIcon />
      </button>

      <div
        className={`absolute top-full left-0 mt-2 bg-white border-2 border-gray-500 rounded-lg shadow-lg z-20 min-w-48 ${showFilterMenu ? '' : 'hidden'}`}
      >
        {allFilters && allFilters.length > 0 ? (
          <div className="p-3">
            <p className="font-semibold text-gray-700 mb-2 text-sm">
              Filtros Disponibles
            </p>
            {allFilters.map((filter) => (
              <label
                key={filter.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
              >
                <input
                  type="checkbox"
                  name="filter"
                  checked={activeFilters?.includes(filter) || false}
                  value={filter.column}
                  onChange={(e) => toggleFilter(e)}
                  className="cursor-pointer"
                />
                <span className="text-gray-700 text-sm">{filter.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="p-3 text-gray-500 text-sm">
            No hay filtros disponibles
          </div>
        )}
      </div>

      {activeFilters?.length === 0 && (allFilters?.length ?? 0) > 0 && (
        <span className="ml-2 text-sm text-gray-500">
          Active al menos un filtro para que la búsqueda funcione.
        </span>
      )}

      {showFilterMenu && (
        <div className="fixed inset-0 z-10" onClick={toggleFiltersList}></div>
      )}
    </div>
  );
}
