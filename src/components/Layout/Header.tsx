import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import './Header.css';

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { language, setLanguage } = useLanguage();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left"></div>
        
        <div className="header-right">
          {/* Language Selector */}
          <div className="language-selector">
            <button
              className={`language-button ${language === 'pt' ? 'active' : ''}`}
              onClick={() => setLanguage('pt')}
              aria-label="Português"
            >
              PT
            </button>
            <button
              className={`language-button ${language === 'fr' ? 'active' : ''}`}
              onClick={() => setLanguage('fr')}
              aria-label="Français"
            >
              FR
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="theme-toggle-container">
            <button
              className={`theme-toggle-icon ${!isDarkMode ? 'active' : ''}`}
              onClick={() => setIsDarkMode(false)}
              aria-label="Light mode"
            >
              <Sun size={16} />
            </button>
            <Switch
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
              className="theme-switch"
            />
            <button
              className={`theme-toggle-icon ${isDarkMode ? 'active' : ''}`}
              onClick={() => setIsDarkMode(true)}
              aria-label="Dark mode"
            >
              <Moon size={16} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
