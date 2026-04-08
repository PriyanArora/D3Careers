const faqs = [
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. You can cancel your subscription whenever you want with no hidden cancellation fees.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes. Every plan starts with a trial period so you can evaluate pathway quality and mentor workflows.',
  },
  {
    question: 'Do I need technical skills to use this?',
    answer: 'No. D3Careers is designed for students and career teams with a no-code interface.',
  },
  {
    question: 'Can I filter by my background?',
    answer: 'Yes. You can filter by first-generation, transfer, and international background tags.',
  },
  {
    question: 'How do mentor sessions work?',
    answer: 'Open a profile and click Schedule Chat. Guests see a login prompt, and signed-in users can book directly.',
  },
  {
    question: 'Can universities use D3Careers for cohorts?',
    answer: 'Yes. The Academy plan supports scaled onboarding and institutional outcome tracking.',
  },
]

function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-28 pt-20 sm:pt-28">
      <div data-reveal className="mx-auto max-w-215 text-center">
        <p className="inline-flex border-[3px] border-black bg-[#f8d6b3] px-4 py-2 font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_#000]">
          Faq
        </p>
        <h2 className="mt-6 font-['Epilogue'] text-[38px] font-black uppercase leading-[0.98] tracking-[-0.04em] text-black sm:text-[56px]">
          Common questions
          <br />
          answered clearly
        </h2>
      </div>

      <div className="mx-auto mt-12 grid max-w-245 gap-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            data-reveal
            className="rounded-[20px] border-[3px] border-black bg-white p-5 shadow-[6px_6px_0_#000]"
          >
            <summary className="cursor-pointer list-none font-['Epilogue'] text-[26px] font-extrabold text-black">
              {faq.question}
            </summary>
            <p className="mt-3 text-[18px] leading-relaxed text-[#666666]">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export default FaqSection
