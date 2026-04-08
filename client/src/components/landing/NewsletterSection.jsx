function NewsletterSection() {
  return (
    <section id="newsletter" className="scroll-mt-28 py-20 sm:py-28">
      <div className="rounded-[28px] border-[3px] border-black bg-[#f8d6b3] p-6 shadow-[9px_9px_0_#000] sm:p-8 lg:p-10">
        <div data-reveal className="mx-auto max-w-205 text-center">
          <p className="inline-flex border-[3px] border-black bg-white px-4 py-2 font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_#000]">
            Newsletter
          </p>
          <h2 className="mt-6 font-['Epilogue'] text-[38px] font-black uppercase leading-[0.98] tracking-[-0.04em] text-black sm:text-[56px]">
            Join the D3Careers
            <br />
            guidance newsletter
          </h2>
          <p className="mx-auto mt-5 max-w-175 text-[18px] leading-relaxed text-[#676767]">
            Receive practical career playbooks, mentorship tips, and pathway insights directly in your inbox.
          </p>

          <form className="mx-auto mt-8 flex max-w-175 flex-col gap-4 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="h-14 w-full rounded-full border-[3px] border-black bg-white px-6 text-[18px] text-black outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center rounded-full border-[3px] border-black bg-[#f7de5a] px-8 text-[20px] font-semibold text-black shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-0.5"
            >
              Subscribe
            </button>
          </form>

          <p className="mt-6 text-[15px] text-[#5e5e5e]">D3Careers 2026. Built for student career clarity.</p>
        </div>
      </div>
    </section>
  )
}

export default NewsletterSection