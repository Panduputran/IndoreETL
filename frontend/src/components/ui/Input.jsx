// src/components/ui/Input.jsx
import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  id, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-slate-900 transition-all 
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400
          ${error ? 'border-red-500 bg-red-50/50' : 'border-slate-200 hover:border-slate-300'}
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;