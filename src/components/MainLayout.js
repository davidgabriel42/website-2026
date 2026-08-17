import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex h-screen">
      <aside className="w-20 hover:w-64 transition-all duration-300 bg-base-200 border-r-2 border-base-300">
        <ul className="menu p-4">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/demos">Demos</NavLink></li>
          <li><NavLink to="/blog">Blog</NavLink></li>
          <li><NavLink to="/hire-me">Hire Me</NavLink></li>
        </ul>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
