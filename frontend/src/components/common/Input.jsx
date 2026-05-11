import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(function Input(
  { label, error, className = '', id, type = 'text', ...rest },
  ref
) {
  const inputId = id || rest.name || `input-${Math.random().toString(36).slice(2, 8)}`;
  const hasError = Boolean(error);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-grid-1 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-small text-text-secondary uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={`h-11 w-full bg-surface border ${hasError ? 'border-error' : 'border-border'} rounded-[2px] px-grid-2 ${isPassword ? 'pr-10' : ''} text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white transition-colors ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-text-muted hover:text-white transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hasError && (
        <span className="text-small text-error">{error}</span>
      )}
    </div>
  );
});

export default Input;
