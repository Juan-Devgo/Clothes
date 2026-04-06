"use client";

import { Filter } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import FilterIcon from "../icons/filter";

interface FiltersTableProps<T> {
  allFilters: Filter[];
  data: T[];
  records: T[];
  setRecords: (records: T[]) => void;
  onServerSearch?: (query: string, activeFilterColumns: string[]) => void;
}

export default function FiltersTable<T>({
  allFilters,
  data,
  setRecords,
  onServerSearch,
}: FiltersTableProps<T>) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filter[] | undefined>(
    allFilters,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allFilterKey = allFilters.map((f) => f.id).join(",");

  useEffect(() => {
    setActiveFilters((prev) => {
      if (!prev) return allFilters;
      const prevKey = prev.map((f) => f.id).join(",");
      if (prevKey === allFilterKey) return prev;
      // Preserve selections for existing filters; auto-activate brand-new ones
      const prevActiveColumns = new Set(prev.map((f) => f.column));
      const prevAllColumns = new Set(prev.map((f) => f.column));
      return allFilters.filter(
        (f) => prevActiveColumns.has(f.column) || !prevAllColumns.has(f.column),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFilterKey]);

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
          if (typeof fieldValue === "string") {
            return fieldValue.toLowerCase().includes(query);
          }
          if (typeof fieldValue === "number") {
            return fieldValue.toString().includes(query);
          }
          if (typeof fieldValue === "object" && fieldValue !== null) {
            const obj = fieldValue as Record<string, unknown>;
            const textValue = (obj.label ?? obj.name ?? "") as string;
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
    if (!onServerSearch) {
      filterRecords(searchQuery, activeFilters);
    }
  }, [activeFilters, searchQuery, filterRecords, onServerSearch]);

  function toggleFiltersList() {
    setShowFilterMenu(!showFilterMenu);
  }

  function toggleFilter(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    const isChecked = event.target.checked;

    let newFilters: Filter[] | undefined;

    if (isChecked) {
      const filterToAdd = allFilters?.find((filter) => filter.column === value);

      if (!filterToAdd) return;

      newFilters = activeFilters
        ? [...activeFilters, filterToAdd]
        : [filterToAdd];
    } else {
      newFilters = activeFilters?.filter((filter) => filter.column !== value);
    }

    setActiveFilters(newFilters);

    if (onServerSearch && searchQuery) {
      const columns = (newFilters ?? []).map((f) => f.column);
      onServerSearch(searchQuery, columns);
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (onServerSearch) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const columns = (activeFilters ?? []).map((f) => f.column);
        onServerSearch(query, columns);
      }, 300);
    }
  }

  return (
    <div className="flex flex-row items-center gap-2 w-full">
      <input
        type="text"
        placeholder="Buscar"
        onChange={handleInputChange}
        className="flex-1 min-w-32 max-w-96 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
      />

      <div className="relative">
        <button
          onClick={toggleFiltersList}
          aria-label="Mostrar filtros"
          aria-expanded={showFilterMenu}
          className={`px-4 py-2.5 cursor-pointer bg-white border rounded-lg text-gray-600 transition-all ${
            showFilterMenu
              ? "border-pink-400 ring-2 ring-pink-400 text-pink-600"
              : "border-gray-200 hover:ring-2 hover:ring-pink-400"
          }`}
        >
          <FilterIcon aria-hidden="true" />
        </button>

        {showFilterMenu && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-48">
            {allFilters && allFilters.length > 0 ? (
              <div className="p-3">
                <p className="font-semibold text-gray-500 mb-2 text-xs uppercase tracking-wide">
                  Buscar en
                </p>
                {allFilters.map((filter) => (
                  <label
                    key={filter.id}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-pink-50 cursor-pointer rounded-lg"
                  >
                    <input
                      type="checkbox"
                      name="filter"
                      checked={
                        activeFilters?.some(
                          (f) => f.column === filter.column,
                        ) || false
                      }
                      value={filter.column}
                      onChange={(e) => toggleFilter(e)}
                      className="cursor-pointer accent-pink-600"
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
