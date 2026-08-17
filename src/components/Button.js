import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ children, onClick, to }) => {
  const className = "btn btn-primary";
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};

export default Button;
