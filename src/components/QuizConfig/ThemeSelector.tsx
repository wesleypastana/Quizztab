import './ThemeSelector.css';

interface ThemeSelectorProps {
  selectedThemes: string[];
  onThemesChange: (themes: string[]) => void;
}

const AVAILABLE_THEMES = [
  { id: 'default', name: 'Padrão', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'science', name: 'Ciência', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'history', name: 'História', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'geography', name: 'Geografia', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 'sports', name: 'Esportes', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'entertainment', name: 'Entretenimento', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
];

export function ThemeSelector({ selectedThemes, onThemesChange }: ThemeSelectorProps) {
  const toggleTheme = (themeId: string) => {
    if (selectedThemes.includes(themeId)) {
      onThemesChange(selectedThemes.filter((t) => t !== themeId));
    } else {
      onThemesChange([...selectedThemes, themeId]);
    }
  };

  return (
    <div className="theme-selector">
      <label>
        <span>Temas</span>
        <small>Selecione os temas para aplicar nos vídeos</small>
      </label>
      <div className="theme-grid">
        {AVAILABLE_THEMES.map((theme) => {
          const isSelected = selectedThemes.includes(theme.id);
          return (
            <button
              key={theme.id}
              type="button"
              className={`theme-card ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleTheme(theme.id)}
              style={{ background: theme.gradient }}
            >
              <div className="theme-check">
                {isSelected && <span>✓</span>}
              </div>
              <span className="theme-name">{theme.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

