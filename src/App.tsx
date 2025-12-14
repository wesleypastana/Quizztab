import { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { CSVImporter } from './components/QuizImporter/CSVImporter';
import { QuizPreview } from './components/QuizImporter/QuizPreview';
import { QuizConfigForm } from './components/QuizConfig/QuizConfigForm';
import { TemplateEditor } from './components/TemplateEditor/TemplateEditor';
import { TemplatePreview } from './components/TemplateEditor/TemplatePreview';
import { VideoCanvas } from './components/VideoGenerator/VideoCanvas';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { useQuizConfig } from './hooks/useQuizConfig';
import { useTemplate } from './hooks/useTemplate';
import { useVideoGenerator } from './hooks/useVideoGenerator';
import { useLanguage } from './hooks/useLanguage';
import { Quiz } from './types/quiz';
import { DEFAULT_TEMPLATE } from './types/template';
import { DEFAULT_VIDEO_SETTINGS } from './types/video';
import { createZipFromVideos, downloadBlob } from './utils/zipUtils';
import { generateVideoForQuiz } from './services/videoGenerationService';
import './styles/globals.css';
import './styles/themes.css';
import './App.css';

interface QuizWithId extends Quiz {
  id: string;
  fileName: string;
}

function App() {
  const { t, language } = useLanguage();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizzes, setQuizzes] = useState<QuizWithId[]>([]);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [activeSection, setActiveSection] = useState('import');
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<Map<string, number>>(new Map());
  const [generatedVideos, setGeneratedVideos] = useState<Map<string, Blob>>(new Map());
  const { config, updateConfig } = useQuizConfig();
  const { template, updateTemplate } = useTemplate();

  const {
    isGenerating,
    isRecording,
    progress,
    error: generationError,
    isVideoReady,
    handleDownload,
    resetVideo,
    startGeneration,
    stopGeneration,
  } = useVideoGenerator({
    quiz,
    config,
    canvas,
    template,
  });

  const handleQuizImported = (importedQuiz: Quiz) => {
    setQuiz(importedQuiz);
    // Se houver apenas um quiz, também adiciona à lista
    if (quizzes.length === 0) {
      setQuizzes([{
        ...importedQuiz,
        id: `quiz-${Date.now()}`,
        fileName: 'quiz.csv',
      }]);
    }
  };

  const handleMultipleQuizzesImported = (importedQuizzes: Quiz[]) => {
    const newQuizzes: QuizWithId[] = importedQuizzes.map((q, index) => ({
      ...q,
      id: `quiz-${Date.now()}-${index}`,
      fileName: `quiz-${index + 1}.csv`,
    }));
    setQuizzes(newQuizzes);
    // Define o primeiro quiz como ativo para preview
    if (newQuizzes.length > 0) {
      setQuiz(newQuizzes[0]);
    }
  };

  const handleCanvasReady = (canvasElement: HTMLCanvasElement) => {
    setCanvas(canvasElement);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const generateAllVideos = async () => {
    if (quizzes.length === 0) return;

    setIsGeneratingAll(true);
    setGeneratedVideos(new Map());
    const progressMap = new Map<string, number>();
    quizzes.forEach(q => progressMap.set(q.id, 0));
    setGenerationProgress(progressMap);

    try {
      for (let i = 0; i < quizzes.length; i++) {
        const currentQuiz = quizzes[i];
        
        try {
          // Atualiza progresso inicial
          progressMap.set(currentQuiz.id, 0);
          setGenerationProgress(new Map(progressMap));

          // Gera o vídeo usando o serviço
          const videoBlob = await generateVideoForQuiz(
            currentQuiz,
            config,
            template || DEFAULT_TEMPLATE,
            DEFAULT_VIDEO_SETTINGS,
            (progress) => {
              // Atualiza progresso durante a geração
              progressMap.set(currentQuiz.id, progress * 100);
              setGenerationProgress(new Map(progressMap));
            },
            language // Passa o idioma atual
          );

          // Salva o vídeo gerado
          setGeneratedVideos(prev => {
            const newMap = new Map(prev);
            newMap.set(currentQuiz.id, videoBlob);
            return newMap;
          });
          
          // Marca como completo
          progressMap.set(currentQuiz.id, 100);
          setGenerationProgress(new Map(progressMap));

        } catch (error) {
          console.error(`Erro ao gerar vídeo para quiz ${currentQuiz.id}:`, error);
          // Continua com o próximo quiz mesmo se houver erro
        }
      }
    } catch (error) {
      console.error('Erro ao gerar vídeos:', error);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const downloadAllAsZip = async () => {
    if (generatedVideos.size === 0) return;

    const videos = Array.from(generatedVideos.entries()).map(([quizId, blob]) => {
      const quiz = quizzes.find(q => q.id === quizId);
      const extension = config.videoFormat === 'mp4' ? 'mp4' : 'webm';
      const fileName = `${quiz?.fileName.replace('.csv', '') || 'quiz'}-${quizId}.${extension}`;
      return { fileName, blob };
    });

    const zipBlob = await createZipFromVideos(videos);
    downloadBlob(zipBlob, `quizzes-${Date.now()}.zip`);
  };

  return (
    <div className="app">
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      <Header />
      
      <main className="app-main">
        <div className="app-container">
          <div className="app-sidebar-content">
            {activeSection === 'import' && (
              <>
                <Card className="app-section-card">
                  <CardHeader>
                    <CardTitle>{t('app.importQuiz')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CSVImporter 
                      onQuizImported={handleQuizImported}
                      onMultipleQuizzesImported={handleMultipleQuizzesImported}
                      maxFiles={10}
                    />
                  </CardContent>
                </Card>

                {quiz && (
                  <Card className="app-section-card">
                    <CardHeader>
                      <CardTitle>{t('app.previewQuiz')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QuizPreview quiz={quiz} />
                    </CardContent>
                  </Card>
                )}

                <Card className="app-section-card">
                  <CardHeader>
                    <CardTitle>{t('app.generateVideo')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="generation-controls">
                      {!isGenerating ? (
                        <button
                          className="btn btn-primary"
                          onClick={startGeneration}
                          disabled={!quiz || !canvas}
                        >
                          {t('generation.startGeneration')}
                        </button>
                      ) : (
                        <button
                          className="btn btn-danger"
                          onClick={stopGeneration}
                        >
                          {t('generation.stopGeneration')}
                        </button>
                      )}

                      {isGenerating && (
                        <div className="generation-progress">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${progress * 100}%` }}
                            />
                          </div>
                          <span className="progress-text">
                            {Math.round(progress * 100)}%
                          </span>
                        </div>
                      )}

                      {generationError && (
                        <div className="error-message">
                          {generationError}
                        </div>
                      )}

                      {isVideoReady && (
                        <div className="video-ready">
                          <div className="success-message">
                            {t('generation.videoGenerated')}
                          </div>
                          <div className="video-ready-actions">
                            <button
                              className="btn btn-success"
                              onClick={handleDownload}
                            >
                              {t('generation.downloadVideo')}
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={resetVideo}
                            >
                              {t('generation.generateNewVideo')}
                            </button>
                          </div>
                        </div>
                      )}

                      {quizzes.length > 1 && (
                        <div className="multi-quiz-controls" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #2C2D33' }}>
                          <p className="hint-text" style={{ marginBottom: '12px' }}>
                            {quizzes.length} quizzes importados
                          </p>
                          
                          {!isGeneratingAll ? (
                            <button
                              className="btn btn-primary"
                              onClick={generateAllVideos}
                              disabled={!canvas || quizzes.length === 0}
                              style={{ width: '100%', marginBottom: '12px' }}
                            >
                              Gerar Todos os Vídeos ({quizzes.length})
                            </button>
                          ) : (
                            <div style={{ marginBottom: '12px' }}>
                              <div className="progress-bar" style={{ marginBottom: '8px' }}>
                                <div
                                  className="progress-fill"
                                  style={{ 
                                    width: `${(Array.from(generationProgress.values()).reduce((a, b) => a + b, 0) / (quizzes.length * 100)) * 100}%` 
                                  }}
                                />
                              </div>
                              <p className="hint-text" style={{ fontSize: '12px', textAlign: 'center' }}>
                                Gerando {Array.from(generationProgress.values()).filter(p => p === 100).length} de {quizzes.length} vídeos...
                              </p>
                            </div>
                          )}

                          {generatedVideos.size > 0 && generatedVideos.size === quizzes.length && (
                            <button
                              className="btn btn-success"
                              onClick={downloadAllAsZip}
                              style={{ width: '100%' }}
                            >
                              Baixar Todos os Vídeos (ZIP)
                            </button>
                          )}
                        </div>
                      )}

                      {!quiz && quizzes.length === 0 && (
                        <p className="hint-text">
                          {t('generation.importQuizToStart')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeSection === 'config' && (
              <Card className="app-section-card">
                <CardHeader>
                  <CardTitle>{t('app.configure')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuizConfigForm config={config} onConfigChange={updateConfig} />
                </CardContent>
              </Card>
            )}

            {activeSection === 'template' && (
              <Card className="app-section-card">
                <CardHeader>
                  <CardTitle>{t('app.template')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <TemplateEditor template={template} onTemplateChange={updateTemplate} />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="app-content">
            {activeSection === 'import' && quiz && (
              <Card className="app-section-card">
                <CardHeader>
                  <CardTitle>{t('app.preview')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoCanvas 
                    resolution={config.videoResolution}
                    onCanvasReady={handleCanvasReady} 
                  />
                  {isRecording && (
                    <div className="recording-indicator">
                      <span className="recording-dot"></span>
                      {t('generation.recording')}
                    </div>
                  )}
                  {isVideoReady && !isRecording && (
                    <div className="video-complete-indicator">
                      {t('generation.recordingComplete')}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === 'template' && (
              <Card className="app-section-card">
                <CardHeader>
                  <CardTitle>{t('app.preview')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <TemplatePreview template={template} resolution={config.videoResolution} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
