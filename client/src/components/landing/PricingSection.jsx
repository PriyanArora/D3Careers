import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '19.99',
    tone: 'bg-white',
    features: ['Pathway explorer', 'Background filters', 'Community onboarding'],
  },
  {
    name: 'Pro',
    price: '49.99',
    tone: 'bg-[#f7de5a]',
    features: ['Everything in Starter', 'Priority mentor booking', 'Personalized pathway snapshots'],
  },
  {
    name: 'Academy',
    price: '99.99',
    tone: 'bg-[#dff5ef]',
    features: ['Everything in Pro', 'Institutional dashboards', 'Dedicated success support'],
  },
]

function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-28 pt-20 sm:pt-28">
      <div data-reveal className="mx-auto max-w-215 text-center">
        <p className="inline-flex border-[3px] border-black bg-[#f8d6b3] px-4 py-2 font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_#000]">
          Pricing
        </p>
        <h2 className="mt-6 font-['Epilogue'] text-[38px] font-black uppercase leading-[0.98] tracking-[-0.04em] text-black sm:text-[56px]">
          Choose the plan that
          <br />
          fits your goals
        </h2>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            data-reveal
            className={`${plan.tone} rounded-3xl border-[3px] border-black p-6 shadow-[8px_8px_0_#000]`}
          >
            <p className="font-['Lexend_Mega'] text-[11px] font-black uppercase tracking-[0.12em] text-[#4f4f4f]">
              {plan.name}
            </p>
            <p className="mt-4 font-['Epilogue'] text-[50px] font-black leading-none text-black">${plan.price}</p>
            <p className="text-[16px] text-[#5f5f5f]">per month</p>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[17px] text-black">
                  <Check size={18} className="mt-1 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href="/register"
              className="mt-8 inline-flex w-full items-center justify-center border-[3px] border-black bg-white px-5 py-3 text-[20px] font-semibold text-black shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-0.5"
            >
              Start for free
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PricingSection
