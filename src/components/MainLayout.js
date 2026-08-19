import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const MainLayout = () => {
  const [theme, setTheme] = useState(localStorage.getItem('copilot_theme') || 'dark');
  const [isExpanded, setIsExpanded] = useState(false); // Touch-compatible click toggle for mobile

  useEffect(() => {
    localStorage.setItem('copilot_theme', theme);
    document.querySelector('html').setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Close the drawer when a link is clicked
  const handleLinkClick = (e) => {
    e.stopPropagation(); // Prevents immediate re-toggling
    setIsExpanded(false);
  };

  return (
    <div className="min-h-screen bg-base-300 text-base-content flex">
      
      {/* 
        Slick Fixed-Position Overlay Sidebar 
        - Collapses to a 20px (w-20) panel.
        - Desktop: Glides open to w-64 on hover.
        - Mobile/Touch: Toggles open/closed smoothly on direct tap of the bar.
        - Safe Interaction: Disables pointer actions on invisible menu items when collapsed.
      */}
      <aside 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`fixed left-0 top-0 h-screen bg-base-200 border-r-2 border-primary/40 z-50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xl group cursor-pointer ${
          isExpanded ? 'w-64' : 'w-20 hover:w-64'
        }`}
      >
        
        {/* Navigation Menu */}
        <div className="p-4 flex-1 relative">
          
          {/* Centered expand indicator (visible only when collapsed to guide recruiters and visitors) */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 pointer-events-none select-none text-center flex flex-col items-center gap-2 ${
            isExpanded ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
          }`}>
            <span className="text-xl font-black text-primary animate-pulse">&gt;</span>
            <span className="text-[9px] font-black tracking-widest text-primary/60 uppercase [writing-mode:vertical-lr]">MENU</span>
          </div>

          {/* Brand/Indicator when hovered/expanded */}
          <div className={`flex items-center gap-2 mb-6 transition-opacity duration-300 select-none ${
            isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <span className="text-sm font-black tracking-widest text-primary uppercase">SITE MAP</span>
          </div>

          {/* 
            Pointer-Events Safe Menu List:
            Uses pointer-events-none when collapsed to prevent invisible fall-through clicks to LinkedIn!
            Only activates pointer events when expanded via state or desktop group-hover.
          */}
          <ul className={`menu menu-vertical p-0 gap-1 transition-opacity duration-300 w-56 ${
            isExpanded 
              ? 'opacity-100 pointer-events-auto' 
              : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
          }`}>
            <li>
              <NavLink 
                to="/" 
                onClick={handleLinkClick}
                className={({ isActive }) => 
                  `px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-extrabold transition-all ${
                    isActive ? 'btn-primary text-white shadow-lg' : 'hover:bg-base-100 text-base-content/80 hover:text-white'
                  }`
                }
              >
                Home
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/demos/jigsaw-puzzle" 
                onClick={handleLinkClick}
                className={({ isActive }) => 
                  `px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-extrabold transition-all ${
                    isActive ? 'btn-primary text-white shadow-lg' : 'hover:bg-base-100 text-base-content/80 hover:text-white'
                  }`
                }
              >
                3D Jigsaw Game
              </NavLink>
            </li>

            <li>
              <a 
                href="https://docs.google.com/document/d/1T4PW7TdsYxuVa48pqpJGPF_YyJ-GEJRQBvYSkvhMb6I/edit?usp=sharing"
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className="px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-extrabold transition-all hover:bg-base-100 text-base-content/80 hover:text-white"
              >
                Resume
              </a>
            </li>

            <li>
              <a 
                href="https://github.com/davidgabriel42"
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className="px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-extrabold transition-all hover:bg-base-100 text-base-content/80 hover:text-white"
              >
                GitHub
              </a>
            </li>

            <li>
              <a 
                href="https://www.linkedin.com/in/davidjgabriel/"
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className="px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-extrabold transition-all hover:bg-base-100 text-base-content/80 hover:text-white"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>

        {/* Theme Controller (Light/Dark Toggle) in Footer of Sidebar */}
        <div 
          onClick={(e) => e.stopPropagation()} // Prevents toggling theme from toggling sidebar expansion
          className={`p-4 border-t border-base-300 bg-base-100/50 transition-opacity duration-300 flex flex-col gap-3 ${
            isExpanded 
              ? 'opacity-100 pointer-events-auto' 
              : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Theme mode:</span>
            <span className="badge badge-primary badge-sm uppercase font-bold select-none">{theme}</span>
          </div>
          <label className="flex items-center justify-between cursor-pointer bg-base-200 p-2.5 rounded-lg border border-base-300 hover:bg-base-300 transition-all select-none">
            {/* Simple text labels replacing standard sun/moon emojis */}
            <span className="text-[10px] font-black tracking-wider uppercase text-base-content/50">Light</span>
            <input 
              type="checkbox" 
              className="toggle toggle-primary toggle-sm mx-2" 
              onChange={toggleTheme} 
              checked={theme === 'dark'}
            />
            <span className="text-[10px] font-black tracking-wider uppercase text-base-content/50">Dark</span>
          </label>
        </div>

      </aside>

      {/* Main Content Pane (Indented by 8px to never overlap the 2px left border) */}
      <main className="flex-1 pl-8 min-h-screen overflow-y-auto bg-base-300 transition-colors duration-300">
        <Outlet />
      </main>

    </div>
  );
};

export default MainLayout;
