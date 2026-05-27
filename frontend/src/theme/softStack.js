import { useEffect, useState } from 'react';

// Two complete palettes, switched live by prefers-color-scheme.
// Saturated brand tints (MINT, CREAM_DEEP, LAVENDER_DEEP) stay
// bright in both modes; surfaces, hairlines and shadows invert.
export const LIGHT = {
  INK:           '#0E0E0C',
  SUBINK:        '#6B6B66',
  PAPER:         '#FAFAF7',
  CARD:          '#FFFFFF',
  CARD_2:        '#FBFBF6',
  CARD_3:        '#F4F2EC',
  MINT:          '#7BE495',
  MINT_DEEP:     '#3FBF7F',
  MINT_BG:       '#E8FBEE',
  LAVENDER:      '#E9E4FF',
  LAVENDER_MID:  '#F5F1FF',
  LAVENDER_DEEP: '#A89BFF',
  LAVENDER_TEXT: '#3D2F8F',
  LAVENDER_TINT: '#F7F4FF',
  MINT_TINT:     '#F2FBF6',
  CREAM_CHIP:    '#FFF1D6',
  CREAM_DEEP:    '#B17900',
  RED_BG:        '#FDECEC',
  RED_BG_2:      '#FDE7E7',
  RED_DEEP:      '#C9453C',
  TINT_MINT:     '#7BE495',
  TINT_LAV:      '#E9E4FF',
  TINT_CREAM:    '#FFE9B8',
  HAIR_FAINT:    'rgba(14,14,12,0.04)',
  HAIR_LIGHT:    'rgba(14,14,12,0.05)',
  HAIR:          'rgba(14,14,12,0.06)',
  HAIR_HEAVY:    'rgba(14,14,12,0.07)',
  HAIR_DIV:      'rgba(14,14,12,0.08)',
  HAIR_STRONG:   'rgba(14,14,12,0.12)',
  SH_CARD:       '0 20px 60px -20px rgba(14,14,12,0.12)',
  SH_API:        '0 20px 60px -20px rgba(14,14,12,0.1)',
  SH_STATS:      '0 20px 60px -20px rgba(14,14,12,0.1)',
  SH_HERO:       '0 40px 80px -28px rgba(14,14,12,0.28), 0 14px 30px -14px rgba(14,14,12,0.12)',
  SH_BACK_LAV:   '0 26px 60px -22px rgba(61,47,143,0.28), 0 6px 16px -8px rgba(14,14,12,0.06)',
  SH_BACK_MINT:  '0 24px 50px -20px rgba(63,191,127,0.28), 0 6px 14px -8px rgba(14,14,12,0.05)',
  SH_CTA_MINT:   '0 16px 40px -12px rgba(123,228,149,0.7)',
  SH_CTA_MINT_H: '0 22px 48px -12px rgba(123,228,149,0.8)',
  SH_CTA_INK:    '0 10px 24px -10px rgba(14,14,12,0.4)',
  SH_CTA_INK_H:  '0 14px 30px -10px rgba(14,14,12,0.45)',
  SH_CHIP_BTC:   '0 22px 40px -14px rgba(177,121,0,0.35)',
  SH_CHIP_FL:    '0 18px 40px -16px rgba(14,14,12,0.22)',
  SH_NAV_LOGO:   '0 8px 20px -8px rgba(123,228,149,0.55)',
  SH_BADGE_LAV:  '0 8px 20px -10px rgba(168,155,255,0.6)',
  SH_PILL:       '0 8px 24px -16px rgba(14,14,12,0.18)',
  HEADER_BG:     'rgba(250,250,247,0.82)',
  BLOB_MINT:     'rgba(123,228,149,0.20)',
  BLOB_LAV:      'rgba(233,228,255,0.60)',
  BLOB_CREAM:    'rgba(255,233,184,0.67)',
  CHIP_BG:       '#FFFFFF',
  CTA_INK_BG:    '#0E0E0C',
  CTA_INK_FG:    '#FAFAF7',
  PREVIEW_BADGE_BORDER: '#FFFFFF',
  CREAM_CHIP_BORDER: 'rgba(177,121,0,0.25)',
  MINT_CIRCLE_BORDER: 'rgba(63,191,127,0.35)',
  ON_TINT:       '#0E0E0C',
};

