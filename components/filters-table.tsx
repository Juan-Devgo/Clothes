'use client';

import { Filter } from '@/types';
import { useState } from 'react';

import FilterIcon from './icons/filter';

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
    const value = event.target.value.toLowerCase();

    if (!value) {
      setRecords(data);
      return;
    }

    const filteredRecords = data.filter((record) => {
      if (!activeFilters || activeFilters.length === 0) {
        return true;
      }

      return activeFilters.some((filter) => {
        const fieldValue = (record as Record<string, unknown>)[filter.column];
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(value);
        }
        if (typeof fieldValue === 'number') {
          return fieldValue.toString().includes(value);
        }
        return false;
      });
    });

    setRecords(filteredRecords);
  }

  return (
    <div className="flex flex-row items-center gap-1 relative">
      <input
        type="text"
        placeholder="Buscar"
        onChange={handleInputChange}
        className="border-2 placeholder:text-gray-600 text-gray-600 p-0.5 focus:outline-none rounded-lg border-gray-500"
      />
      <button
        onClick={toggleFiltersList}
        className="cursor-pointer"
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
