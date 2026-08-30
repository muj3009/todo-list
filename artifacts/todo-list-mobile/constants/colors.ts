/**
 * Semantic design tokens for the Little List colour themes.
 *
 * Each theme keeps the paper checklist structure intact while changing the
 * background, ink, checkbox, rule, and action colours together.
 */

export type Palette = {
  text: string;
  tint: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  sidebarAccent: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  rule: string;
  checkFill: string;
  paperAccent: string;
  completedSurface: string;
  completedText: string;
  completedBorder: string;
  completedCheck: string;
};

type PaletteSeed = {
  text: string;
  primary: string;
  background: string;
  card: string;
  secondary: string;
  sidebarAccent: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  rule: string;
};

type PaletteTheme = {
  label: string;
  swatches: readonly [string, string];
  light: Palette;
  dark: Palette;
};

function makePalette(seed: PaletteSeed): Palette {
  return {
    text: seed.text,
    tint: seed.primary,
    background: seed.background,
    foreground: seed.text,
    card: seed.card,
    cardForeground: seed.text,
    primary: seed.primary,
    primaryForeground: seed.card,
    secondary: seed.secondary,
    secondaryForeground: seed.text,
    sidebarAccent: seed.sidebarAccent,
    muted: seed.muted,
    mutedForeground: seed.mutedForeground,
    accent: seed.accent,
    accentForeground: seed.accentForeground,
    destructive: seed.destructive,
    destructiveForeground: seed.card,
    border: seed.border,
    input: seed.border,
    rule: seed.rule,
    checkFill: seed.primary,
    paperAccent: seed.accent,
    completedSurface: '#ECECEC',
    completedText: '#737373',
    completedBorder: '#C9C9C9',
    completedCheck: '#929292',
  };
}

function makeTheme(
  label: string,
  swatches: readonly [string, string],
  seed: PaletteSeed,
): PaletteTheme {
  return {
    label,
    swatches,
    light: makePalette(seed),
    // The app's paper treatment intentionally stays bright in both device
    // appearance modes so the chosen colour theme remains recognizable.
    dark: makePalette(seed),
  };
}

