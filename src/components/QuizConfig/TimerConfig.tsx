import { useLanguage } from '../../hooks/useLanguage';
import './TimerConfig.css';

interface TimerConfigProps {
  timerPerQuestion: number;
  onTimerChange: (timer: number) => void;
}

export function TimerConfig({
  timerPerQuestion,
  onTimerChange,
}: TimerConfigProps) {
  const { t } = useLanguage();
  
  return (
    <div className="timer-config">
      <div className="config-section">
        <label>
          <span>{t('quizConfig.timerPerQuestion')}</span>
          <div className="timer-input-group">
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={timerPerQuestion}
              onChange={(e) => onTimerChange(parseInt(e.target.value))}
              className="timer-slider"
            />
            <input
              type="number"
              min="5"
              max="60"
              step="5"
              value={timerPerQuestion}
              onChange={(e) => onTimerChange(parseInt(e.target.value) || 5)}
              className="timer-input"
            />
            <span className="timer-unit">seg</span>
          </div>
        </label>
        <small>{t('quizConfig.timerPerQuestionDesc')}</small>
      </div>
    </div>
  );
}


