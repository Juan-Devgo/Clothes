'use client';

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id: string;
  name?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: ReactNode;
  wrapperClass?: string;
  triggerClass?: string;
  menuClass?: string;
  optionClass?: string;
  onChange?: (value: string, option: SelectOption | null) => void;
}

export default function CustomSelect({
  id,
  name,
  options,
  value,
  defaultValue,
  placeholder = 'Selecciona una opción',
  disabled = false,
  required = false,
  icon,
  wrapperClass = '',
  triggerClass = '',
  menuClass = '',
  optionClass = '',
  onChange,
}: CustomSelectProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;

  const initialValue = value ?? defaultValue ?? '';

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(initialValue);

  const selectedValue = isControlled ? (value ?? '') : internalValue;

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue) ?? null,
    [options, selectedValue],
  );

  useEffect(() => {
    if (!isControlled) {
      const currentExists = options.some((opt) => opt.value === internalValue);
      if (!currentExists) {
        setInternalValue('');
      }
    }
  }, [options, isControlled, internalValue]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelect = (option: SelectOption) => {
    if (!isControlled) {
      setInternalValue(option.value);
    }
    setIsOpen(false);
    onChange?.(option.value, option);
  };

  const handleToggleMenu = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative ${wrapperClass}`}
      id={`${id}-wrapper`}
      data-custom-select
    >
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
          {icon}
        </span>
      )}

      <input
        type="hidden"
        id={id}
        name={name || id}
        value={selectedValue}
        required={required}
        readOnly
        data-select-input
      />

      <button
        type="button"
        id={`${id}-trigger`}
        className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${triggerClass}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-menu`}
        disabled={disabled}
        onClick={handleToggleMenu}
        data-select-trigger
      >
        <span
          data-select-label
          className={selectedOption ? 'text-gray-700' : 'text-gray-500'}
        >
          {selectedOption?.label || placeholder}
        </span>
        <svg
          fill="currentColor"
          aria-hidden="true"
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 0 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div
        id={`${id}-menu`}
        className={`${isOpen ? 'block' : 'hidden'} absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl ${menuClass}`}
        role="listbox"
        tabIndex={-1}
        data-select-menu
      >
        {options.map((option) => {
          const isSelected = option.value === selectedValue;

          return (
            <button
              key={option.value}
              type="button"
              role="option"
              data-select-option
              data-value={option.value}
              data-label={option.label}
              className={`w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : ''} ${optionClass}`}
              aria-selected={isSelected}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
