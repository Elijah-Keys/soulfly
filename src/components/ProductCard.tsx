import { Link } from "react-router-dom";
import { Product } from "@/lib/products";
import { Badge } from "./ui/badge";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link 
      to={`/product/${product.id}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-4 bg-card border aspect-square mb-4">
        {/* 444 Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className="badge-444 bg-gold text-gold-foreground font-bold text-xs">
            444
          </Badge>
        </div>

        {/* Product Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-sm font-semibold">OUT OF STOCK</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-sm group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground">${product.price}</p>
      </div>
    </Link>
  );
};
