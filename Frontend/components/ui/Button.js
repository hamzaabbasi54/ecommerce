import React from 'react';

const Button = ({ children, isLoading, className = '', ...props }) => {
  return (
    <button
      disabled={isLoading || props.disabled}
      className={`w-full h-12 bg-primary-container text-on-primary-container font-button text-button uppercase rounded-lg hover:bg-primary transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isLoading ? 'LOADING...' : children}
    </button>
  );
};

export default Button;
