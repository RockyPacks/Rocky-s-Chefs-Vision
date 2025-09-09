import React from 'react';

type View = 'upload' | 'generate' | 'recipes' | 'favorites' | 'shopping_list' | 'settings' | 'history';

interface HeaderProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onNavigate }) => {
  const navItems: { view: View; label: string; icon: string }[] = [
    { view: 'upload', label: 'Home', icon: 'fa-home' },
    { view: 'favorites', label: 'Favorites', icon: 'fa-heart' },
    { view: 'shopping_list', label: 'Shopping List', icon: 'fa-shopping-cart' },
    { view: 'history', label: 'History', icon: 'fa-history' },
    { view: 'settings', label: 'Settings', icon: 'fa-cog' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => onNavigate('upload')}>
          <i className="fas fa-utensils text-green-600 text-2xl transition-transform duration-300 ease-in-out group-hover:rotate-12"></i>
          <h1 className="text-xl font-bold text-gray-800">Rocky's Chef's Vision</h1>
        </div>
        <ul className="flex items-center space-x-2 sm:space-x-4">
          {navItems.map(({ view, label, icon }) => (
            <li key={view}>
              <button
                onClick={() => onNavigate(view)}
                className={`flex flex-col sm:flex-row items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === view
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-current={activeView === view ? 'page' : undefined}
              >
                <i className={`fas ${icon} sm:mr-2 text-base`}></i>
                <span className="hidden sm:inline">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;