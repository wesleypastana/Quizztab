import { Question } from '../types/quiz';
import { QuizConfig } from '../types/config';
import { VideoSettings } from '../types/video';
import { QuizTemplate } from '../types/template';
import {
  drawWrappedText,
  drawRoundedRect,
  createLinearGradient,
  applyShadow,
  clearShadow,
  centerText,
} from '../utils/canvasHelpers';
import { interpolateColor, fade } from '../utils/animations';

// Helper functions para manipular cores
function lightenColor(color: string, percent: number): string {
  if (color.startsWith('#')) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, Math.floor((num >> 16) + percent * 2.55));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + percent * 2.55));
    const b = Math.min(255, Math.floor((num & 0x0000FF) + percent * 2.55));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  return color;
}

function darkenColor(color: string, percent: number): string {
  if (color.startsWith('#')) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.floor((num >> 16) - percent * 2.55));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) - percent * 2.55));
    const b = Math.max(0, Math.floor((num & 0x0000FF) - percent * 2.55));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  return color;
}

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  config: QuizConfig;
  settings: VideoSettings;
  template: QuizTemplate;
  questionBadgeText?: string; // Texto traduzido para o badge "PERGUNTA"
}

/**
 * Renderiza o background do canvas com design moderno
 */
export function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor: string,
  theme?: string,
  template?: QuizTemplate
): void {
  // Background com gradiente moderno
  let gradient: CanvasGradient;
  
  // Prioridade: tema > template com gradiente > cor sólida
  if (theme) {
    // Usa gradiente do tema se disponível (tem prioridade)
    const themeGradient = getThemeGradient(ctx, width, height, theme);
    if (themeGradient) {
      gradient = themeGradient;
    } else if (template?.gradientEnabled && template?.backgroundColor) {
      // Se não tem tema mas tem template com gradiente, usa o template
      gradient = ctx.createLinearGradient(0, 0, width, height);
      const baseColor = template.backgroundColor;
      const lighter = lightenColor(baseColor, 15);
      const darker = darkenColor(baseColor, 10);
      gradient.addColorStop(0, lighter);
      gradient.addColorStop(0.5, baseColor);
      gradient.addColorStop(1, darker);
    } else {
      // Fallback para gradiente padrão
      gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
    }
  } else if (template?.gradientEnabled && template?.backgroundColor) {
    // Template com gradiente habilitado
    gradient = ctx.createLinearGradient(0, 0, width, height);
    const baseColor = template.backgroundColor;
    const lighter = lightenColor(baseColor, 15);
    const darker = darkenColor(baseColor, 10);
    gradient.addColorStop(0, lighter);
    gradient.addColorStop(0.5, baseColor);
    gradient.addColorStop(1, darker);
  } else {
    // Cor sólida do template ou fallback
    const bgColor = template?.backgroundColor || backgroundColor;
    if (template?.gradientEnabled === false) {
      // Se gradiente está explicitamente desabilitado, usa cor sólida
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      return;
    } else {
      // Cria gradiente sutil mesmo sem gradienteEnabled
      gradient = ctx.createLinearGradient(0, 0, width, height);
      const lighter = lightenColor(bgColor, 10);
      const darker = darkenColor(bgColor, 5);
      gradient.addColorStop(0, lighter);
      gradient.addColorStop(1, darker);
    }
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Adiciona padrão de pontos sutis para textura (apenas se glassmorphism estiver ativo)
  if (template?.glassmorphism) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    const dotSize = 2;
    const spacing = 40;
    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/**
 * Obtém gradiente baseado no tema
 */
function getThemeGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: string
): CanvasGradient | null {
  // Gradientes modernos e vibrantes
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  
  const gradients: Record<string, Array<{ offset: number; color: string }>> = {
    default: [
      { offset: 0, color: '#667eea' },
      { offset: 0.5, color: '#764ba2' },
      { offset: 1, color: '#f093fb' },
    ],
    science: [
      { offset: 0, color: '#f093fb' },
      { offset: 0.5, color: '#f5576c' },
      { offset: 1, color: '#4facfe' },
    ],
    history: [
      { offset: 0, color: '#4facfe' },
      { offset: 0.5, color: '#00f2fe' },
      { offset: 1, color: '#667eea' },
    ],
    geography: [
      { offset: 0, color: '#43e97b' },
      { offset: 0.5, color: '#38f9d7' },
      { offset: 1, color: '#4facfe' },
    ],
    sports: [
      { offset: 0, color: '#fa709a' },
      { offset: 0.5, color: '#fee140' },
      { offset: 1, color: '#f5576c' },
    ],
    entertainment: [
      { offset: 0, color: '#30cfd0' },
      { offset: 0.5, color: '#330867' },
      { offset: 1, color: '#764ba2' },
    ],
  };

  const colors = gradients[theme];
  if (!colors) return null;

  colors.forEach(({ offset, color }) => {
    gradient.addColorStop(offset, color);
  });

  return gradient;
}

/**
 * Renderiza a pergunta com design moderno
 */
export function renderQuestion(
  ctx: CanvasRenderingContext2D,
  question: Question,
  width: number,
  height: number,
  textColor: string,
  animationProgress: number = 1,
  template?: QuizTemplate,
  questionBadgeText?: string
): void {
  const padding = template?.padding ?? 80;
  const maxWidth = width - padding * 2;
  const questionY = height * 0.12;
  const questionFontSize = template?.questionFontSize ?? 52;
  const questionFont = template?.questionFont ?? '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const borderRadius = template?.borderRadius ?? 24;
  const shadowBlur = template?.shadowBlur ?? 15;

  ctx.save();

  // Aplica animação de fade
  const alpha = fade(animationProgress);
  ctx.globalAlpha = alpha;

  // Badge "PERGUNTA" no topo - proporcional ao padding
  const badgeText = questionBadgeText || 'PERGUNTA'; // Usa texto traduzido ou padrão
  const badgeY = questionY - (padding * 0.6);
  const badgeHeight = padding * 0.5; // Proporcional ao padding
  const badgeFontSize = Math.max(12, Math.round(questionFontSize * 0.35)); // Proporcional à fonte da pergunta
  
  // Calcula a largura do texto para determinar o tamanho do badge
  ctx.save();
  ctx.font = `bold ${badgeFontSize}px ${questionFont}`;
  const textMetrics = ctx.measureText(badgeText);
  const textWidth = textMetrics.width;
  ctx.restore();
  
  // Padding horizontal e vertical do badge
  const badgePaddingX = padding * 0.3; // Padding horizontal
  const badgePaddingY = badgeHeight * 0.2; // Padding vertical (20% da altura)
  const badgeWidth = textWidth + (badgePaddingX * 2); // Largura baseada no texto + padding
  const badgeX = padding;
  const badgeRadius = borderRadius * 0.8;
  
  // Fundo do badge com glassmorphism
  drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, badgeRadius);
  ctx.fillStyle = template?.questionBgColor ?? 'rgba(255, 255, 255, 0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Texto do badge - centralizado horizontal e verticalmente com padding correto
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${badgeFontSize}px ${questionFont}`;
  ctx.textAlign = 'center'; // Centraliza horizontalmente
  ctx.textBaseline = 'middle'; // Centraliza verticalmente
  const badgeTextX = badgeX + badgeWidth / 2; // Centro horizontal do badge
  const badgeTextY = badgeY + badgeHeight / 2; // Centro vertical do badge
  ctx.fillText(badgeText, badgeTextX, badgeTextY);

  // Estilo do texto da pergunta - usa valores do template
  ctx.fillStyle = textColor;
  ctx.font = `bold ${questionFontSize}px ${questionFont}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Sombra usando valores do template
  const shadowColor = template?.shadowColor ?? 'rgba(0, 0, 0, 0.6)';
  applyShadow(ctx, shadowBlur, 0, 8, shadowColor);

  // Desenha a pergunta com quebra de linha
  const lineHeight = questionFontSize * 1.3;
  drawWrappedText(ctx, question.text, padding, questionY + 20, maxWidth, lineHeight);

  clearShadow(ctx);
  ctx.restore();
}

