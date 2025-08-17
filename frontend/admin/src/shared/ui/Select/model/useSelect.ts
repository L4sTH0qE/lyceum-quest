import { useState, useEffect } from "react";
import { useDropdown } from "./useDropdown";

export const useSelect = (initialValue?: string, dropdownKey?: string) => {
  const { openDropdown, setOpenDropdown } = useDropdown();
  const [selectedKey, setSelectedKey] = useState<string | null>(
    initialValue || null
  );

  useEffect(() => {
    if (initialValue) {
      setSelectedKey(initialValue);
    } else {
      setSelectedKey(null);
    }
  }, [initialValue]);

  const isOpen = openDropdown === dropdownKey;

  const toggleDropdown = () => {
    setOpenDropdown(isOpen ? null : dropdownKey || null);
  };

  const handleSelect = (key: string, onSelect: (key: string) => void) => {
    setSelectedKey(key);
    onSelect(key);
    setOpenDropdown(null);
  };

  return {
    isOpen,
    selectedKey,
    toggleDropdown,
    handleSelect,
  };
};
