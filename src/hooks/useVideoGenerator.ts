import { useState, useRef, useCallback, useEffect } from 'react';
import { Quiz, Question } from '../types/quiz';
import { QuizConfig } from '../types/config';
import { VideoSettings, DEFAULT_VIDEO_SETTINGS } from '../types/video';
import { QuizTemplate, DEFAULT_TEMPLATE } from '../types/template';
import { renderFrame, RenderContext } from '../services/videoRenderer';
import { audioManager } from '../services/audioManager'; // Apenas para música de fundo
import { useMediaRecorder } from './useMediaRecorder';
import { useLanguage } from './useLanguage';

interface UseVideoGeneratorOptions {
  quiz: Quiz | null;
  config: QuizConfig;
  settings?: VideoSettings;
  canvas: HTMLCanvasElement | null;
  template?: QuizTemplate;
}

export function useVideoGenerator({
  quiz,
  config,
  settings = DEFAULT_VIDEO_SETTINGS,
  canvas,
  template,
}: UseVideoGeneratorOptions) {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Refs para controle de animação
  const previewAnimationFrameRef = useRef<number | null>(null); // Para preview (requestAnimationFrame)
  const recordingIntervalRef = useRef<number | null>(null); // Para gravação (setInterval)
  
  // Refs para controle de tempo
  const startTimeRef = useRef<number>(0);
  const questionStartTimeRef = useRef<number>(0);
  const renderContextRef = useRef<RenderContext | null>(null);
  const recordingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Refs para controle de estado
  const showAnswerRef = useRef<boolean>(false);
  const answerShownTimeRef = useRef<number>(0);
  const currentQuestionIndexRef = useRef<number>(0);
  const questionsRef = useRef<Question[]>([]);
  
  // Refs para controle de estado visual
  const lastVisualStateRef = useRef<{
    timerValue: number;
    answerIsGreen: boolean;
    questionId: string;
  } | null>(null);
  const questionTransitionCompleteRef = useRef<boolean>(false);

  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Calcula as dimensões do vídeo baseado na resolução escolhida
  const getVideoDimensions = useCallback(() => {
    const [width, height] = config.videoResolution.split('x').map(Number);
    return { width, height };
  }, [config.videoResolution]);

  const {
    isRecording,
    startRecording,
    stopRecording,
    downloadVideo,
  } = useMediaRecorder({
    settings: {
      ...settings,
      ...getVideoDimensions(),
      format: config.videoFormat,
    },
    onRecordingComplete: (blob) => {
      console.log('onRecordingComplete chamado, blob size:', blob.size);
      setVideoBlob(blob);
      setIsVideoReady(true);
      setIsGenerating(false);
      console.log('Estado atualizado: isVideoReady = true');
    },
  });

  // Inicializa os canvas de gravação e preview
  useEffect(() => {
    if (canvas) {
      const dimensions = getVideoDimensions();
      
      // Canvas de preview (visível) - renderiza diretamente aqui
      previewCanvasRef.current = canvas;
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      const previewCtx = canvas.getContext('2d');
      if (previewCtx) {
        previewCtx.imageSmoothingEnabled = true;
        previewCtx.imageSmoothingQuality = 'high';
      }
      
      // Canvas de gravação (offscreen) - usado apenas para captura
      if (!recordingCanvasRef.current) {
        recordingCanvasRef.current = document.createElement('canvas');
      }
      recordingCanvasRef.current.width = dimensions.width;
      recordingCanvasRef.current.height = dimensions.height;
      
      // Contexto de renderização usa o canvas VISÍVEL (preview) para garantir que apareça
      if (previewCtx) {
        renderContextRef.current = {
          canvas: canvas,
          ctx: previewCtx,
          config,
          settings: {
            ...settings,
            ...dimensions,
            format: config.videoFormat,
          },
          template: template || DEFAULT_TEMPLATE,
          questionBadgeText: t('quiz.questionBadge'),
        };
      }
    }
  }, [canvas, config, settings, template, getVideoDimensions]);

  // Atualiza o contexto quando a config ou o idioma muda
  useEffect(() => {
    if (renderContextRef.current) {
      renderContextRef.current.config = config;
      renderContextRef.current.questionBadgeText = t('quiz.questionBadge');
    }
  }, [config, t]);

  /**
   * Embaralha um array usando o algoritmo Fisher-Yates
   */
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const prepareQuestions = useCallback((): Question[] => {
    if (!quiz) return [];
    
    const questions = quiz.questions.slice(0, config.questionsPerRound);
    
    return questions.map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
  }, [quiz, config.questionsPerRound, shuffleArray]);

  /**
   * Renderiza um frame no canvas
   * Retorna o estado visual renderizado para sincronização de áudio
   */
  const renderFrameToCanvas = useCallback((
    targetCanvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    question: Question,
    remainingTime: number,
    animationProgress: number,
    showAnswer: boolean
  ): import('../services/videoRenderer').RenderedVisualState | null => {
    if (!renderContextRef.current) return null;
    
    const context = {
      ...renderContextRef.current,
      canvas: targetCanvas,
      ctx: ctx,
    };
    
    // Renderiza e obtém o estado visual renderizado
    const visualState = renderFrame(
      context,
      question,
      remainingTime,
      config.timerPerQuestion,
      animationProgress,
      showAnswer
    );
    
    return visualState;
  }, [config.timerPerQuestion]);

  /**
   * Loop de renderização para PREVIEW (usa requestAnimationFrame para suavidade)
   */
  const previewRenderLoop = useCallback(() => {
    if (!renderContextRef.current || !quiz || !previewCanvasRef.current) {
      if (previewAnimationFrameRef.current) {
        cancelAnimationFrame(previewAnimationFrameRef.current);
        previewAnimationFrameRef.current = null;
      }
      return;
    }

    const questions = questionsRef.current;
    const questionIndex = currentQuestionIndexRef.current;
    
    // Verifica se todas as questões foram completadas
    if (questionIndex >= questions.length) {
      if (previewAnimationFrameRef.current) {
        cancelAnimationFrame(previewAnimationFrameRef.current);
        previewAnimationFrameRef.current = null;
      }
      return;
    }

    // IMPORTANTE: Obtém a pergunta atual usando o índice atualizado
    let question = questions[questionIndex];
    if (!question) {
      // Se não há pergunta, continua o loop para tentar novamente
      previewAnimationFrameRef.current = requestAnimationFrame(previewRenderLoop);
      return;
    }
    
    let elapsed = (Date.now() - questionStartTimeRef.current) / 1000;
    let remainingTime = Math.max(0, config.timerPerQuestion - elapsed);
    
    // Verifica se deve mostrar a resposta
    if (remainingTime <= 0 && !showAnswerRef.current) {
      showAnswerRef.current = true;
      answerShownTimeRef.current = Date.now();
      remainingTime = 0;
      // O estado visual será detectado automaticamente quando answerIsGreen mudar
    }

    // Verifica se já mostrou a resposta por tempo suficiente (2 segundos)
    if (showAnswerRef.current) {
      const answerShownTime = (Date.now() - answerShownTimeRef.current) / 1000;
      if (answerShownTime >= 2) {
        // Avança para próxima questão
        const nextIndex = questionIndex + 1;
        currentQuestionIndexRef.current = nextIndex;
        setCurrentQuestionIndex(nextIndex);
        
        if (nextIndex >= questions.length) {
          // Todas as questões foram completadas
          if (previewAnimationFrameRef.current) {
            cancelAnimationFrame(previewAnimationFrameRef.current);
            previewAnimationFrameRef.current = null;
          }
          return;
        }
        
        // Reseta TODOS os valores ANTES de mudar de pergunta
        questionTransitionCompleteRef.current = false;
        // Reseta o estado visual para forçar detecção de nova pergunta
        lastVisualStateRef.current = null;
        
        // IMPORTANTE: Atualiza o tempo de início ANTES de calcular elapsed
        // Isso garante que o timer comece do zero para a nova pergunta
        questionStartTimeRef.current = Date.now();
        showAnswerRef.current = false;
        setCurrentTime(config.timerPerQuestion);
        
        // Marca que a transição está completa após um pequeno delay
        // Este delay é necessário para garantir que a nova pergunta foi renderizada
        setTimeout(() => {
          questionTransitionCompleteRef.current = true;
        }, 250); // 250ms de delay para garantir que a nova pergunta foi renderizada e exibida
        
        // IMPORTANTE: Atualiza a pergunta e os valores para a nova pergunta
        question = questions[nextIndex];
        // Recalcula elapsed e remainingTime para a nova pergunta
        elapsed = (Date.now() - questionStartTimeRef.current) / 1000;
        remainingTime = Math.max(0, config.timerPerQuestion - elapsed);
      } else {
        remainingTime = 0;
      }
    }
    
    // Calcula o valor visual do timer (igual ao que é renderizado na tela)
    // IMPORTANTE: Usa exatamente o mesmo cálculo que renderTimer usa: Math.max(0, Math.ceil(currentTime))
    // Onde currentTime = remainingTime
    const visualTimerValue = Math.max(0, Math.ceil(remainingTime));
    
    // Atualiza o estado apenas se o valor mudou
    if (visualTimerValue !== currentTime) {
      setCurrentTime(visualTimerValue);
    }
    
    // Nota: A sincronização de áudio agora é feita baseada no estado visual retornado por renderFrameToCanvas

    // Calcula progresso geral - usa o índice atualizado
    const currentIndex = currentQuestionIndexRef.current;
    const totalProgress = (currentIndex + (showAnswerRef.current ? 1 : (1 - remainingTime / config.timerPerQuestion))) / questions.length;
    setProgress(totalProgress);

    // Renderiza o frame no canvas VISÍVEL (preview)
    const animationProgress = showAnswerRef.current ? 1 : Math.min(1, elapsed / 0.5);
    const validTime = Math.max(0, remainingTime);
    
    const previewCanvas = previewCanvasRef.current;
    const previewCtx = previewCanvas?.getContext('2d');
    let visualState: import('../services/videoRenderer').RenderedVisualState | null = null;
    
    if (previewCanvas && previewCtx && question) {
      // Renderiza e obtém o estado visual renderizado
      visualState = renderFrameToCanvas(
        previewCanvas,
        previewCtx,
        question,
        validTime,
        animationProgress,
        showAnswerRef.current
      );
    }
    
    // Atualiza o estado visual renderizado (sem sons)
    if (visualState) {
      lastVisualStateRef.current = {
        timerValue: visualState.timerValue,
        answerIsGreen: visualState.answerIsGreen,
        questionId: visualState.questionId,
      };
    }

    // Continua o loop de preview
    previewAnimationFrameRef.current = requestAnimationFrame(previewRenderLoop);
  }, [quiz, config, renderFrameToCanvas]);

  /**
   * Loop de renderização para GRAVAÇÃO (usa setInterval para FPS fixo)
   * IMPORTANTE: Renderiza diretamente no canvas de gravação para evitar piscamento
   */
  const recordingRenderLoop = useCallback(() => {
    if (!renderContextRef.current || !quiz) {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      return;
    }

    const questions = questionsRef.current;
    const questionIndex = currentQuestionIndexRef.current;
    
    // Verifica se todas as questões foram completadas
    if (questionIndex >= questions.length) {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      setTimeout(() => {
        stopRecording();
      }, 500);
      return;
    }

    // IMPORTANTE: Obtém a pergunta atual usando o índice atualizado
    let question = questions[questionIndex];
    if (!question) {
      return;
    }
    
    let elapsed = (Date.now() - questionStartTimeRef.current) / 1000;
    let remainingTime = Math.max(0, config.timerPerQuestion - elapsed);
    
    if (remainingTime <= 0 && !showAnswerRef.current) {
      showAnswerRef.current = true;
      answerShownTimeRef.current = Date.now();
      remainingTime = 0;
      // O estado visual será detectado automaticamente quando answerIsGreen mudar
    }

    if (showAnswerRef.current) {
      const answerShownTime = (Date.now() - answerShownTimeRef.current) / 1000;
      if (answerShownTime >= 2) {
        const nextIndex = questionIndex + 1;
        currentQuestionIndexRef.current = nextIndex;
        setCurrentQuestionIndex(nextIndex);
        
        if (nextIndex >= questions.length) {
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }
          setTimeout(() => {
            stopRecording();
          }, 500);
          return;
        }
        
        questionTransitionCompleteRef.current = false;
        // Reseta o estado visual para forçar detecção de nova pergunta
        lastVisualStateRef.current = null;
        
        // IMPORTANTE: Atualiza o tempo de início ANTES de calcular elapsed
        questionStartTimeRef.current = Date.now();
        showAnswerRef.current = false;
        setCurrentTime(config.timerPerQuestion);
        
        // Marca que a transição está completa após um pequeno delay
        setTimeout(() => {
          questionTransitionCompleteRef.current = true;
        }, 250); // 250ms de delay para garantir que a nova pergunta foi renderizada
        
        // Atualiza para a nova pergunta
        question = questions[nextIndex];
        elapsed = (Date.now() - questionStartTimeRef.current) / 1000;
        remainingTime = Math.max(0, config.timerPerQuestion - elapsed);
      } else {
        remainingTime = 0;
      }
    }
    
    // IMPORTANTE: Renderiza DIRETAMENTE no canvas de gravação (não copia)
    // Isso garante frames consistentes e evita piscamento
    const animationProgress = showAnswerRef.current ? 1 : Math.min(1, elapsed / 0.5);
    const validTime = Math.max(0, remainingTime);
    
    const recordingCanvas = recordingCanvasRef.current;
    const recordingCtx = recordingCanvas?.getContext('2d');
    if (recordingCanvas && recordingCtx && question) {
      // Garante que as dimensões estão corretas
      const dimensions = getVideoDimensions();
      if (recordingCanvas.width !== dimensions.width || recordingCanvas.height !== dimensions.height) {
        recordingCanvas.width = dimensions.width;
        recordingCanvas.height = dimensions.height;
      }
      
      // Renderiza diretamente no canvas de gravação e obtém estado visual
      const visualState = renderFrameToCanvas(
        recordingCanvas,
        recordingCtx,
        question,
        validTime,
        animationProgress,
        showAnswerRef.current
      );
      
      // Atualiza o estado visual renderizado (sem sons)
      if (visualState) {
        lastVisualStateRef.current = {
          timerValue: visualState.timerValue,
          answerIsGreen: visualState.answerIsGreen,
          questionId: visualState.questionId,
        };
      }
    }
  }, [quiz, config, stopRecording, renderFrameToCanvas, getVideoDimensions]);

  const startGeneration = useCallback(async () => {
    if (!quiz || !canvas) {
      setError('Quiz ou canvas não disponível');
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);
      
      // Prepara as questões
      questionsRef.current = prepareQuestions();
      currentQuestionIndexRef.current = 0;
      setCurrentQuestionIndex(0);
      setCurrentTime(config.timerPerQuestion);
      setProgress(0);
      showAnswerRef.current = false;
      questionTransitionCompleteRef.current = false;

      // Atualiza os canvas com as dimensões corretas
      const dimensions = getVideoDimensions();
      
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      previewCanvasRef.current = canvas;
      
      if (!recordingCanvasRef.current) {
        recordingCanvasRef.current = document.createElement('canvas');
      }
      recordingCanvasRef.current.width = dimensions.width;
      recordingCanvasRef.current.height = dimensions.height;
      
      const previewCtx = canvas.getContext('2d');
      if (previewCtx) {
        previewCtx.imageSmoothingEnabled = true;
        previewCtx.imageSmoothingQuality = 'high';
        
        renderContextRef.current = {
          canvas: canvas,
          ctx: previewCtx,
          config,
          settings: {
            ...settings,
            ...dimensions,
            format: config.videoFormat,
          },
          template: template || DEFAULT_TEMPLATE,
          questionBadgeText: t('quiz.questionBadge'),
        };
      }

      // Inicia gravação usando o canvas offscreen
      if (recordingCanvasRef.current) {
        await startRecording(recordingCanvasRef.current);
      }

      // Configura áudio
      if (config.enableMusic) {
        audioManager.setMusicEnabled(true);
        audioManager.playBackgroundMusic();
      } else {
        audioManager.setMusicEnabled(false);
      }

      // Sons removidos - os vídeos não terão mais sons
      
      // Inicia os loops de renderização
      questionStartTimeRef.current = Date.now();
      startTimeRef.current = Date.now();
      // Reseta o estado visual para forçar detecção na primeira renderização
      lastVisualStateRef.current = null;
      
      // Limpa qualquer loop anterior
      if (previewAnimationFrameRef.current) {
        cancelAnimationFrame(previewAnimationFrameRef.current);
        previewAnimationFrameRef.current = null;
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      // Inicia o loop de PREVIEW (requestAnimationFrame para suavidade)
      previewRenderLoop();
      
      // Inicia o loop de GRAVAÇÃO (setInterval para FPS fixo)
      const frameInterval = 1000 / settings.fps;
      recordingIntervalRef.current = window.setInterval(() => {
        recordingRenderLoop();
      }, frameInterval);
      
      // Marca que a transição está completa após um delay
      setTimeout(() => {
        questionTransitionCompleteRef.current = true;
      }, 300);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar geração');
      setIsGenerating(false);
    }
  }, [quiz, canvas, config, startRecording, prepareQuestions, getVideoDimensions, previewRenderLoop, recordingRenderLoop, settings, template]);

  const stopGeneration = useCallback(() => {
    if (previewAnimationFrameRef.current) {
      cancelAnimationFrame(previewAnimationFrameRef.current);
      previewAnimationFrameRef.current = null;
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    stopRecording();
    audioManager.stopBackgroundMusic();
    setIsGenerating(false);
    currentQuestionIndexRef.current = 0;
    setCurrentQuestionIndex(0);
    setProgress(0);
    showAnswerRef.current = false;
    questionsRef.current = [];
    setIsVideoReady(false);
    setVideoBlob(null);
  }, [stopRecording]);

  // Limpa recursos quando o componente desmonta
  useEffect(() => {
    return () => {
      if (previewAnimationFrameRef.current) {
        cancelAnimationFrame(previewAnimationFrameRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      audioManager.cleanup();
    };
  }, []);

  const handleDownload = useCallback(() => {
    if (videoBlob) {
      downloadVideo(videoBlob, config.videoFormat);
    }
  }, [videoBlob, config.videoFormat, downloadVideo]);

  const resetVideo = useCallback(() => {
    setVideoBlob(null);
    setIsVideoReady(false);
  }, []);

  return {
    isGenerating,
    isRecording,
    currentQuestionIndex,
    currentTime,
    progress,
    error,
    isVideoReady,
    videoBlob,
    startGeneration,
    stopGeneration,
    handleDownload,
    resetVideo,
  };
}
