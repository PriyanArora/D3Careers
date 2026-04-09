function HeroSection() {
  return (
    <section id="hero" className="scroll-mt-28 py-24 sm:py-32">
      <div data-reveal className="mx-auto max-w-230 text-center">
        <h1 className="font-['Epilogue'] text-[48px] font-black uppercase leading-[0.95] tracking-[-0.04em] text-black sm:text-[84px]">
          VISUALISE YOUR CAREER PATH
        </h1>

        <p className="mx-auto mt-7 max-w-190 text-[20px] leading-relaxed text-[#4d4d4d]">
          Built from a real alumni dataset, D3Careers visualises transitions with D3.js Sankey diagrams so you can explore how majors connect to real roles over time.
        </p>
      </div>
    </section>
  )
}

export default HeroSection