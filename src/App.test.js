import React from 'react';
import { render, screen } from '@testing-library/react';
import Avatar from './components/Avatar';

test('renders David Gabriel profile avatar cleanly', () => {
  const testSrc = "test-headshot.png";
  const testAlt = "David Gabriel Test Alt";
  
  render(<Avatar src={testSrc} alt={testAlt} />);
  
  // Locate headshot by alt text
  const avatarImg = screen.getByAltText(testAlt);
  
  expect(avatarImg).toBeInTheDocument();
  expect(avatarImg).toHaveAttribute('src', testSrc);
  
  // Verify that it is circular and aligned to the top (prevents cutting off his head)
  expect(avatarImg).toHaveClass('object-top');
  expect(avatarImg).toHaveClass('object-cover');
});
