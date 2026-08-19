import React from 'react';

const Avatar = ({ src, alt, className }) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`rounded-full object-cover object-top ${className || 'w-48 h-48 mx-auto'}`} 
    />
  );
};

export default Avatar;
