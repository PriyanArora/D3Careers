const baseStyle =
  'inline-flex items-center justify-center border-[3px] border-black px-5 py-3 text-base font-semibold text-black shadow-[5px_5px_0_#000] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0'

const variants = {
  primary: 'bg-[#f7de5a]',
  secondary: 'bg-[#f8d6b3]',
  outline: 'bg-white',
  ghost: 'border-none bg-transparent p-0 shadow-none hover:translate-y-0 hover:opacity-75',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-3 text-base',
  lg: 'px-7 py-4 text-lg',
}

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variantClass = variants[variant] || variants.primary
  const sizeClass = sizes[size] || sizes.md

  return (
    <button className={`${baseStyle} ${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
