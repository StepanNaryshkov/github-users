import React from 'react';
import './index.css';

export function Spinner() {
  return (
    <div className='spinner'>
      <svg viewBox='22 22 44 44' width='40' height='40'>
        <circle
          className='spinner__circle'
          cx='44'
          cy='44'
          r='20.2'
          fill='none'
          strokeWidth='3.6'/>
      </svg>
    </div>
  );
}
