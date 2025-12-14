import { useState, useEffect } from 'react';
import { QuizTemplate, DEFAULT_TEMPLATE } from '../../types/template';
import { useLanguage } from '../../hooks/useLanguage';
import './TemplateEditor.css';

interface TemplateEditorProps {
  template: QuizTemplate;
  onTemplateChange: (template: QuizTemplate) => void;
}

export function TemplateEditor({ template, onTemplateChange }: TemplateEditorProps) {
  const { t } = useLanguage();
  const [localTemplate, setLocalTemplate] = useState<QuizTemplate>(template);

  useEffect(() => {
    setLocalTemplate(template);
  }, [template]);

  const updateField = <K extends keyof QuizTemplate>(
    field: K,
    value: QuizTemplate[K]
  ) => {
    const updated = { ...localTemplate, [field]: value };
    setLocalTemplate(updated);
    onTemplateChange(updated);
  };

  const resetToDefault = () => {
    setLocalTemplate(DEFAULT_TEMPLATE);
    onTemplateChange(DEFAULT_TEMPLATE);
  };

  return (
    <div className="template-editor">
      <div className="template-editor-header">
        <h3>{t('templateEditor.title')}</h3>
        <button className="btn btn-secondary btn-sm" onClick={resetToDefault}>
          {t('templateEditor.restoreDefault')}
        </button>
      </div>

      <div className="template-sections">
        {/* Cores */}
        <section className="template-section">
          <h4>{t('templateEditor.colors')}</h4>
          
          <div className="template-field">
            <label>
              <span>{t('templateEditor.backgroundColor')}</span>
              <div className="color-input-group">
                <input
                  type="color"
                  value={localTemplate.backgroundColor}
                  onChange={(e) => updateField('backgroundColor', e.target.value)}
                />
                <input
                  type="text"
                  value={localTemplate.backgroundColor}
                  onChange={(e) => updateField('backgroundColor', e.target.value)}
                  placeholder="#1a1a2e"
                />
              </div>
            </label>
          </div>

          <div className="template-field">
            <label>
              <span>{t('templateEditor.textColor')}</span>
              <div className="color-input-group">
                <input
                  type="color"
                  value={localTemplate.textColor}
                  onChange={(e) => updateField('textColor', e.target.value)}
                />
                <input
                  type="text"
                  value={localTemplate.textColor}
                  onChange={(e) => updateField('textColor', e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </label>
          </div>

          <div className="template-field">
            <label>
              <span>{t('templateEditor.questionBackgroundColor')}</span>
              <div className="color-input-group">
                <input
                  type="color"
                  value={localTemplate.questionBgColor.replace(/rgba?\([^)]+\)/, '#ffffff')}
                  onChange={(e) => {
                    const rgba = hexToRgba(e.target.value, 0.15);
                    updateField('questionBgColor', rgba);
                  }}
                />
                <input
                  type="text"
                  value={localTemplate.questionBgColor}
                  onChange={(e) => updateField('questionBgColor', e.target.value)}
                  placeholder="rgba(255, 255, 255, 0.15)"
                />
              </div>
            </label>
          </div>

          <div className="template-field">
            <label>
              <span>{t('templateEditor.optionsBackgroundColor')}</span>
              <div className="color-input-group">
                <input
                  type="color"
                  value={localTemplate.optionBgColor.replace(/rgba?\([^)]+\)/, '#ffffff')}
                  onChange={(e) => {
                    const rgba = hexToRgba(e.target.value, 0.12);
                    updateField('optionBgColor', rgba);
                  }}
                />
                <input
                  type="text"
                  value={localTemplate.optionBgColor}
                  onChange={(e) => updateField('optionBgColor', e.target.value)}
                  placeholder="rgba(255, 255, 255, 0.12)"
                />
              </div>
            </label>
          </div>

          <div className="template-field">
            <label>
              <span>{t('templateEditor.correctAnswerColor')}</span>
              <div className="color-input-group">
                <input
                  type="color"
                  value={localTemplate.correctAnswerColor}
                  onChange={(e) => updateField('correctAnswerColor', e.target.value)}
                />
                <input
                  type="text"
                  value={localTemplate.correctAnswerColor}
                  onChange={(e) => updateField('correctAnswerColor', e.target.value)}
                  placeholder="#4ade80"
                />
              </div>
            </label>
          </div>

          <div className="template-field">
            <label>
              <span>{t('templateEditor.timerColor')}</span>
              <div className="color-input-group">
                <input
                  type="color"
                  value={localTemplate.timerProgressColor}
                  onChange={(e) => updateField('timerProgressColor', e.target.value)}
                />
                <input
                  type="text"
                  value={localTemplate.timerProgressColor}
                  onChange={(e) => updateField('timerProgressColor', e.target.value)}
                  placeholder="#4ade80"
                />
              </div>
            </label>
          </div>
        </section>

        {/* Fontes */}
        <section className="template-section">
          <h4>{t('templateEditor.fonts')}</h4>
          
          <div className="template-field">
            <label>
              <span>{t('templateEditor.questionFontSize')}</span>
              <input
                type="number"
                min="24"
                max="80"
                value={localTemplate.questionFontSize}
                onChange={(e) => updateField('questionFontSize', parseInt(e.target.value) || 52)}
              />
              <small>{localTemplate.questionFontSize}px</small>
            </label>
          </div>

          <div className="template-field">
            <label>
              <span>{t('templateEditor.optionsFontSize')}</span>
              <input
                type="number"
                min="20"
                max="60"
                value={localTemplate.optionFontSize}
                onChange={(e) => updateField('optionFontSize', parseInt(e.target.value) || 38)}
              />
              <small>{localTemplate.optionFontSize}px</small>
            </label>
          </div>

          <div className="template-field">
            <label>
              <span>{t('templateEditor.timerFontSize')}</span>
              <input
                type="number"
                min="24"
                max="72"
                value={localTemplate.timerFontSize}
                onChange={(e) => updateField('timerFontSize', parseInt(e.target.value) || 48)}
              />
              <small>{localTemplate.timerFontSize}px</small>
            </label>
          </div>

          <div className="template-field">
            <label>
              <span>{t('templateEditor.letterFontSize')}</span>
              <input
                type="number"
                min="20"
                max="50"
                value={localTemplate.letterFontSize}
                onChange={(e) => updateField('letterFontSize', parseInt(e.target.value) || 36)}
              />
              <small>{localTemplate.letterFontSize}px</small>
            </label>
          </div>
        </section>

        {/* Estilos */}
        <section className="template-section">
          <h4>🎭 Estilos</h4>
          
          <div className="template-field">
            <label>
              <span>Raio das Bordas (Geral)</span>
              <input
                type="number"
                min="0"
                max="50"
                value={localTemplate.borderRadius}
                onChange={(e) => updateField('borderRadius', parseInt(e.target.value) || 24)}
              />
              <small>{localTemplate.borderRadius}px</small>
            </label>
          </div>

          <div className="template-field">
            <label>
              <span>Raio das Bordas das Opções</span>
              <input
                type="number"
                min="0"
                max="50"
                value={localTemplate.optionBorderRadius}
                onChange={(e) => updateField('optionBorderRadius', parseInt(e.target.value) || 24)}
              />
              <small>{localTemplate.optionBorderRadius}px</small>
            </label>
          </div>

          <div className="template-field">
            <label>
              <span>Intensidade da Sombra</span>
              <input
                type="number"
                min="0"
                max="50"
                value={localTemplate.shadowBlur}
                onChange={(e) => updateField('shadowBlur', parseInt(e.target.value) || 15)}
              />
              <small>{localTemplate.shadowBlur}px</small>
            </label>
          </div>
        </section>

        {/* Espaçamentos */}
        <section className="template-section">
          <h4>📐 Espaçamentos</h4>
          
          <div className="template-field">
            <label>
              <span>Padding Geral</span>
              <input
                type="number"
                min="40"
                max="120"
                value={localTemplate.padding}
                onChange={(e) => updateField('padding', parseInt(e.target.value) || 80)}
              />
              <small>{localTemplate.padding}px</small>
            </label>
          </div>

          <div className="template-field">
            <label>
              <span>Espaçamento entre Opções</span>
              <input
                type="number"
                min="10"
                max="40"
                value={localTemplate.optionSpacing}
                onChange={(e) => updateField('optionSpacing', parseInt(e.target.value) || 20)}
              />
              <small>{localTemplate.optionSpacing}px</small>
            </label>
          </div>

          <div className="template-field">
            <label>
              <span>Altura das Opções</span>
              <input
                type="number"
                min="100"
                max="200"
                value={localTemplate.optionHeight}
                onChange={(e) => updateField('optionHeight', parseInt(e.target.value) || 140)}
              />
              <small>{localTemplate.optionHeight}px</small>
            </label>
          </div>
        </section>

        {/* Efeitos */}
        <section className="template-section">
          <h4>✨ Efeitos</h4>
          
          <div className="template-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={localTemplate.glassmorphism}
                onChange={(e) => updateField('glassmorphism', e.target.checked)}
              />
              <span>Glassmorphism (Efeito de Vidro)</span>
            </label>
          </div>

          <div className="template-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={localTemplate.gradientEnabled}
                onChange={(e) => updateField('gradientEnabled', e.target.checked)}
              />
              <span>Gradientes Habilitados</span>
            </label>
          </div>

          <div className="template-field">
            <label>
              <span>Velocidade da Animação</span>
              <input
                type="number"
                min="0.1"
                max="2"
                step="0.1"
                value={localTemplate.animationSpeed}
                onChange={(e) => updateField('animationSpeed', parseFloat(e.target.value) || 0.5)}
              />
              <small>{localTemplate.animationSpeed}s</small>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

// Helper function para converter hex para rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

