import React from 'react';

const ColorMark = ({ color, className = 'h-6' }) => (
  <div
    aria-hidden="true"
    className={`w-1.5 ${className}`}
    style={{ backgroundColor: color }}
  />
);

export default ColorMark;
