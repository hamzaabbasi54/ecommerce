import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, id, error, ...props }, ref) => {
  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`w-full h-12 px-4 bg-surface-container-lowest border ${
          error
            ? 'border-error focus:ring-error focus:border-error'
            : 'border-outline-variant focus:ring-primary-container focus:border-primary-container'
        } rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 transition-colors duration-200`}
        {...props}
      />
      {error && (
        <p className="text-error text-xs mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
