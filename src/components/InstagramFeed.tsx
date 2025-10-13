import { Instagram } from "lucide-react";

// Mock Instagram posts
const mockPosts = [
  { id: 1, image: "/src/assets/product-tee-blue.jpg" },
  { id: 2, image: "/src/assets/product-tee-blue.jpg" },
  { id: 3, image: "/src/assets/product-tee-blue.jpg" },
  { id: 4, image: "/src/assets/product-tee-blue.jpg" },
  { id: 5, image: "/src/assets/product-tee-blue.jpg" },
  { id: 6, image: "/src/assets/product-tee-blue.jpg" },
];

export const InstagramFeed = () => {
  return (
<section className="relative py-16 overflow-hidden hidden md:block">

      {/* SAME 444 MOTIF — one even row across */}
      <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 sm:px-8 flex items-center justify-between">
          <span className="font-dancing text-[#00C853] opacity-[0.1] text-[10rem] md:text-[16rem] leading-none">444</span>
          <span className="font-dancing text-[#00C853] opacity-[0.1] text-[10rem] md:text-[16rem] leading-none">444</span>
          <span className="font-dancing text-[#00C853] opacity-[0.1] text-[10rem] md:text-[16rem] leading-none">444</span>
        </div>
      </div>

      {/* Foreground content */}
      <div className="container px-4 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">@444soulfly</h2>
          <a
            href="https://instagram.com/444soulfly"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-[#00C853] transition-colors"
          >
            <Instagram className="h-5 w-5" />
            <span>Follow us on Instagram</span>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {mockPosts.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com/444soulfly"
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square overflow-hidden rounded-4 group"
            >
              <img
                src={post.image}
                alt={`Instagram post ${post.id}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
