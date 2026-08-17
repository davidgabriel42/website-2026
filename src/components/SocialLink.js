import React from 'react';

const SocialLink = ({ url, icon, label }) => {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
      {icon && <span className="w-5 h-5">{icon}</span>}
      {label}
    </a>
  );
};

export default SocialLink;
