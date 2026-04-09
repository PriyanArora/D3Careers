const Input = ({ label, id, error, helperText, className = '', ...props }) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label htmlFor={id} className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-black">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`h-13 w-full rounded-full border-[3px] px-5 text-[17px] outline-none transition ${
          error ? 'border-[#b42318] bg-[#fff4f2]' : 'border-black bg-white'
        } ${className}`}
        {...props}
      />
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-[#b42318]' : 'text-[#6a6a6a]'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
}

export default Input
