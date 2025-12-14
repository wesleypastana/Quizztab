import { useRef, useState, useCallback } from 'react';
import { downloadBlob } from '../utils/fileUtils';
import { VideoSettings, DEFAULT_VIDEO_SETTINGS } from '../types/video';

interface UseMediaRecorderOptions {
  settings?: VideoSettings;
  onRecordingComplete?: (blob: Blob) => void;
}

/**
 * Obtém o MIME type apropriado baseado no formato desejado
 * Tenta evitar codecs de áudio não suportados como Opus
 */
function getMimeType(format: 'webm' | 'mp4'): string {
  if (format === 'mp4') {
    // Tenta diferentes codecs MP4 com AAC para áudio
    if (MediaRecorder.isTypeSupported('video/mp4;codecs="avc1.42E01E,mp4a.40.2"')) {
      return 'video/mp4;codecs="avc1.42E01E,mp4a.40.2"'; // H.264 + AAC
    }
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
      return 'video/mp4;codecs=h264';
    }
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      return 'video/mp4';
    }
    // Fallback para webm se mp4 não for suportado
    console.warn('MP4 não suportado, usando WebM como fallback');
    return 'video/webm;codecs=vp8'; // VP8 ao invés de VP9 para melhor compatibilidade
  }
  
  // WebM - tenta VP8 primeiro (melhor compatibilidade que VP9)
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
    return 'video/webm;codecs=vp8'; // VP8 sem áudio Opus
  }
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    return 'video/webm;codecs=vp9';
  }
  if (MediaRecorder.isTypeSupported('video/webm')) {
    return 'video/webm';
  }
  return 'video/webm';
}

export function useMediaRecorder({ settings = DEFAULT_VIDEO_SETTINGS, onRecordingComplete }: UseMediaRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const startRecording = useCallback(async (canvas: HTMLCanvasElement) => {
    try {
      setError(null);
      chunksRef.current = [];

      // Obtém o stream do canvas
      const videoStream = canvas.captureStream(settings.fps);
      
      // Cria um AudioContext para capturar o áudio real
      const audioContext = new AudioContext({ sampleRate: 44100 });
      const destination = audioContext.createMediaStreamDestination();
      
      // Importa o audioManager para conectar os sons
      const { audioManager } = await import('../services/audioManager');
      
      // Inicializa o audioManager com o AudioContext para capturar os sons
      audioManager.initializeAudioContext(audioContext, destination);
      
      // Se não houver stream de áudio do audioManager, cria um silencioso como fallback
      let audioStream = audioManager.getAudioStream();
      if (!audioStream || audioStream.getAudioTracks().length === 0) {
        // Fallback: cria um oscilador silencioso (inaudível) apenas para compatibilidade
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.0001; // Muito baixo, mas não zero
        oscillator.frequency.value = 20; // Frequência muito baixa, inaudível
        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        gainNode.connect(destination);
        oscillator.start();
        oscillatorRef.current = oscillator;
        audioStream = destination.stream;
      } else {
        oscillatorRef.current = null;
      }
      
      // Combina vídeo e áudio
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);
      
      streamRef.current = combinedStream;
      
      // Armazena referências para limpeza
      audioContextRef.current = audioContext;

      // Cria o MediaRecorder com o formato escolhido
      const mimeType = getMimeType(settings.format);

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder.onstop chamado, chunks coletados:', chunksRef.current.length);
        // Aguarda um pouco para garantir que todos os chunks foram coletados
        setTimeout(() => {
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            console.log('Vídeo gerado, tamanho:', blob.size, 'bytes, tipo:', mimeType);
            if (onRecordingComplete) {
              console.log('Chamando onRecordingComplete...');
              onRecordingComplete(blob);
            } else {
              console.warn('onRecordingComplete não está definido!');
            }
          } else {
            console.warn('Nenhum chunk de vídeo foi coletado');
            // Ainda assim chama o callback para não travar a interface
            if (onRecordingComplete) {
              const emptyBlob = new Blob([], { type: mimeType });
              onRecordingComplete(emptyBlob);
            }
          }
        }, 300);
      };

      mediaRecorder.onerror = (event) => {
        setError('Erro durante a gravação');
        console.error('MediaRecorder error:', event);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Coleta dados a cada 100ms
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao iniciar gravação';
      setError(errorMessage);
      console.error('Erro ao iniciar gravação:', err);
    }
  }, [settings.fps, settings.format, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    console.log('stopRecording chamado, MediaRecorder existe?', !!mediaRecorderRef.current);
    if (mediaRecorderRef.current) {
      const state = mediaRecorderRef.current.state;
      console.log('Estado do MediaRecorder:', state);
      // Verifica se está gravando ou pausado
      if (state === 'recording' || state === 'paused') {
        try {
          console.log('Chamando mediaRecorder.stop()...');
          mediaRecorderRef.current.stop();
          console.log('mediaRecorder.stop() chamado com sucesso');
        } catch (err) {
          console.error('Erro ao parar gravação:', err);
        }
      } else {
        console.warn('MediaRecorder não está em estado de gravação, estado:', state);
      }
      setIsRecording(false);
      setIsPaused(false);

      // Para o stream e limpa recursos de áudio após um pequeno delay
      setTimeout(() => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        
        // Limpa recursos de áudio
        if (oscillatorRef.current) {
          try {
            oscillatorRef.current.stop();
          } catch (e) {
            // Ignora erros se já estiver parado
          }
          oscillatorRef.current = null;
        }
        
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {
            // Ignora erros ao fechar
          });
          audioContextRef.current = null;
        }
      }, 500);
    } else {
      console.warn('MediaRecorder não existe ao tentar parar');
      setIsRecording(false);
      setIsPaused(false);
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }, [isRecording, isPaused]);

  const downloadVideo = useCallback((blob: Blob, format: 'webm' | 'mp4' = 'webm') => {
    const extension = format === 'mp4' ? 'mp4' : 'webm';
    const filename = `quiz-video-${Date.now()}.${extension}`;
    downloadBlob(blob, filename);
  }, []);

  return {
    isRecording,
    isPaused,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadVideo,
  };
}

