import { QuizConfig } from '../../types/config';
import { ThemeSelector } from './ThemeSelector';
import { TimerConfig } from './TimerConfig';
import { useLanguage } from '../../hooks/useLanguage';
import './QuizConfigForm.css';

interface QuizConfigFormProps {
  config: QuizConfig;
  onConfigChange: (config: QuizConfig) => void;
}

export function QuizConfigForm({ config, onConfigChange }: QuizConfigFormProps) {
  const { t } = useLanguage();
  
  const updateField = <K extends keyof QuizConfig>(
    field: K,
    value: QuizConfig[K]
  ) => {
    onConfigChange({ ...config, [field]: value });
  };

  return (
    <div className="quiz-config-form">
      <div className="config-section">
        <label>
          <span>{t('quizConfig.questionsPerRound')}</span>
          <input
            type="number"
            min="1"
            max="50"
            value={config.questionsPerRound}
            onChange={(e) =>
              updateField('questionsPerRound', parseInt(e.target.value) || 1)
            }
          />
        </label>
        <small>{t('quizConfig.questionsPerRoundDesc')}</small>
      </div>

      <div className="config-section">
        <label>
          <span>{t('quizConfig.optionsPerQuestion')}</span>
          <input
            type="number"
            min="2"
            max="6"
            value={config.optionsPerQuestion}
            onChange={(e) =>
              updateField('optionsPerQuestion', parseInt(e.target.value) || 2)
            }
          />
        </label>
        <small>{t('quizConfig.optionsPerQuestionDesc')}</small>
      </div>

      <TimerConfig
        timerPerQuestion={config.timerPerQuestion}
        onTimerChange={(timer) => updateField('timerPerQuestion', timer)}
      />

      <div className="config-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.enableMusic}
            onChange={(e) => updateField('enableMusic', e.target.checked)}
          />
          <span>{t('quizConfig.enableMusic')}</span>
        </label>
      </div>

      <div className="config-section">
        <label>
          <span>{t('quizConfig.backgroundColor')}</span>
          <div className="color-input-group">
            <input
              type="color"
              value={config.backgroundColor}
              onChange={(e) => updateField('backgroundColor', e.target.value)}
            />
            <input
              type="text"
              value={config.backgroundColor}
              onChange={(e) => updateField('backgroundColor', e.target.value)}
              placeholder="#1a1a2e"
            />
          </div>
        </label>
      </div>

      <div className="config-section">
        <label>
          <span>{t('quizConfig.textColor')}</span>
          <div className="color-input-group">
            <input
              type="color"
              value={config.textColor}
              onChange={(e) => updateField('textColor', e.target.value)}
            />
            <input
              type="text"
              value={config.textColor}
              onChange={(e) => updateField('textColor', e.target.value)}
              placeholder="#ffffff"
            />
          </div>
        </label>
      </div>

      <ThemeSelector
        selectedThemes={config.themes}
        onThemesChange={(themes) => updateField('themes', themes)}
      />

      <div className="config-section">
        <label>
          <span>{t('quizConfig.videoFormat')}</span>
          <select
            value={config.videoFormat}
            onChange={(e) => updateField('videoFormat', e.target.value as 'webm' | 'mp4')}
          >
            <option value="webm">WebM</option>
            <option value="mp4">MP4</option>
          </select>
        </label>
        <small>{t('quizConfig.videoFormatDesc')}</small>
      </div>

      <div className="config-section">
        <label>
          <span>{t('quizConfig.videoResolution')}</span>
          <select
            value={config.videoResolution}
            onChange={(e) => updateField('videoResolution', e.target.value as '1080x1920' | '720x1280' | '540x960')}
          >
            <option value="1080x1920">1080x1920 (Full HD)</option>
            <option value="720x1280">720x1280 (HD)</option>
            <option value="540x960">540x960 (SD)</option>
          </select>
        </label>
        <small>{t('quizConfig.videoResolutionDesc')}</small>
      </div>
    </div>
  );
}

