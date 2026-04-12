/**
 * RichThemeProvider + useRichTheme — context for color system and theme.
 *
 * Avoids prop-drilling colorSystem to every component.
 *
 * [LAW:single-enforcer] Color system is set once at the provider boundary,
 * not per-component.
 */

import React, { createContext, useContext, useMemo } from "react";
import { ColorSystem } from "rich-js";
import type { Theme } from "rich-js";

export interface RichThemeContextValue {
  colorSystem: ColorSystem;
  theme: Theme | undefined;
}

const RichThemeContext = createContext<RichThemeContextValue>({
  colorSystem: ColorSystem.TRUECOLOR,
  theme: undefined,
});

export interface RichThemeProviderProps {
  /** Color system for ANSI output. */
  colorSystem?: ColorSystem;
  /** Custom theme. */
  theme?: Theme;
  children: React.ReactNode;
}

export function RichThemeProvider({
  colorSystem = ColorSystem.TRUECOLOR,
  theme,
  children,
}: RichThemeProviderProps): React.JSX.Element {
  const value = useMemo(
    () => ({ colorSystem, theme }),
    [colorSystem, theme],
  );

  return (
    <RichThemeContext.Provider value={value}>
      {children}
    </RichThemeContext.Provider>
  );
}

export function useRichTheme(): RichThemeContextValue {
  return useContext(RichThemeContext);
}
