import { useState } from 'react';

export const useSearch = (files) => {
  const [searchText, setSearchText] = useState('');
  const [filteredFiles, setFilteredFiles] = useState(files);

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredFiles(files);
      return;
    }

    const searchValue = value.toLowerCase();
    const filtered = files.filter(file => {
      const name = file.name.toLowerCase();
      return name.includes(searchValue);
    });
    setFilteredFiles(filtered);
  };

  return {
    searchText,
    setSearchText,
    filteredFiles,
    setFilteredFiles,
    handleSearch
  };
}; 