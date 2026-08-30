import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  createElement,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  paletteNames,
  paletteThemes,
  radius,
  type PaletteName,
} from '@/constants/colors';

const PALETTE_KEY = 'little-list-palette';

type PaletteContextValue = {
  paletteName: PaletteName;
  setPaletteName: (paletteName: PaletteName) => void;
};

const PaletteContext = createContext<PaletteContextValue>({
  paletteName: 'berry',
  setPaletteName: () => undefined,
});

export function PaletteProvider({ children }: PropsWithChildren) {
  const [paletteName, setPaletteNameState] = useState<PaletteName>('berry');
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(PALETTE_KEY)
      .then((savedPalette) => {
        if (savedPalette && paletteNames.includes(savedPalette as PaletteName)) {
          setPaletteNameState(savedPalette as PaletteName);
        }
      })
      .finally(() => setHasLoaded(true));
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    void AsyncStorage.setItem(PALETTE_KEY, paletteName);
  }, [hasLoaded, paletteName]);

  const value = useMemo(
    () => ({
      paletteName,
      setPaletteName: setPaletteNameState,
    }),
    [paletteName],
  );

  return createElement(PaletteContext.Provider, { value }, children);
}

/**
 * Returns the design tokens for the current color scheme.
 *
 * The returned object contains all color tokens for the active palette
 * plus scheme-independent values like `radius`.
 *
 * Falls back to the light palette when no dark key is defined in
 * constants/colors.ts (the scaffold ships light-only by default).
 * When a sibling web artifact's dark tokens are synced into a `dark`
 * key, this hook will automatically switch palettes based on the
 * device's appearance setting.
 */
export function useColors() {
  const scheme = useColorScheme();
  const { paletteName, setPaletteName } = useContext(PaletteContext);
  const palette = paletteThemes[paletteName][scheme === 'dark' ? 'dark' : 'light'];
  return { ...palette, paletteName, radius, setPaletteName };
}
