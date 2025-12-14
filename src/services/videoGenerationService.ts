import { Quiz, Question } from '../types/quiz';
import { QuizConfig } from '../types/config';
import { QuizTemplate, DEFAULT_TEMPLATE } from '../types/template';
import { VideoSettings, DEFAULT_VIDEO_SETTINGS } from '../types/video';
import { renderFrame, RenderContext } from './videoRenderer';
import { VIDEO_RESOLUTIONS } from '../types/config';
import { translations, Language } from '../i18n/translations';

interface GenerationProgress {
  progress: number;
  status: 'generating' | 'completed' | 'error';
  error?: string;
}

/**
 * Gera um vídeo para um quiz específico
 */
export async function generateVideoForQuiz(
  quiz: Quiz,
  config: QuizConfig,
  template: QuizTemplate,
  settings: VideoSettings = DEFAULT_VIDEO_SETTINGS,
  onProgress?: (progress: number) => void,
  language: Language = 'pt'
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      // Cria canvas temporário para gravação
      const dimensions = VIDEO_RESOLUTIONS[config.videoResolution];
      const recordingCanvas = document.createElement('canvas');
      recordingCanvas.width = dimensions.width;
      recordingCanvas.height = dimensions.height;
      
      const recordingCtx = recordingCanvas.getContext('2d');
      if (!recordingCtx) {
        reject(new Error('Não foi possível criar contexto do canvas'));
        return;
      }

      recordingCtx.imageSmoothingEnabled = true;
      recordingCtx.imageSmoothingQuality = 'high';

      // Prepara questões
      const questions = quiz.questions.slice(0, config.questionsPerRound);
      const shuffledQuestions = questions.map(q => ({
        ...q,
        options: shuffleArray(q.options),
      }));

      // Cria contexto de renderização
      const renderContext: RenderContext = {
        canvas: recordingCanvas,
        ctx: recordingCtx,
        config,
        settings: {
          ...settings,
          ...dimensions,
          format: config.videoFormat,
        },
        template: template || DEFAULT_TEMPLATE,
        questionBadgeText: translations[language]?.quiz?.questionBadge || 'PERGUNTA',
      };

      // Configura MediaRecorder
      const videoStream = recordingCanvas.captureStream(settings.fps);
      
      // Adiciona áudio silencioso
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0; // Silencioso
      oscillator.connect(gainNode);
      gainNode.connect(destination);
      oscillator.start();
      
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ]);

      const mimeType = getMimeType(config.videoFormat);
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setTimeout(() => {
          if (chunks.length > 0) {
            const blob = new Blob(chunks, { type: mimeType });
            resolve(blob);
          } else {
            reject(new Error('Nenhum chunk de vídeo foi coletado'));
          }
        }, 300);
      };

      mediaRecorder.onerror = (event) => {
        reject(new Error('Erro durante a gravação'));
      };

      // Inicia gravação
      mediaRecorder.start(100);

      // Gera os frames
      let questionIndex = 0;
      let questionStartTime = Date.now();
      let showAnswer = false;
      let answerShownTime = 0;
      const frameInterval = 1000 / settings.fps;
      let intervalId: number | null = null;

      const renderLoop = () => {
        if (questionIndex >= shuffledQuestions.length) {
          // Todas as questões foram completadas
          if (intervalId !== null) {
            clearInterval(intervalId);
          }
          mediaRecorder.stop();
          oscillator.stop();
          audioContext.close();
          return;
        }

        const question = shuffledQuestions[questionIndex];
        const elapsed = (Date.now() - questionStartTime) / 1000;
        let remainingTime = Math.max(0, config.timerPerQuestion - elapsed);

        if (remainingTime <= 0 && !showAnswer) {
          showAnswer = true;
          answerShownTime = Date.now();
          remainingTime = 0;
        }

        if (showAnswer) {
          const answerShownElapsed = (Date.now() - answerShownTime) / 1000;
          if (answerShownElapsed >= 2) {
            questionIndex++;
            showAnswer = false;
            // Reset para próxima pergunta
            questionStartTime = Date.now();
            remainingTime = config.timerPerQuestion;
          } else {
            remainingTime = 0;
          }
        }

        const animationProgress = showAnswer ? 1 : Math.min(1, elapsed / 0.5);
        const validTime = Math.max(0, remainingTime);

        // Renderiza frame
        renderFrame(
          renderContext,
          question,
          validTime,
          config.timerPerQuestion,
          animationProgress,
          showAnswer
        );

        // Atualiza progresso
        const totalProgress = (questionIndex + (showAnswer ? 1 : (1 - remainingTime / config.timerPerQuestion))) / shuffledQuestions.length;
        if (onProgress) {
          onProgress(totalProgress);
        }
      };

      // Inicia o loop de renderização usando setInterval para FPS fixo
      intervalId = window.setInterval(renderLoop, frameInterval);

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Embaralha um array usando Fisher-Yates
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Obtém o MIME type baseado no formato
 */
function getMimeType(format: 'webm' | 'mp4'): string {
  if (format === 'mp4') {
    return 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
  }
  return 'video/webm;codecs=vp8';
}

