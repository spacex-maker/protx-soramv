import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    mode: 'light' | 'dark';
    setTheme?: (mode: 'light' | 'dark') => void;
  }
}
