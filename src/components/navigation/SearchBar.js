import React from "react";
import styled from "styled-components";
import tw from "twin.macro";

const SearchContainer = styled.div`
  ${tw`relative`}
  width: 300px;
  transition: width 0.3s ease;

  &:hover, &:focus-within {
    width: 600px;
  }
`;

const SearchBox = styled.div`
  ${tw`relative flex items-center w-full h-12`}
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.25);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  &:focus-within {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25),
                0 0 0 2px rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
`;

const SearchIcon = styled.i`
  ${tw`absolute text-gray-300 transition-colors duration-200`}
  left: 1.25rem;
  font-size: 1.1rem;

  ${SearchBox}:focus-within & {
    ${tw`text-white`}
  }
`;

const Input = styled.input`
  ${tw`w-full h-full text-white bg-transparent outline-none`}
  padding: 0 3.5rem;
  font-size: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
    text-shadow: none;
    transition: color 0.3s ease;
  }

  &:focus::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const ClearButton = styled.button`
  ${tw`absolute text-gray-300 hover:text-white transition-all duration-200`}
  right: 1.25rem;
  font-size: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SearchBar = ({ value, onChange, onClear }) => {
  return (
    <SearchContainer>
      <SearchBox>
        <SearchIcon className="bi bi-search" />
        <Input
          type="text"
          placeholder="搜索网站、服务或应用..."
          value={value}
          onChange={onChange}
        />
        {value && (
          <ClearButton onClick={onClear}>
            <i className="bi bi-x-lg"></i>
          </ClearButton>
        )}
      </SearchBox>
    </SearchContainer>
  );
};

export default SearchBar; 