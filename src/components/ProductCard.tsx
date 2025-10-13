import { Link } from "react-router-dom";
import { Product } from "@/lib/products";

interface ProductCardProps { product: Product }

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
<Link to={`/product/${product.id}`} className="group block pb-6 md:pb-8">

      {/* larger canvas, object-contain, no borders */}

<div className="relative bg-[#E8E9DA] overflow-hidden mb-1">
  {/* 3:2 + 48px */}
  <div aria-hidden style={{ paddingTop: "calc(66.666% + 72px)" }} />
  <img
    src={product.images[0]}
    alt={product.name}
    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
  />
  {!product.inStock && (
    <div className="absolute inset-0 bg-white/85 flex items-center justify-center">
      <span className="text-xs font-semibold tracking-wider">OUT OF STOCK</span>
    </div>
  )}
</div>


      {/* tighter meta, a touch bigger */}
     <div className="text-center space-y-0">
        <div className="text-[11px] tracking-[0.22em] text-neutral-500 uppercase">
          Soulfly
        </div>
        <h3 className="text-lg md:text-xl leading-tight">
          {product.name}
        </h3>
        <p className="text-base md:text-lg text-neutral-900">
          ${product.price.toFixed(2)} USD
        </p>
      </div>
    </Link>
  );
};