export const paletteThemes = {
  berry: makeTheme('Berry', ['#8B3D67', '#F2B08F'], {
    text: '#32253B',
    primary: '#8B3D67',
    background: '#F0EAF4',
    card: '#FFFDF8',
    secondary: '#F6EEF3',
    sidebarAccent: '#DCC7D6',
    muted: '#F8F3ED',
    mutedForeground: '#8B7F8D',
    accent: '#F2B08F',
    accentForeground: '#653A33',
    destructive: '#B85F70',
    border: '#E0D2DB',
    rule: '#DCCBD7',
  }),
  ocean: makeTheme('Ocean', ['#236B78', '#F0B77A'], {
    text: '#213A45',
    primary: '#236B78',
    background: '#E7F2F4',
    card: '#FFFCF6',
    secondary: '#EDF6F6',
    sidebarAccent: '#C5DFE2',
    muted: '#F7F3EC',
    mutedForeground: '#78909A',
    accent: '#F0B77A',
    accentForeground: '#60402B',
    destructive: '#B35D5D',
    border: '#D1E2E3',
    rule: '#C7DCDD',
  }),
  citrus: makeTheme('Citrus', ['#C85D2E', '#779B5A'], {
    text: '#463026',
    primary: '#C85D2E',
    background: '#FFF1DE',
    card: '#FFFCF5',
    secondary: '#FFF5E8',
    sidebarAccent: '#EAC9A7',
    muted: '#FAF4EB',
    mutedForeground: '#968274',
    accent: '#779B5A',
    accentForeground: '#F8FFF1',
    destructive: '#B4574B',
    border: '#E9D8C1',
    rule: '#E5CDB0',
  }),
  lavender: makeTheme('Lavender', ['#6654B8', '#E58C9B'], {
    text: '#302A4A',
    primary: '#6654B8',
    background: '#ECEBFA',
    card: '#FFFDF9',
    secondary: '#F2F0FF',
    sidebarAccent: '#D4D0EE',
    muted: '#F8F4F0',
    mutedForeground: '#8A849D',
    accent: '#E58C9B',
    accentForeground: '#623643',
    destructive: '#B35E73',
    border: '#DCD8EF',
    rule: '#D5D0E7',
  }),
  sunburst: makeTheme('Sunburst', ['#E85D04', '#FACC15'], {
    text: '#4A2511',
    primary: '#E85D04',
    background: '#FFF4D6',
    card: '#FFFCF3',
    secondary: '#FFF0BD',
    sidebarAccent: '#F5D38D',
    muted: '#FFF9EC',
    mutedForeground: '#9A785E',
    accent: '#FACC15',
    accentForeground: '#5A3A00',
    destructive: '#C2410C',
    border: '#EFD8AC',
    rule: '#E7CC94',
  }),
  electric: makeTheme('Electric', ['#6D28D9', '#FF4D8D'], {
    text: '#261344',
    primary: '#6D28D9',
    background: '#F3EEFF',
    card: '#FFFCFF',
    secondary: '#F7ECFF',
    sidebarAccent: '#D8C5FF',
    muted: '#FBF8FF',
    mutedForeground: '#84739D',
    accent: '#FF4D8D',
    accentForeground: '#650B35',
    destructive: '#DC2626',
    border: '#E2D7F4',
    rule: '#D6C8EF',
  }),
  aqua: makeTheme('Aqua Punch', ['#007C91', '#FF5C8A'], {
    text: '#073B4C',
    primary: '#007C91',
    background: '#E8FBFF',
    card: '#FFFEFA',
    secondary: '#E8F8FB',
    sidebarAccent: '#BDE8ED',
    muted: '#F3F9F8',
    mutedForeground: '#6C8B90',
    accent: '#FF5C8A',
    accentForeground: '#6B1235',
    destructive: '#C2415B',
    border: '#CDE7E9',
    rule: '#BFE0E4',
  }),
  lime: makeTheme('Lime Fizz', ['#447A2A', '#D9F14A'], {
    text: '#24351E',
    primary: '#447A2A',
    background: '#F3F9E8',
    card: '#FFFEF9',
    secondary: '#EFF8DD',
    sidebarAccent: '#D6E8B8',
    muted: '#F8F8EA',
    mutedForeground: '#77816B',
    accent: '#D9F14A',
    accentForeground: '#384500',
    destructive: '#B45309',
    border: '#DCE7C7',
    rule: '#CADCB0',
  }),
  coral: makeTheme('Coral Crush', ['#E64A45', '#FFB02E'], {
    text: '#4A2627',
    primary: '#E64A45',
    background: '#FFF0EB',
    card: '#FFFCF6',
    secondary: '#FFF0E5',
    sidebarAccent: '#F5C7BB',
    muted: '#FBF3ED',
    mutedForeground: '#9A7770',
    accent: '#FFB02E',
    accentForeground: '#5D3900',
    destructive: '#C2413A',
    border: '#F0D5CB',
    rule: '#EAC6B9',
  }),
  blueberry: makeTheme('Blueberry', ['#2563EB', '#A855F7'], {
    text: '#1E2A52',
    primary: '#2563EB',
    background: '#EEF4FF',
    card: '#FFFEFC',
    secondary: '#EEF2FF',
    sidebarAccent: '#C9D8FA',
    muted: '#F7F7FB',
    mutedForeground: '#71809C',
    accent: '#A855F7',
    accentForeground: '#FFF7FF',
    destructive: '#BE3D61',
    border: '#D5DDF2',
    rule: '#C6D3EF',
  }),
  'pink-lemonade': makeTheme('Pink Lemonade', ['#DB2777', '#FACC15'], {
    text: '#4A1F39',
    primary: '#DB2777',
    background: '#FFF0F7',
    card: '#FFFEFA',
    secondary: '#FFF2F8',
    sidebarAccent: '#F2C8DE',
    muted: '#FFF7F1',
    mutedForeground: '#9B768C',
    accent: '#FACC15',
    accentForeground: '#5B4600',
    destructive: '#C2416B',
    border: '#F0D5E4',
    rule: '#E8C6DB',
  }),
  tropical: makeTheme('Tropical', ['#00875A', '#FF6B35'], {
    text: '#103B32',
    primary: '#00875A',
    background: '#E9FBF4',
    card: '#FFFEF8',
    secondary: '#E8F8F1',
    sidebarAccent: '#BEE5D3',
    muted: '#F4F8F1',
    mutedForeground: '#6D8B7C',
    accent: '#FF6B35',
    accentForeground: '#6A250E',
    destructive: '#C04454',
    border: '#CFE6D7',
    rule: '#BDDCC8',
  }),
} satisfies Record<string, PaletteTheme>;

export type PaletteName = keyof typeof paletteThemes;
export const paletteNames = Object.keys(paletteThemes) as PaletteName[];

// Border radius (in px). This value applies to cards, buttons, inputs, and modals.
export const radius = 14;

const colors = paletteThemes.berry;

export default colors;