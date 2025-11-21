import React from 'react';
import { ReactComponent as SunIcon } from "feather-icons/dist/icons/sun.svg";
import { ReactComponent as MoonIcon } from "feather-icons/dist/icons/moon.svg";
import { DarkModeButton } from './styles';

const DarkModeToggle = ({ isDark, toggleDarkMode }) => {
  return (
    <DarkModeButton 
      onClick={toggleDarkMode}
      aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </DarkModeButton>
  );
};

export default DarkModeToggle; 