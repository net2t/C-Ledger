import React from 'react';

export default function Input({ label, type = 'text', value, onChange, placeholder, required = false, style = {} }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: '6px',
          color: '#444'
        }}>
          {label} {required && '*'}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '9px 12px',
          border: '3px solid #0a0a0a',
          fontFamily: 'var(--font-main)',
          fontSize: '13px',
          fontWeight: '500',
          background: '#fafaf0',
          boxShadow: '3px 3px 0 #0a0a0a',
          outline: 'none',
          transition: 'box-shadow 0.1s',
          ...style
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = '5px 5px 0 #0a0a0a';
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = '3px 3px 0 #0a0a0a';
        }}
      />
    </div>
  );
}
