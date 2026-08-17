import React from 'react';

const Avatar = ({ src, alt }) => {
  return <img src={src} alt={alt} className="w-48 h-48 rounded-full mx-auto object-cover object-top" />;
};

export default Avatar;
