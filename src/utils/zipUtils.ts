import JSZip from 'jszip';

export interface VideoFile {
  fileName: string;
  blob: Blob;
}

/**
 * Cria um arquivo ZIP com múltiplos vídeos
 */
export async function createZipFromVideos(videos: VideoFile[]): Promise<Blob> {
  const zip = new JSZip();
  
  for (const video of videos) {
    zip.file(video.fileName, video.blob);
  }
  
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Faz download de um blob como arquivo
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

