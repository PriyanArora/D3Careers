import { ArrowRight } from 'lucide-react'
import gaugeImage from '../../assets/howitworks-gauge.jpg'
import coursesImage from '../../assets/howitworks-courses.png'

const steps = [
  {
    title: 'Explore your pathway map',
    copy: 'Open Sankey pathways and inspect real role transitions from your major.',
  },
  {
    title: 'Filter by your background',
    copy: 'Narrow by first-generation, transfer, or international context and depth.',
  },
  {
    title: 'Book mentor support',
    copy: 'Start a schedule flow and connect with alumni who already made that transition.',
  },
]

function HowItWorksSection() {
  return (
    <section id="how-it-work" className="scroll-mt-28 pt-20 sm:pt-28">
      <div className="rounded-[28px] border-[3px] border-black bg-[#f8d6b3] p-6 shadow-[9px_9px_0_#000] sm:p-8 lg:p-10">
        <div data-reveal className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <p className="inline-flex border-[3px] border-black bg-white px-4 py-2 font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_#000]">
              How it work
            </p>

            <h2 className="mt-5 font-['Epilogue'] text-[38px] font-black uppercase leading-[0.98] tracking-[-0.04em] text-black sm:text-[56px]">
              Three steps to
              <br />
              move faster
            </h2>

            <ol className="mt-8 space-y-4">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-[20px] border-[3px] border-black bg-white p-5 shadow-[6px_6px_0_#000]"
                >
                  <p className="font-['Lexend_Mega'] text-[12px] font-black uppercase tracking-widest text-[#646464]">
                    Step 0{index + 1}
                  </p>
                  <h3 className="mt-2 font-['Epilogue'] text-[28px] font-extrabold leading-tight text-black">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[18px] leading-relaxed text-[#676767]">
                    {step.copy}
                  </p>
                </li>
              ))}
            </ol>

            <a
              href="/pathways"
              className="mt-8 inline-flex items-center gap-2 border-[3px] border-black bg-[#f7de5a] px-6 py-3 text-[20px] font-semibold text-black shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-0.5"
            >
              Open pathways
              <ArrowRight size={20} />
            </a>
          </div>

          <div className="grid gap-5 self-center">
            <img
              src={gaugeImage}
              alt="Career progression gauge"
              className="rounded-3xl border-[3px] border-black shadow-[7px_7px_0_#000]"
            />
            <img
              src={coursesImage}
              alt="Career path cards preview"
              className="rounded-3xl border-[3px] border-black shadow-[7px_7px_0_#000]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection