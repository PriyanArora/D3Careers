import { BadgeCheck, BookOpenText, Sparkles } from 'lucide-react'
import benefitsCards from '../../assets/benefits-cards.png'

const benefits = [
  {
    icon: BookOpenText,
    title: 'One place for pathways',
    copy: 'See major-to-role transitions and timeline depth in one visual flow.',
  },
  {
    icon: Sparkles,
    title: 'Focused student experience',
    copy: 'Filter by major and background to find journeys that match your context.',
  },
  {
    icon: BadgeCheck,
    title: 'Ready to mentor quickly',
    copy: 'Move from discovery to booking with alumni mentors in a single interface.',
  },
]

function BenefitsSection() {
  return (
    <section id="benefits" className="scroll-mt-28 pt-20 sm:pt-28">
      <div data-reveal className="mx-auto max-w-215 text-center">
        <p className="inline-flex border-[3px] border-black bg-[#f7de5a] px-4 py-2 font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_#000]">
          Benefits
        </p>
        <h2 className="mt-6 font-['Epilogue'] text-[38px] font-black uppercase leading-[0.98] tracking-[-0.04em] text-black sm:text-[58px]">
          Built for students who
          <br />
          need clear next steps
        </h2>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-5">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              data-reveal
              className="rounded-3xl border-[3px] border-black bg-white p-6 shadow-[7px_7px_0_#000] sm:p-7"
            >
              <benefit.icon size={30} className="text-black" />
              <h3 className="mt-4 font-['Epilogue'] text-[28px] font-extrabold leading-tight text-black">
                {benefit.title}
              </h3>
              <p className="mt-3 text-[18px] leading-relaxed text-[#656565]">
                {benefit.copy}
              </p>
            </article>
          ))}
        </div>

        <figure
          data-reveal
          className="rounded-3xl border-[3px] border-black bg-[#f7de5a] p-5 shadow-[8px_8px_0_#000]"
        >
          <img
            src={benefitsCards}
            alt="D3Careers feature cards preview"
            className="w-full rounded-[18px] border-2 border-black object-cover"
          />
        </figure>
      </div>
    </section>
  )
}

export default BenefitsSection