/**
 * Renderiza as opções de resposta com design moderno e alinhamento perfeito
 */
export function renderAnswerOptions(
  ctx: CanvasRenderingContext2D,
  question: Question,
  width: number,
  height: number,
  textColor: string,
  backgroundColor: string,
  correctAnswerValue: string | null,
  animationProgress: number = 1,
  template?: QuizTemplate
): void {
  const padding = template?.padding ?? 80;
  const optionWidth = width - padding * 2;
  const optionHeight = template?.optionHeight ?? 140;
  const optionSpacing = template?.optionSpacing ?? 20;
  const startY = height * 0.42;
  const optionBorderRadius = template?.optionBorderRadius ?? 24;
  const optionFontSize = template?.optionFontSize ?? 38;
  const letterFontSize = template?.letterFontSize ?? 36;
  const optionFont = template?.optionFont ?? '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const optionBgColor = template?.optionBgColor ?? 'rgba(255, 255, 255, 0.12)';
  const correctAnswerColor = template?.correctAnswerColor ?? '#4ade80';
  const shadowBlur = template?.shadowBlur ?? 15;

  ctx.save();

  const alpha = fade(animationProgress);
  ctx.globalAlpha = alpha;

  question.options.forEach((option, index) => {
    const y = startY + index * (optionHeight + optionSpacing);
    const isCorrect = correctAnswerValue !== null && option === correctAnswerValue;
    const centerY = y + optionHeight / 2;

    // Letra da opção (A, B, C, D) - proporcional
    const letter = String.fromCharCode(65 + index); // A, B, C, D
    const circleRadius = Math.round(optionHeight * 0.27); // Proporcional à altura da opção
    const letterX = padding + (padding * 0.375) + circleRadius;
    const letterY = centerY;

    // Background da opção com glassmorphism e gradiente
    drawRoundedRect(ctx, padding, y, optionWidth, optionHeight, optionBorderRadius);
    
    if (isCorrect) {
      // Gradiente para resposta correta - usa cor do template
      const gradient = ctx.createLinearGradient(padding, y, padding + optionWidth, y + optionHeight);
      // Cria um gradiente sutil com a cor do template
      const lighterColor = lightenColor(correctAnswerColor, 10);
      gradient.addColorStop(0, lighterColor);
      gradient.addColorStop(0.5, correctAnswerColor);
      gradient.addColorStop(1, darkenColor(correctAnswerColor, 10));
      ctx.fillStyle = gradient;
    } else {
      // Glassmorphism melhorado para opções normais - sempre usa cor do template
      ctx.fillStyle = optionBgColor;
    }
    ctx.fill();

    // Sombra sutil no card
    if (!isCorrect) {
      const shadowColor = template?.shadowColor ?? 'rgba(0, 0, 0, 0.2)';
      applyShadow(ctx, shadowBlur, 0, 10, shadowColor);
    }
    
    // Borda moderna
    if (isCorrect) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
    }
    ctx.stroke();
    
    if (!isCorrect) {
      clearShadow(ctx);
    }

    // Círculo com letra - melhor posicionado
    ctx.beginPath();
    ctx.arc(letterX, letterY, circleRadius, 0, Math.PI * 2);
    
    if (isCorrect) {
      ctx.fillStyle = '#ffffff';
    } else {
      // Gradiente sutil no círculo
      const circleGradient = ctx.createRadialGradient(
        letterX - 10, letterY - 10, 0,
        letterX, letterY, circleRadius
      );
      circleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      circleGradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
      ctx.fillStyle = circleGradient;
    }
    ctx.fill();
    
    ctx.strokeStyle = isCorrect ? '#22c55e' : 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Texto da letra - centralizado perfeitamente - usa valores do template
    ctx.fillStyle = isCorrect ? correctAnswerColor : '#ffffff';
    ctx.font = `bold ${letterFontSize}px ${optionFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    applyShadow(ctx, 5, 0, 3, 'rgba(0, 0, 0, 0.4)');
    ctx.fillText(letter, letterX, letterY);
    clearShadow(ctx);

    // Texto da opção - centralizado verticalmente no card, alinhado com a letra
    const textStartX = letterX + circleRadius + (padding * 0.375);
    const textEndX = padding + optionWidth - (padding * 0.375);
    const maxTextWidth = textEndX - textStartX;
    const textX = textStartX;
    const textY = centerY; // Mesma posição Y da letra para alinhamento perfeito

    ctx.fillStyle = isCorrect ? '#ffffff' : textColor;
    ctx.font = `${optionFontSize}px ${optionFont}`;
    ctx.textAlign = 'left';
    
    // Sombra no texto para legibilidade
    if (!isCorrect) {
      const shadowColor = template?.shadowColor ?? 'rgba(0, 0, 0, 0.6)';
      applyShadow(ctx, shadowBlur, 0, 5, shadowColor);
    }
    
    // Calcula o texto quebrado em linhas
    const lineHeight = optionFontSize * 1.26;
    const words = option.split(' ');
    let line = '';
    let lines: string[] = [];
    
    // Calcula quantas linhas serão necessárias
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxTextWidth && i > 0) {
        lines.push(line.trim());
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    if (line.trim()) {
      lines.push(line.trim());
    }
    
    // Calcula a posição Y inicial para centralizar verticalmente no card
    // O texto deve estar centralizado verticalmente, alinhado com a letra
    const totalHeight = lines.length * lineHeight;
    // textBaseline 'middle' significa que o Y é o centro do texto
    // Para centralizar múltiplas linhas, calculamos a partir do centro
    const firstLineY = textY - (totalHeight / 2) + (lineHeight / 2);
    
    // Desenha cada linha centralizada verticalmente
    ctx.textBaseline = 'middle'; // Usa middle para centralizar cada linha
    lines.forEach((lineText, lineIndex) => {
      const lineY = firstLineY + (lineIndex * lineHeight);
      ctx.fillText(lineText, textX, lineY);
    });
    
    if (!isCorrect) {
      clearShadow(ctx);
    }

    // Ícone de correto se for a resposta certa - proporcional
    if (isCorrect) {
      const checkX = padding + optionWidth - (padding * 0.6875);
      const checkY = centerY;
      const checkRadius = Math.round(optionHeight * 0.2); // Proporcional à altura
      
      // Círculo de fundo para o check
      ctx.beginPath();
      ctx.arc(checkX, checkY, checkRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
      // Check mark mais bonito - proporcional
      ctx.strokeStyle = correctAnswerColor;
      ctx.lineWidth = Math.max(3, Math.round(optionHeight * 0.036));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(checkX - checkRadius * 0.43, checkY);
      ctx.lineTo(checkX - checkRadius * 0.14, checkY + checkRadius * 0.29);
      ctx.lineTo(checkX + checkRadius * 0.43, checkY - checkRadius * 0.29);
      ctx.stroke();
    }
  });

  ctx.restore();
}

/**
 * Renderiza o timer com design moderno
 */
export function renderTimer(
  ctx: CanvasRenderingContext2D,
  currentTime: number,
  totalTime: number,
  width: number,
  height: number,
  textColor: string,
  template?: QuizTemplate
): void {
  const padding = template?.padding ?? 80;
  const timerY = height * 0.32;
  const timerWidth = width - padding * 2;
  const timerHeight = Math.max(8, Math.round(padding * 0.175)); // Proporcional ao padding
  const timerX = padding;
  const timerBorderRadius = template?.timerBorderRadius ?? 7;
  const timerFontSize = template?.timerFontSize ?? 48;
  const timerFont = template?.timerFont ?? '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const timerBgColor = template?.timerBgColor ?? 'rgba(255, 255, 255, 0.15)';
  const timerProgressColor = template?.timerProgressColor ?? '#4ade80';
  const timerTextColor = template?.timerTextColor ?? '#ffffff';

  ctx.save();

  // Barra de fundo com glassmorphism - usa valores do template
  drawRoundedRect(ctx, timerX, timerY, timerWidth, timerHeight, timerBorderRadius);
  ctx.fillStyle = timerBgColor;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Barra de progresso com gradiente
  const progress = Math.max(0, Math.min(1, currentTime / totalTime));
  const progressWidth = timerWidth * progress;

  if (progressWidth > 0) {
    drawRoundedRect(ctx, timerX, timerY, progressWidth, timerHeight, timerBorderRadius);
    
    // Gradiente que muda conforme o tempo diminui
    const gradient = ctx.createLinearGradient(timerX, timerY, timerX + progressWidth, timerY + timerHeight);
    
    if (progress < 0.3) {
      // Vermelho quando está acabando
      gradient.addColorStop(0, '#ef4444');
      gradient.addColorStop(1, '#dc2626');
    } else if (progress < 0.6) {
      // Amarelo
      gradient.addColorStop(0, '#fbbf24');
      gradient.addColorStop(1, '#f59e0b');
    } else {
      // Verde - usa cor do template
      gradient.addColorStop(0, timerProgressColor);
      gradient.addColorStop(1, timerProgressColor);
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Brilho no topo da barra
    if (progressWidth > 5) {
      const shineGradient = ctx.createLinearGradient(timerX, timerY, timerX, timerY + timerHeight / 2);
      shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = shineGradient;
      drawRoundedRect(ctx, timerX, timerY, progressWidth, timerHeight / 2, 7);
      ctx.fill();
    }
  }

  // Texto do timer - sempre renderiza
  const roundedTime = Math.max(0, Math.ceil(currentTime));
  const timeText = roundedTime.toString();
  
  // Posição do texto do timer - proporcional
  const textX = width / 2;
  const textY = timerY - (padding * 0.75);
  const textBgWidth = padding * 1.5;
  const textBgHeight = padding * 0.875;
  
  // Fundo do texto com glassmorphism - proporcional
  const textBgRadius = Math.round(padding * 0.1875);
  drawRoundedRect(ctx, textX - textBgWidth / 2, textY - textBgHeight / 2, textBgWidth, textBgHeight, textBgRadius);
  
  // Gradiente de fundo
  const bgGradient = ctx.createLinearGradient(
    textX - textBgWidth / 2, 
    textY - textBgHeight / 2,
    textX + textBgWidth / 2,
    textY + textBgHeight / 2
  );
  bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
  bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
  ctx.fillStyle = bgGradient;
  ctx.fill();
  
  // Borda sutil
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Texto do timer - usa valores do template
  ctx.fillStyle = timerTextColor;
  ctx.font = `bold ${timerFontSize}px ${timerFont}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Sombra para legibilidade
  const shadowColor = template?.shadowColor ?? 'rgba(0, 0, 0, 0.9)';
  const shadowBlur = template?.shadowBlur ?? 12;
  applyShadow(ctx, shadowBlur, 0, 4, shadowColor);
  ctx.fillText(timeText, textX, textY);
  clearShadow(ctx);

  ctx.restore();
}

/**
 * Estado visual renderizado - usado para sincronização de áudio
 */
export interface RenderedVisualState {
  timerValue: number; // Valor visual do timer (Math.ceil(currentTime))
  showAnswer: boolean; // Se a resposta correta está sendo mostrada
  answerIsGreen: boolean; // Se a resposta correta está realmente verde (animação completa)
  questionId: string; // ID da pergunta atual
}

/**
 * Renderiza um frame completo
 * Retorna o estado visual renderizado para sincronização de áudio
 */
export function renderFrame(
  context: RenderContext,
  question: Question,
  currentTime: number,
  totalTime: number,
  animationProgress: number = 1,
  showAnswer: boolean = false
): RenderedVisualState {
  const { ctx, canvas, config, settings } = context;
  const { width, height } = settings;

  // Limpa o canvas completamente antes de renderizar
  // Usa fillRect com a cor de fundo para garantir que não fique transparente
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Reseta transformações e estados do contexto para garantir renderização limpa
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Renderiza background primeiro (preenche todo o canvas) - passa o template
  renderBackground(ctx, width, height, config.backgroundColor, question.theme, context.template);

  // Renderiza pergunta - passa o template e o texto traduzido do badge
  renderQuestion(ctx, question, width, height, config.textColor, animationProgress, context.template, context.questionBadgeText);

  // Calcula o valor visual do timer (igual ao que é renderizado)
  const visualTimerValue = Math.max(0, Math.ceil(currentTime));

  // Renderiza timer ANTES das opções para garantir que apareça
  // Sempre renderiza o timer quando não está mostrando a resposta
  // IMPORTANTE: Renderiza o timer mesmo quando currentTime é 0
  if (!showAnswer) {
    renderTimer(ctx, currentTime, totalTime, width, height, config.textColor, context.template);
  }

  // Renderiza opções por último (sobrepõe tudo) - passa o template
  renderAnswerOptions(
    ctx,
    question,
    width,
    height,
    config.textColor,
    config.backgroundColor,
    showAnswer ? question.correctAnswer : null,
    animationProgress,
    context.template
  );

  // Retorna o estado visual renderizado
  // answerIsGreen é true quando showAnswer é true E a animação completou (animationProgress >= 1)
  return {
    timerValue: visualTimerValue,
    showAnswer: showAnswer,
    answerIsGreen: showAnswer && animationProgress >= 1,
    questionId: question.id,
  };
}

