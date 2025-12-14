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

type ImportMode = 'upload' | 'paste';

export function CSVImporter({ onQuizImported, onMultipleQuizzesImported, maxFiles = 10 }: CSVImporterProps) {
  const { t } = useLanguage();
  const [importMode, setImportMode] = useState<ImportMode>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importedQuizzes, setImportedQuizzes] = useState<Array<{ quiz: Quiz; fileName: string }>>([]);
  const [pastedTexts, setPastedTexts] = useState<string[]>(['']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

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

  const handlePasteText = (index: number, value: string) => {
    const newTexts = [...pastedTexts];
    newTexts[index] = value;
    setPastedTexts(newTexts);
    setError(null);
  };

  const addPasteField = () => {
    if (pastedTexts.length < maxFiles) {
      setPastedTexts([...pastedTexts, '']);
    }
  };

  const removePasteField = (index: number) => {
    if (pastedTexts.length > 1) {
      const newTexts = pastedTexts.filter((_, i) => i !== index);
      setPastedTexts(newTexts);
      // Remove a referência do textarea
      textareaRefs.current = textareaRefs.current.filter((_, i) => i !== index);
    }
  };

  const processPastedTexts = async () => {
    const textsToProcess = pastedTexts.filter(text => text.trim().length > 0);
    
    if (textsToProcess.length === 0) {
      setError('Por favor, cole pelo menos um texto CSV');
      return;
    }

    const currentCount = importedQuizzes.length;
    if (currentCount + textsToProcess.length > maxFiles) {
      setError(`Máximo de ${maxFiles} quizzes permitidos. Você já tem ${currentCount} e tentou adicionar ${textsToProcess.length}.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    const newQuizzes: Array<{ quiz: Quiz; fileName: string }> = [];

    try {
      for (let i = 0; i < textsToProcess.length; i++) {
        const text = textsToProcess[i];
        const result = parseCSV(text);

        if (!result.success || !result.quiz) {
          setError(`Texto ${i + 1}: ${result.error || 'Erro ao processar o texto CSV'}`);
          continue;
        }

        const validation = validateQuiz(result.quiz);
        if (!validation.valid) {
          setError(`Texto ${i + 1}: ${validation.errors.join(', ')}`);
          continue;
        }

        newQuizzes.push({ 
          quiz: result.quiz, 
          fileName: `quiz-colado-${Date.now()}-${i + 1}.csv` 
        });
      }

      if (newQuizzes.length > 0) {
        const updatedQuizzes = [...importedQuizzes, ...newQuizzes];
        setImportedQuizzes(updatedQuizzes);
        
        if (updatedQuizzes.length > 1) {
          // Se há múltiplos quizzes, usa a callback de múltiplos
          if (onMultipleQuizzesImported) {
            onMultipleQuizzesImported(updatedQuizzes.map(q => q.quiz));
          } else if (newQuizzes.length === 1) {
            // Se não há callback de múltiplos, importa apenas o primeiro
            onQuizImported(newQuizzes[0].quiz);
          }
        } else if (newQuizzes.length === 1) {
          // Se há apenas um quiz novo e não há outros, importa normalmente
          onQuizImported(newQuizzes[0].quiz);
        }
        
        // Limpa os campos de texto após importação bem-sucedida
        setPastedTexts(['']);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar os textos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="csv-importer">
      {/* Tabs para alternar entre upload e colar */}
      <div className="csv-importer-tabs">
        <button
          className={`csv-importer-tab ${importMode === 'upload' ? 'active' : ''}`}
          onClick={() => setImportMode('upload')}
          disabled={isLoading}
        >
          📁 {t('csvImporter.uploadFiles')}
        </button>
        <button
          className={`csv-importer-tab ${importMode === 'paste' ? 'active' : ''}`}
          onClick={() => setImportMode('paste')}
          disabled={isLoading}
        >
          📋 {t('csvImporter.pasteText')}
        </button>
      </div>

      {importMode === 'upload' && (
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
      )}

      {importMode === 'paste' && (
        <div className="csv-importer-paste">
          <div className="csv-importer-paste-header">
            <h3>{t('csvImporter.pasteCsvText')}</h3>
            <p className="csv-importer-paste-hint">{t('csvImporter.pasteHint')}</p>
          </div>

          <div className="csv-importer-paste-fields">
            {pastedTexts.map((text, index) => (
              <div key={index} className="csv-importer-paste-field">
                <div className="csv-importer-paste-field-header">
                  <label>CSV {index + 1}</label>
                  {pastedTexts.length > 1 && (
                    <button
                      className="btn-remove-small"
                      onClick={() => removePasteField(index)}
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </div>
                <textarea
                  ref={(el) => {
                    textareaRefs.current[index] = el;
                  }}
                  className="csv-importer-textarea"
                  value={text}
                  onChange={(e) => handlePasteText(index, e.target.value)}
                  placeholder={t('csvImporter.pastePlaceholder')}
                  rows={8}
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>

          <div className="csv-importer-paste-actions">
            {pastedTexts.length < maxFiles && (
              <button
                className="btn btn-secondary"
                onClick={addPasteField}
                disabled={isLoading}
                type="button"
              >
                + {t('csvImporter.addAnother')}
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={processPastedTexts}
              disabled={isLoading || pastedTexts.every(text => text.trim().length === 0)}
              type="button"
            >
              {isLoading ? (
                <>
                  <div className="spinner-small"></div>
                  {t('csvImporter.processing')}
                </>
              ) : (
                t('csvImporter.importTexts')
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="csv-importer-error">
          <strong>{t('csvImporter.error')}</strong>
          <pre>{error}</pre>
        </div>
      )}

      {importedQuizzes.length > 0 && (
        <div className="csv-importer-list">
          <h4>{t('csvImporter.importedQuizzes')} ({importedQuizzes.length}/{maxFiles})</h4>
          <div className="csv-importer-quizzes">
            {importedQuizzes.map((item, index) => (
              <div key={index} className="csv-importer-quiz-item">
                <span className="quiz-name">{item.fileName}</span>
                <span className="quiz-questions">{item.quiz.questions.length} {t('csvImporter.questions')}</span>
                <button
                  className="btn-remove"
                  onClick={() => {
                    const updated = importedQuizzes.filter((_, i) => i !== index);
                    setImportedQuizzes(updated);
                    if (updated.length > 1) {
                      // Se há múltiplos quizzes, usa a callback de múltiplos
                      if (onMultipleQuizzesImported) {
                        onMultipleQuizzesImported(updated.map(q => q.quiz));
                      }
                    } else if (updated.length === 1) {
                      // Se há apenas um quiz restante, importa normalmente
                      onQuizImported(updated[0].quiz);
                    }
                    // Se não há mais quizzes (updated.length === 0), 
                    // o App.tsx deve gerenciar a limpeza do quiz ativo
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

