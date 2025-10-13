import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#E8E9DF]">
      <Header />

      {/* bg + 444 motif */}
      <main className="relative flex-1 bg-[#E8E9DF] overflow-hidden">
        {/* BACKGROUND: even row of faint 444s across (desktop and up) */}
        <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
          <div className="hidden md:flex absolute inset-x-0 top-20 justify-between px-8">
            <span className="font-dancing text-[#00C853] opacity-[0.08] text-[10rem] leading-none">444</span>
            <span className="font-dancing text-[#00C853] opacity-[0.08] text-[10rem] leading-none">444</span>
            <span className="font-dancing text-[#00C853] opacity-[0.08] text-[10rem] leading-none">444</span>
          </div>
        </div>

        {/* Foreground content */}
        <div className="container px-4 py-12 relative z-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              About{" "}
              <span className="font-allura font-normal leading-none">Soulfly</span>
              <span className="font-dancing text-[#00C853] ml-2 align-super text-[0.5em]">444</span>
            </h1>

            <p className="text-xl text-neutral-600 mb-12 italic">
              Never <span className="text-[#00C853] font-semibold">2</span> fly{" "}
              <span className="text-[#00C853] font-semibold">2</span> PRAY
            </p>

            <div className="space-y-8 text-lg leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                <p className="text-neutral-600">
                  Soulfly was born from a belief that faith and fashion can coexist in perfect harmony.
                  We create premium streetwear that speaks to those who walk with purpose, pray with
                  intention, and dress with confidence.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">The 444 Philosophy</h2>
                <p className="text-neutral-600">
                  The number 444 represents divine protection, encouragement, and the presence of angels.
                  It's a reminder that you're on the right path, supported by higher powers. Every piece
                  we create carries this sacred symbolism, a subtle reminder woven into premium materials
                  and thoughtful design.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
                <p className="text-neutral-600 mb-4">
                  Quality is non-negotiable. We use premium materials, ethical manufacturing, and
                  meticulous attention to detail in every garment. When you wear Soulfly, you're wearing
                  more than clothing—you're wearing a statement of faith, purpose, and elevated style.
                </p>
                <p className="text-neutral-600">
                  Each drop is carefully curated, limited in quantity, and designed to become a staple
                  in your wardrobe for years to come.
                </p>
              </section>

              <section className="pt-8 border-t border-[#00C853]/30">
                <h2 className="text-2xl font-bold mb-4">Join the Movement</h2>
                <p className="text-neutral-600">
                  Soulfly is more than a brand—it’s a community of believers who understand that style
                  and spirituality aren’t opposites, they’re complements. Follow our journey, share your
                  story, and wear your faith proudly.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
