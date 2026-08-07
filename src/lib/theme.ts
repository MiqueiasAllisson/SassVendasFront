/**
 * Aplica uma cor de marca em runtime, escrevendo as variáveis --brand-*.
 *
 * É assim que a cor da empresa selecionada no login "pinta" o sistema sem
 * rebuild: uma escala de 50 a 900 derivada de um único HEX.
 */

type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb | null {
  const normalized = hex.replace('#', '').trim();

  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Mistura com branco (amount > 0) ou preto (amount < 0). */
function mix({ r, g, b }: Rgb, amount: number): Rgb {
  const target = amount > 0 ? 255 : 0;
  const ratio = Math.abs(amount);
  return {
    r: Math.round(r + (target - r) * ratio),
    g: Math.round(g + (target - g) * ratio),
    b: Math.round(b + (target - b) * ratio),
  };
}

/** Passos relativos ao tom 600, que é o da cor informada. */
const SCALE: Array<[shade: number, amount: number]> = [
  [50, 0.95],
  [100, 0.88],
  [200, 0.75],
  [300, 0.58],
  [400, 0.34],
  [500, 0.16],
  [600, 0],
  [700, -0.16],
  [800, -0.3],
  [900, -0.45],
];

export function applyBrandColor(hex: string | null | undefined): void {
  if (!hex) return;

  const base = hexToRgb(hex);
  if (!base) return;

  const root = document.documentElement;
  for (const [shade, amount] of SCALE) {
    const { r, g, b } = mix(base, amount);
    root.style.setProperty(`--brand-${shade}`, `${r} ${g} ${b}`);
  }
}

/** Volta para a paleta padrão definida em index.css. */
export function resetBrandColor(): void {
  const root = document.documentElement;
  for (const [shade] of SCALE) {
    root.style.removeProperty(`--brand-${shade}`);
  }
}
