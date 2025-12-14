/**
 * Desenha texto com quebra de linha automática
 */
export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

/**
 * Desenha um retângulo com bordas arredondadas
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Desenha um gradiente linear
 */
export function createLinearGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  colorStops: Array<{ offset: number; color: string }>
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  colorStops.forEach(({ offset, color }) => {
    gradient.addColorStop(offset, color);
  });
  return gradient;
}

/**
 * Desenha sombra para texto ou formas
 */
export function applyShadow(
  ctx: CanvasRenderingContext2D,
  blur: number = 10,
  offsetX: number = 0,
  offsetY: number = 5,
  color: string = 'rgba(0, 0, 0, 0.3)'
): void {
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = offsetX;
  ctx.shadowOffsetY = offsetY;
  ctx.shadowColor = color;
}

/**
 * Remove sombra
 */
export function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = 'transparent';
}

/**
 * Centraliza texto horizontalmente
 */
export function centerText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number
): void {
  const metrics = ctx.measureText(text);
  const textX = x + (width - metrics.width) / 2;
  ctx.fillText(text, textX, y);
}

