import { BookOpenCheck, Clock3, Workflow } from 'lucide-react'

const problemCards = [
  {
    icon: Workflow,
    title: 'Too many disconnected tools',
    copy: 'Students and mentors lose momentum when pathways, profiles, and booking sit in separate apps.',
  },
  {
    icon: Clock3,
    title: 'Time wasted on guesswork',
    copy: 'Without real transition data, students spend months exploring paths that do not fit their background.',
  },
  {
    icon: BookOpenCheck,
    title: 'Mentorship is hard to access',
    copy: 'Career support should be one click away once a student finds a role progression they trust.',
  },
]

function ProblemSection() {
  return (
    <section id="problem" className="scroll-mt-28 pt-20 sm:pt-28">
      <div data-reveal className="mx-auto max-w-215 text-center">
        <p className="inline-flex border-[3px] border-black bg-[#f8d6b3] px-4 py-2 font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_#000]">
          Problem
        </p>
        <h2 className="mt-6 font-['Epilogue'] text-[38px] font-black uppercase leading-[0.98] tracking-[-0.04em] text-black sm:text-[56px]">
          Career discovery should
          <br />
          not be this hard
        </h2>
        <p className="mx-auto mt-5 max-w-190 text-[19px] leading-relaxed text-[#676767]">
          Many first-generation students still navigate career planning without clear examples, trusted context, or fast access to mentors.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {problemCards.map((card) => (
          <article
            key={card.title}
            data-reveal
            className="rounded-3xl border-[3px] border-black bg-white p-6 shadow-[8px_8px_0_#000]"
          >
            <card.icon size={30} className="text-black" />
            <h3 className="mt-4 font-['Epilogue'] text-[28px] font-extrabold leading-tight text-black">
              {card.title}
            </h3>
            <p className="mt-3 text-[18px] leading-relaxed text-[#656565]">{card.copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProblemSection
