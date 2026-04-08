import { Quote } from 'lucide-react'
import leaderboardImage from '../../assets/testimonials-leaderboard.jpg'

const testimonials = [
  {
    name: 'Maya Thompson',
    role: 'Computer Science Student',
    quote:
      'I finally understood how people like me move from campus projects to full-time engineering roles.',
  },
  {
    name: 'Jordan Malik',
    role: 'Transfer Student',
    quote:
      'The filters made it easy to find realistic outcomes instead of random advice from social media.',
  },
  {
    name: 'Ari Chen',
    role: 'Alumni Mentor',
    quote:
      'Scheduling conversations with students became faster and more intentional because context is already there.',
  },
]

function TestimonialsSection() {
  return (
    <section id="testimonials" className="scroll-mt-28 pt-20 sm:pt-28">
      <div data-reveal className="mx-auto max-w-215 text-center">
        <p className="inline-flex border-[3px] border-black bg-[#f8d6b3] px-4 py-2 font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_#000]">
          Testimonials
        </p>
        <h2 className="mt-6 font-['Epilogue'] text-[38px] font-black uppercase leading-[0.98] tracking-[-0.04em] text-black sm:text-[56px]">
          Loved by students
          <br />
          and mentors
        </h2>
      </div>

      <div className="mt-12 grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <div className="grid gap-5">
          {testimonials.map((item) => (
            <article
              key={item.name}
              data-reveal
              className="rounded-3xl border-[3px] border-black bg-white p-6 shadow-[7px_7px_0_#000]"
            >
              <Quote size={24} className="text-black" />
              <p className="mt-3 text-[19px] leading-relaxed text-[#4f4f4f]">{item.quote}</p>
              <div className="mt-5 border-t-2 border-dashed border-[#d6d6d6] pt-4">
                <p className="font-['Epilogue'] text-[24px] font-bold text-black">{item.name}</p>
                <p className="text-[16px] text-[#6b6b6b]">{item.role}</p>
              </div>
            </article>
          ))}
        </div>

        <figure
          data-reveal
          className="rounded-3xl border-[3px] border-black bg-[#f7de5a] p-5 shadow-[8px_8px_0_#000]"
        >
          <img
            src={leaderboardImage}
            alt="D3Careers outcomes board"
            className="w-full rounded-[18px] border-2 border-black"
          />
          <figcaption className="mt-4 text-[17px] font-medium text-black">
            Progress and outcomes in one glance.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

export default TestimonialsSection
