import { Search, FileText, Settings, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import './Sidebar.css';

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function Sidebar({ activeSection = 'import', onSectionChange }: SidebarProps) {
  const { t } = useLanguage();
  
  const menuItems = [
    { id: 'import', label: t('sidebar.importQuiz'), icon: FileText },
    { id: 'config', label: t('sidebar.configure'), icon: Settings },
    { id: 'template', label: t('sidebar.template'), icon: Layout },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12L12 3L21 12M12 3V21" />
            </svg>
          </div>
          <span className="logo-text">QUIZZTAB</span>
        </div>

        {/* Search Input */}
        <div className="sidebar-search">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder={t('sidebar.search')}
            className="search-input"
          />
          <div className="search-badge">F</div>
        </div>

        {/* Menu Items */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                className={cn(
                  "sidebar-nav-item",
                  isActive && "sidebar-nav-item-active"
                )}
                onClick={() => onSectionChange?.(item.id)}
              >
                <Icon className="nav-icon" size={20} />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
