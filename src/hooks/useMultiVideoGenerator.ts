import { useState, useCallback } from 'react';
import { Quiz } from '../types/quiz';
import { QuizConfig } from '../types/config';
import JSZip from 'jszip';

interface QuizWithId extends Quiz {
  id: string;
  fileName: string;
}

interface VideoGenerationStatus {
  quizId: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  progress: number;
  error?: string;
  videoBlob?: Blob;
}

export function useMultiVideoGenerator({
  quizzes,
  config,
  canvas,
}: {
  quizzes: QuizWithId[];
  config: QuizConfig;
  canvas: HTMLCanvasElement | null;
}) {
  const [generationStatuses, setGenerationStatuses] = useState<Map<string, VideoGenerationStatus>>(new Map());
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [allVideosReady, setAllVideosReady] = useState(false);

  const updateStatus = useCallback((quizId: string, updates: Partial<VideoGenerationStatus>) => {
    setGenerationStatuses(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(quizId) || {
        quizId,
        status: 'pending' as const,
        progress: 0,
      };
      newMap.set(quizId, { ...current, ...updates });
      return newMap;
    });
  }, []);


  const generateAllVideos = useCallback(async () => {
    if (quizzes.length === 0 || !canvas) return;

    setIsGeneratingAll(true);
    setAllVideosReady(false);
    
    // Inicializa todos os status
    const initialStatuses = new Map<string, VideoGenerationStatus>();
    quizzes.forEach(quiz => {
      initialStatuses.set(quiz.id, {
        quizId: quiz.id,
        status: 'pending',
        progress: 0,
      });
    });
    setGenerationStatuses(initialStatuses);

    const videos: Array<{ quizId: string; blob: Blob; fileName: string }> = [];

    // Gera vídeos sequencialmente
    for (const quiz of quizzes) {
      try {
        updateStatus(quiz.id, { status: 'generating', progress: 0 });
        
        // Aqui precisaríamos gerar o vídeo para cada quiz
        // Por enquanto, vamos usar uma abordagem simplificada
        // Na prática, precisaríamos criar uma instância do useVideoGenerator para cada quiz
        
        // Simulação - em produção, isso seria a geração real
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        updateStatus(quiz.id, { status: 'completed', progress: 100 });
      } catch (error) {
        updateStatus(quiz.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    setIsGeneratingAll(false);
    setAllVideosReady(videos.length === quizzes.length);
  }, [quizzes, canvas, updateStatus]);

  const downloadAllAsZip = useCallback(async () => {
    const zip = new JSZip();
    const statuses = Array.from(generationStatuses.values());
    
    for (const status of statuses) {
      if (status.status === 'completed' && status.videoBlob) {
        const quiz = quizzes.find(q => q.id === status.quizId);
        const extension = config.videoFormat === 'mp4' ? 'mp4' : 'webm';
        const fileName = `${quiz?.fileName || 'quiz'}-${status.quizId}.${extension}`;
        zip.file(fileName, status.videoBlob);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quizzes-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generationStatuses, quizzes, config.videoFormat]);

  return {
    generationStatuses: Array.from(generationStatuses.values()),
    isGeneratingAll,
    allVideosReady,
    generateAllVideos,
    downloadAllAsZip,
  };
}


