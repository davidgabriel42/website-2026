import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const MainLayout = () => {
  // Initialize theme from localStorage (defaulting to 'dark' for David's snazzy unified dark mode)
  const [theme, setTheme] = useState(localStorage.getItem('copilot_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('copilot_theme', theme);
    document.querySelector('html').setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-base-300 text-base-content flex">
      
      {/* 
        Slick Fixed-Position Overlay Sidebar 
        - Collapses to a 2px glowing line (indicating its position).
        - Glides open to w-64 on hover without reflowing or shifting main page contents.
        - Uses tailwind 'group' classes to cleanly fade out contents when collapsed to prevent squishing.
      */}
      <aside className="w-20 hover:w-64 fixed left-0 top-0 h-screen bg-base-200 border-r-2 border-primary/40 z-50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xl group">
        
        {/* Navigation Menu */}
        <div className="p-4 flex-1">
          {/* Brand/Indicator when hovered */}
          <div className="flex items-center gap-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none">
            <span className="text-sm font-black tracking-widest text-primary uppercase">SITE MAP</span>
          </div>

          <ul className="menu menu-vertical p-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-56">
            <li>
              <NavLink 
                to="/" 
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
                to="/demos" 
                className={({ isActive }) => 
                  `px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-extrabold transition-all ${
                    isActive ? 'btn-primary text-white shadow-lg' : 'hover:bg-base-100 text-base-content/80 hover:text-white'
                  }`
                }
              >
                Demos Showcase
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/demos/jigsaw-puzzle" 
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
                href="https://www.linkedin.com/in/davidjgabriel/recent-activity/articles/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-extrabold transition-all hover:bg-base-100 text-base-content/80 hover:text-white"
              >
                Dev Blog
              </a>
            </li>
            <li>
              <NavLink 
                to="/hire-me" 
                className={({ isActive }) => 
                  `px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-extrabold transition-all ${
                    isActive ? 'btn-primary text-white shadow-lg' : 'hover:bg-base-100 text-base-content/80 hover:text-white'
                  }`
                }
              >
                Hire David
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Theme Controller (Light/Dark Toggle) in Footer of Sidebar */}
        <div className="p-4 border-t border-base-300 bg-base-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-3">
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
