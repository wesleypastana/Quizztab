import { useState } from 'react';
import { Quiz } from '../../types/quiz';
import { useLanguage } from '../../hooks/useLanguage';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './QuizPreview.css';

interface QuizPreviewProps {
  quiz: Quiz;
}

export function QuizPreview({ quiz }: QuizPreviewProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="quiz-preview">
      <div className="quiz-preview-header">
        <div className="quiz-preview-info">
          <h3>{t('quizPreview.title')}</h3>
          <div className="quiz-preview-stats">
            <span>{quiz.questions.length} {t('quizPreview.questions')}</span>
          </div>
        </div>
        <button
          className="quiz-preview-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Ocultar perguntas' : 'Mostrar perguntas'}
        >
          {isExpanded ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>
      </div>

      {quiz.metadata?.title && (
        <div className="quiz-preview-title">
          <strong>Título:</strong> {quiz.metadata.title}
        </div>
      )}

      {isExpanded && (
        <div className="quiz-preview-questions">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="quiz-preview-question">
              <div className="question-number">{t('quizPreview.question')} {index + 1}</div>
              <div className="question-text">{question.text}</div>
              <div className="question-options">
                {question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`question-option ${
                      option === question.correctAnswer ? 'correct' : ''
                    }`}
                  >
                    {option === question.correctAnswer && (
                      <span className="correct-badge">✓</span>
                    )}
                    {option}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