export const DARK = {
  INK:           '#F2EFE8',
  SUBINK:        'rgba(242,239,232,0.62)',
  PAPER:         '#0B0C10',
  CARD:          '#13151B',
  CARD_2:        '#161821',
  CARD_3:        '#1B1E29',
  MINT:          '#7BE495',
  MINT_DEEP:     '#A6F0B5',
  MINT_BG:       'rgba(123,228,149,0.14)',
  LAVENDER:      '#1F1A3A',
  LAVENDER_MID:  '#1B1738',
  LAVENDER_DEEP: '#C7BAFF',
  LAVENDER_TEXT: '#C7BAFF',
  LAVENDER_TINT: '#1A1738',
  MINT_TINT:     '#142922',
  CREAM_CHIP:    'rgba(255,210,122,0.18)',
  CREAM_DEEP:    '#FFD27A',
  RED_BG:        'rgba(255,143,160,0.14)',
  RED_BG_2:      'rgba(255,143,160,0.10)',
  RED_DEEP:      '#FF8FA0',
  TINT_MINT:     'rgba(123,228,149,0.18)',
  TINT_LAV:      'rgba(199,186,255,0.18)',
  TINT_CREAM:    'rgba(255,210,122,0.18)',
  HAIR_FAINT:    'rgba(242,239,232,0.05)',
  HAIR_LIGHT:    'rgba(242,239,232,0.07)',
  HAIR:          'rgba(242,239,232,0.08)',
  HAIR_HEAVY:    'rgba(242,239,232,0.10)',
  HAIR_DIV:      'rgba(242,239,232,0.12)',
  HAIR_STRONG:   'rgba(242,239,232,0.18)',
  SH_CARD:       '0 24px 60px -20px rgba(0,0,0,0.55), 0 2px 8px -4px rgba(0,0,0,0.4)',
  SH_API:        '0 24px 60px -20px rgba(0,0,0,0.55)',
  SH_STATS:      '0 28px 70px -22px rgba(0,0,0,0.6)',
  SH_HERO:       '0 50px 90px -28px rgba(0,0,0,0.7), 0 14px 30px -14px rgba(0,0,0,0.4)',
  SH_BACK_LAV:   '0 30px 60px -22px rgba(0,0,0,0.6), 0 6px 16px -8px rgba(0,0,0,0.35)',
  SH_BACK_MINT:  '0 28px 50px -20px rgba(0,0,0,0.55), 0 6px 14px -8px rgba(0,0,0,0.3)',
  SH_CTA_MINT:   '0 16px 40px -10px rgba(123,228,149,0.38)',
  SH_CTA_MINT_H: '0 22px 48px -10px rgba(123,228,149,0.5)',
  SH_CTA_INK:    '0 10px 30px -10px rgba(0,0,0,0.7)',
  SH_CTA_INK_H:  '0 14px 36px -10px rgba(0,0,0,0.8)',
  SH_CHIP_BTC:   '0 22px 40px -14px rgba(255,210,122,0.28)',
  SH_CHIP_FL:    '0 18px 40px -16px rgba(0,0,0,0.55)',
  SH_NAV_LOGO:   '0 8px 20px -8px rgba(123,228,149,0.32)',
  SH_BADGE_LAV:  '0 8px 20px -10px rgba(199,186,255,0.42)',
  SH_PILL:       '0 8px 24px -16px rgba(0,0,0,0.6)',
  HEADER_BG:     'rgba(11,12,16,0.78)',
  BLOB_MINT:     'rgba(123,228,149,0.16)',
  BLOB_LAV:      'rgba(199,186,255,0.18)',
  BLOB_CREAM:    'rgba(255,210,122,0.14)',
  CHIP_BG:       '#13151B',
  CTA_INK_BG:    '#F2EFE8',
  CTA_INK_FG:    '#0B0C10',
  PREVIEW_BADGE_BORDER: '#13151B',
  CREAM_CHIP_BORDER: 'rgba(255,210,122,0.32)',
  MINT_CIRCLE_BORDER: 'rgba(166,240,181,0.32)',
  ON_TINT:       '#0E0E0C',
};

export const headlineStyle = {
  fontFamily: "'General Sans', 'Geist', ui-sans-serif, system-ui, sans-serif",
  letterSpacing: '-0.01em',
};

export const monoStyle = {
  fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
};

export const bodyFontFamily = "'Geist', ui-sans-serif, system-ui, sans-serif";

export const usePrefersDark = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setIsDark(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isDark;
};

export const useTheme = () => (usePrefersDark() ? DARK : LIGHT);
