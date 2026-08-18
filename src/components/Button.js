import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ children, onClick, to, href }) => {
  const className = "btn btn-primary px-6 font-bold tracking-wide uppercase rounded-lg shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150";
  
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};

export default Button;
