const PageIntro = ({ title, description }) => {
  return (
    <div className="mx-auto max-w-245 text-center" data-reveal>
      <h1 className="mt-6 font-['Epilogue'] text-[38px] font-black uppercase leading-[0.98] tracking-[-0.04em] text-black sm:text-[58px]">
        {title}
      </h1>
      {description ? (
        <p className="mx-auto mt-5 max-w-190 text-[18px] leading-relaxed text-[#676767]">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export default PageIntro