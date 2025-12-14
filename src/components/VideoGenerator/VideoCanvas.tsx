import { useRef, useEffect } from 'react';
import { VIDEO_RESOLUTIONS } from '../../types/config';
import './VideoCanvas.css';

interface VideoCanvasProps {
  resolution?: '1080x1920' | '720x1280' | '540x960';
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export function VideoCanvas({ resolution = '1080x1920', onCanvasReady }: VideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Obtém as dimensões da resolução escolhida
    const dimensions = VIDEO_RESOLUTIONS[resolution];

    // Configura o tamanho do canvas
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Notifica que o canvas está pronto
    if (onCanvasReady) {
      onCanvasReady(canvas);
    }
  }, [resolution, onCanvasReady]);

  return (
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
        <span>{resolution}</span>
      </div>
    </div>
  );
}

