import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fafaf0',
          border: '3px solid #0a0a0a',
          boxShadow: '8px 8px 0 #0a0a0a',
          width: '100%',
          maxWidth: '560px',
          animation: 'modalIn 0.15s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            background: '#0a0a0a',
            color: '#FFE234',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '2px solid #FFE234',
              color: '#FFE234',
              width: '28px',
              height: '28px',
              fontSize: '16px',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#FFE234';
              e.target.style.color = '#0a0a0a';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = '#FFE234';
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { transform: translate(6px, 6px); opacity: 0.5; }
          to { transform: translate(0, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
