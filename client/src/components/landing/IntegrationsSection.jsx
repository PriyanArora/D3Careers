const integrations = [
  'MongoDB',
  'Cal.com',
  'SendGrid',
  'React',
  'D3 Sankey',
  'Render',
  'Vercel',
  'Upstash',
]

function IntegrationsSection() {
  return (
    <section id="integrations" className="scroll-mt-28 pt-20 sm:pt-28">
      <div className="rounded-[28px] border-[3px] border-black bg-[#dff5ef] p-6 shadow-[9px_9px_0_#000] sm:p-8 lg:p-10">
        <div data-reveal className="mx-auto max-w-230 text-center">
          <p className="inline-flex border-[3px] border-black bg-white px-4 py-2 font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_#000]">
            Integrations
          </p>
          <h2 className="mt-6 font-['Epilogue'] text-[38px] font-black uppercase leading-[0.98] tracking-[-0.04em] text-black sm:text-[56px]">
            Seamless integration
            <br />
            with all your tools
          </h2>
          <p className="mx-auto mt-5 max-w-190 text-[18px] leading-relaxed text-[#676767]">
            D3Careers connects your pathway data, mentorship workflow, and communication stack in one frictionless flow.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.map((name) => (
            <div
              key={name}
              data-reveal
              className="rounded-[20px] border-[3px] border-black bg-white p-5 text-center shadow-[6px_6px_0_#000]"
            >
              <p className="font-['Epilogue'] text-[24px] font-extrabold text-black">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default IntegrationsSection
