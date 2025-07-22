'use client';

import React, { ReactNode, useState } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  width?: string;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  width = '200px',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Determinar la posición del tooltip
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  // Determinar la posición de la flecha
  const getArrowStyles = () => {
    switch (position) {
      case 'top':
        return 'w-3 h-3 bg-gray-800 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2';
      case 'right':
        return 'w-3 h-3 bg-gray-800 transform rotate-45 absolute -left-1 top-1/2 -translate-y-1/2';
      case 'bottom':
        return 'w-3 h-3 bg-gray-800 transform rotate-45 absolute -top-1 left-1/2 -translate-x-1/2';
      case 'left':
        return 'w-3 h-3 bg-gray-800 transform rotate-45 absolute -right-1 top-1/2 -translate-y-1/2';
      default:
        return 'w-3 h-3 bg-gray-800 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* El elemento trigger */}
      {children}
      
      {/* El tooltip */}
      <div 
        className={`absolute ${getPositionStyles()} ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'} 
        transition-all duration-200 z-10 pointer-events-none`}
        style={{ width }}
      >
        <div className={`bg-gray-800 text-white text-xs rounded-md shadow-lg p-2 ${className}`}>
          {content}
          <div className={getArrowStyles()}></div>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;