const ErrorBanner = ({ message, className = '' }) => {
  if (!message) {
    return null
  }

  return (
    <div className={`rounded-3xl border-[3px] border-black bg-[#fff4f2] p-5 text-[#b42318] shadow-[6px_6px_0_#000] ${className}`}>
      {message}
    </div>
  )
}

export default ErrorBanner