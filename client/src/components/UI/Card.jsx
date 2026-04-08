const Card = ({ children, className = '', title, ...props }) => {
  return (
    <article className={`rounded-3xl border-[3px] border-black bg-white p-6 shadow-[7px_7px_0_#000] ${className}`} {...props}>
      {title && (
        <h3 className="font-['Epilogue'] text-[28px] font-extrabold leading-tight text-black">
          {title}
        </h3>
      )}
      <div className={title ? 'mt-3' : ''}>{children}</div>
    </article>
  )
}

export default Card
