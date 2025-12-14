import { useEffect, useRef } from 'react';
import { QuizTemplate } from '../../types/template';
import { renderFrame, RenderContext } from '../../services/videoRenderer';
import { Question } from '../../types/quiz';
import { QuizConfig } from '../../types/config';
import { DEFAULT_VIDEO_SETTINGS } from '../../types/video';
import { VIDEO_RESOLUTIONS } from '../../types/config';
import { useLanguage } from '../../hooks/useLanguage';
import './TemplatePreview.css';

interface TemplatePreviewProps {
  template: QuizTemplate;
  resolution?: '1080x1920' | '720x1280' | '540x960';
}

// Dados mockados para o preview
// Nota: Não usa theme para que o background use o template, não o gradiente do tema
const MOCK_QUESTION: Question = {
  id: 'mock-1',
  text: 'Qual é a capital do Brasil?',
  correctAnswer: 'Brasília',
  options: ['São Paulo', 'Brasília', 'Rio de Janeiro', 'Belo Horizonte'],
  // Não define theme para usar o background do template
};

const MOCK_CONFIG: QuizConfig = {
  questionsPerRound: 10,
  optionsPerQuestion: 4,
  timerPerQuestion: 10,
  themes: [],
  enableMusic: false,
  backgroundColor: '#1a1a2e',
  textColor: '#ffffff',
  videoFormat: 'webm',
  videoResolution: '1080x1920',
};

export function TemplatePreview({ template, resolution = '1080x1920' }: TemplatePreviewProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<number>(10);
  const showAnswerRef = useRef<boolean>(false);
  const renderContextRef = useRef<RenderContext | null>(null);
  const templateRef = useRef<QuizTemplate>(template);
  
  // Atualiza a ref do template sempre que ele mudar
  useEffect(() => {
    templateRef.current = template;
  }, [template]);

  // Atualiza o contexto de renderização quando o template, resolução ou idioma muda
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Usa a mesma resolução do quiz real (não escala)
    const dimensions = VIDEO_RESOLUTIONS[resolution];
    const canvasWidth = dimensions.width;
    const canvasHeight = dimensions.height;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Configura qualidade - exatamente como no quiz real
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Cria o contexto de renderização uma vez - exatamente como no quiz real
    renderContextRef.current = {
      canvas,
      ctx,
      config: {
        ...MOCK_CONFIG,
        backgroundColor: template.backgroundColor,
        textColor: template.textColor,
      },
      settings: {
        ...DEFAULT_VIDEO_SETTINGS,
        width: canvasWidth,
        height: canvasHeight,
      },
      template, // Usa o template original, não escalado
      questionBadgeText: t('quiz.questionBadge'),
    };

    // Reset do timer quando o template ou resolução muda
    timerRef.current = 10;
    showAnswerRef.current = false;

    let lastTime = Date.now();

    // Função de renderização - usa exatamente o mesmo código do quiz
    const render = () => {
      if (!ctx || !renderContextRef.current) return;

      // Atualiza o template no contexto a cada frame para garantir que está sempre atualizado
      const currentTemplate = templateRef.current;
      if (renderContextRef.current) {
        // Atualiza o template completo para garantir que o background seja renderizado corretamente
        renderContextRef.current.template = currentTemplate;
        renderContextRef.current.config.backgroundColor = currentTemplate.backgroundColor;
        renderContextRef.current.config.textColor = currentTemplate.textColor;
        renderContextRef.current.questionBadgeText = t('quiz.questionBadge');
      }

      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      // Simula timer decrescente (mais lento para preview)
      if (!showAnswerRef.current) {
        timerRef.current = Math.max(0, timerRef.current - deltaTime * 0.3);
        
        // Alterna para mostrar resposta quando timer chega a 0
        if (timerRef.current <= 0) {
          showAnswerRef.current = true;
          setTimeout(() => {
            showAnswerRef.current = false;
            timerRef.current = 10; // Reinicia o timer
          }, 2000);
        }
      }

      // Renderiza o frame - exatamente como no quiz real
      renderFrame(
        renderContextRef.current,
        MOCK_QUESTION,
        showAnswerRef.current ? 0 : timerRef.current,
        10,
        1, // animationProgress
        showAnswerRef.current
      );

      animationRef.current = requestAnimationFrame(render);
    };

    // Inicia animação
    render();

    // Limpa animação ao desmontar
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [template, resolution, t]);

  return (
    <div className="template-preview">
      <div className="video-canvas-container">
        <canvas 
          ref={canvasRef} 
          className="video-canvas"
          style={{
            width: '100%',
            maxWidth: '400px',
            aspectRatio: `${VIDEO_RESOLUTIONS[resolution].width} / ${VIDEO_RESOLUTIONS[resolution].height}`,
          }}
        />
        <div className="video-canvas-info">
          <span>Preview do Template</span>
        </div>
      </div>
      <div className="preview-info">
        <p>Este é um preview com dados mockados</p>
        <p>As mudanças no template são aplicadas em tempo real</p>
      </div>
    </div>
  );
}

