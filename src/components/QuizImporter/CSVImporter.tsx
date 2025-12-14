import { useState, useRef } from 'react';
import { parseCSV, validateQuiz } from '../../services/csvParser';
import { readFileAsText } from '../../utils/fileUtils';
import { Quiz } from '../../types/quiz';
import { useLanguage } from '../../hooks/useLanguage';
import './CSVImporter.css';

interface CSVImporterProps {
  onQuizImported: (quiz: Quiz) => void;
  onMultipleQuizzesImported?: (quizzes: Quiz[]) => void;
  maxFiles?: number;
}

export function CSVImporter({ onQuizImported, onMultipleQuizzesImported, maxFiles = 10 }: CSVImporterProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importedQuizzes, setImportedQuizzes] = useState<Array<{ quiz: Quiz; fileName: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const csvFiles = fileArray.filter(file => file.name.endsWith('.csv'));

    if (csvFiles.length === 0) {
      setError(t('csvImporter.selectCsv'));
      return;
    }

    // Verifica limite de arquivos
    const currentCount = importedQuizzes.length;
    if (currentCount + csvFiles.length > maxFiles) {
      setError(`Máximo de ${maxFiles} arquivos permitidos. Você já tem ${currentCount} e tentou adicionar ${csvFiles.length}.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    const newQuizzes: Array<{ quiz: Quiz; fileName: string }> = [];

    try {
      for (const file of csvFiles) {
        const content = await readFileAsText(file);
        const result = parseCSV(content);

        if (!result.success || !result.quiz) {
          setError(`${file.name}: ${result.error || 'Erro ao processar o arquivo CSV'}`);
          continue;
        }

        const validation = validateQuiz(result.quiz);
        if (!validation.valid) {
          setError(`${file.name}: ${validation.errors.join(', ')}`);
          continue;
        }

        newQuizzes.push({ quiz: result.quiz, fileName: file.name });
      }

      if (newQuizzes.length > 0) {
        const updatedQuizzes = [...importedQuizzes, ...newQuizzes];
        setImportedQuizzes(updatedQuizzes);
        
        if (onMultipleQuizzesImported && updatedQuizzes.length > 1) {
          onMultipleQuizzesImported(updatedQuizzes.map(q => q.quiz));
        } else if (newQuizzes.length === 1) {
          onQuizImported(newQuizzes[0].quiz);
        }
        
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ler os arquivos');
    } finally {
      setIsLoading(false);
    }
  };


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="csv-importer">
      <div
        className={`csv-importer-dropzone ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {isLoading ? (
          <div className="csv-importer-loading">
            <div className="spinner"></div>
            <p>{t('csvImporter.processing')}</p>
          </div>
        ) : (
          <div className="csv-importer-content">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <h3>{t('csvImporter.dragFile')}</h3>
            <p>{t('csvImporter.clickToSelect')} (máximo {maxFiles} arquivos)</p>
            <div className="csv-importer-hint">
              <small>{t('csvImporter.format')}</small>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="csv-importer-error">
          <strong>{t('csvImporter.error')}</strong>
          <pre>{error}</pre>
        </div>
      )}

      {importedQuizzes.length > 0 && (
        <div className="csv-importer-list">
          <h4>Quizzes Importados ({importedQuizzes.length}/{maxFiles})</h4>
          <div className="csv-importer-quizzes">
            {importedQuizzes.map((item, index) => (
              <div key={index} className="csv-importer-quiz-item">
                <span className="quiz-name">{item.fileName}</span>
                <span className="quiz-questions">{item.quiz.questions.length} questões</span>
                <button
                  className="btn-remove"
                  onClick={() => {
                    const updated = importedQuizzes.filter((_, i) => i !== index);
                    setImportedQuizzes(updated);
                    if (onMultipleQuizzesImported && updated.length > 0) {
                      onMultipleQuizzesImported(updated.map(q => q.quiz));
                    }
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

