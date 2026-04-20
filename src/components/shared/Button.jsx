import React from 'react';

export default function Button({ children, onClick, variant = 'primary', size = 'normal', type = 'button', disabled = false }) {
  const baseStyles = {
    padding: size === 'small' ? '6px 12px' : '10px 20px',
    border: '3px solid #0a0a0a',
    fontFamily: 'var(--font-main)',
    fontSize: size === 'small' ? '11px' : '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.1s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: size === 'small' ? '3px 3px 0 #0a0a0a' : '4px 4px 0 #0a0a0a',
  };

  const variantStyles = {
    primary: {
      background: '#0a0a0a',
      color: '#FFE234',
    },
    success: {
      background: '#00C853',
      color: '#0a0a0a',
    },
    danger: {
      background: '#FF3B30',
      color: '#fafaf0',
    },
    yellow: {
      background: '#FFE234',
      color: '#0a0a0a',
    },
    secondary: {
      background: '#fafaf0',
      color: '#0a0a0a',
    },
  };

  const hoverStyles = disabled ? {} : {
    transform: 'translate(-2px, -2px)',
    boxShadow: size === 'small' ? '5px 5px 0 #0a0a0a' : '6px 6px 0 #0a0a0a',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...hoverStyles,
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translate(-2px, -2px)';
          e.target.style.boxShadow = size === 'small' ? '5px 5px 0 #0a0a0a' : '6px 6px 0 #0a0a0a';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translate(0, 0)';
        e.target.style.boxShadow = size === 'small' ? '3px 3px 0 #0a0a0a' : '4px 4px 0 #0a0a0a';
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translate(2px, 2px)';
          e.target.style.boxShadow = size === 'small' ? '2px 2px 0 #0a0a0a' : '2px 2px 0 #0a0a0a';
        }
      }}
      onMouseUp={(e) => {
        e.target.style.transform = 'translate(-2px, -2px)';
        e.target.style.boxShadow = size === 'small' ? '5px 5px 0 #0a0a0a' : '6px 6px 0 #0a0a0a';
      }}
    >
      {children}
    </button>
  );
}
