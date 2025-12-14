export interface VideoSettings {
  width: number; // 1080
  height: number; // 1920
  fps: number; // 30
  format: 'webm' | 'mp4';
}

export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  width: 1080,
  height: 1920,
  fps: 30,
  format: 'webm',
};

