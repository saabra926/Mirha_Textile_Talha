export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  ...props 
}) {
  const baseStyles = 'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-600 text-white hover:bg-gray-500 focus:ring-gray-400 shadow-md hover:shadow-lg',
    outline: 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:ring-gray-500',
    ghost: 'text-gray-300 hover:bg-gray-800 focus:ring-gray-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClassName}
      {...props}
    >
      {children}
    </button>
  );
}

