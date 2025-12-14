import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const VIDEOS_DIR = path.join(__dirname, '../../videos');

// Garante que os diretórios existem
export async function ensureDirectories() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(VIDEOS_DIR, { recursive: true });
}

export async function saveFile(fileName: string, content: Buffer): Promise<string> {
  await ensureDirectories();
  const filePath = path.join(UPLOAD_DIR, fileName);
  await fs.writeFile(filePath, content);
  return filePath;
}

export async function saveVideo(jobId: string, videoBuffer: Buffer, format: 'webm' | 'mp4'): Promise<string> {
  await ensureDirectories();
  const fileName = `${jobId}.${format}`;
  const filePath = path.join(VIDEOS_DIR, fileName);
  await fs.writeFile(filePath, videoBuffer);
  return filePath;
}

export async function getVideoPath(jobId: string, format: 'webm' | 'mp4'): Promise<string | null> {
  const fileName = `${jobId}.${format}`;
  const filePath = path.join(VIDEOS_DIR, fileName);
  
  try {
    await fs.access(filePath);
    return filePath;
  } catch {
    return null;
  }
}

export async function deleteVideo(jobId: string, format: 'webm' | 'mp4'): Promise<void> {
  const filePath = path.join(VIDEOS_DIR, `${jobId}.${format}`);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Arquivo não existe, ignora
  }
}

export async function readFile(filePath: string): Promise<Buffer> {
  return await fs.readFile(filePath);
}

