export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  sizes: string[];
  colors: string[];
  featured: boolean;
  inStock: boolean;
  inventory: Record<string, number>;
   priceId?: string; // ✅ add this
}

// Seed data for demo
export const products: Product[] = [
  {
    id: '1',
    name: '444 Essential Tee',
    price: 45,
    description: 'Premium heavyweight cotton tee with embroidered 444 detail. Oversized fit with dropped shoulders. Never 2 fly 2 PRAY.',
    category: 'Tops',
    images: ['/src/assets/product-tee-blue.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black'],
    featured: true,
    inStock: true,
    inventory: { S: 12, M: 15, L: 20, XL: 10, XXL: 5 },
      priceId: 'price_1SII1h7pABZIRK495XNnk7ZT', // ✅ your TEST Stripe Price
  },
  {
    id: '2',
    name: 'Divine Hoodie',
    price: 95,
    description: 'Heavyweight fleece hoodie with gold embroidered logo. Premium cotton blend with brushed interior.',
    category: 'Tops',
    images: ['/src/assets/product-tee-blue.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White'],
    featured: true,
    inStock: true,
    inventory: { S: 8, M: 12, L: 15, XL: 8, XXL: 4 },
  },
  {
    id: '3',
    name: 'Utility Cargo Pants',
    price: 120,
    description: 'Multi-pocket cargo pants with adjustable waist. Durable ripstop fabric with reinforced stitching.',
    category: 'Bottoms',
    images: ['/src/assets/product-tee-blue.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Gray'],
    featured: true,
    inStock: true,
    inventory: { S: 5, M: 10, L: 12, XL: 6, XXL: 3 },
  },
  {
    id: '4',
    name: 'Prayer Crewneck',
    price: 75,
    description: 'Classic crewneck sweatshirt with chest embroidery. Soft cotton fleece with ribbed cuffs.',
    category: 'Tops',
    images: ['/src/assets/product-tee-blue.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black'],
    featured: false,
    inStock: true,
    inventory: { S: 10, M: 14, L: 18, XL: 10, XXL: 6 },
  },
  {
    id: '5',
    name: 'Flight Jacket',
    price: 180,
    description: 'Premium bomber jacket with satin lining. Gold hardware and custom 444 patches.',
    category: 'Outerwear',
    images: ['/src/assets/product-tee-blue.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black'],
    featured: true,
    inStock: true,
    inventory: { S: 3, M: 5, L: 7, XL: 4, XXL: 2 },
  },
  {
    id: '6',
    name: 'Soul Shorts',
    price: 65,
    description: 'Relaxed fit shorts with drawstring waist. Premium cotton with side pockets.',
    category: 'Bottoms',
    images: ['/src/assets/product-tee-blue.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Gray'],
    featured: false,
    inStock: true,
    inventory: { S: 15, M: 20, L: 25, XL: 15, XXL: 8 },
  },
];

export const getProductById = (id: string) => {
  return products.find(p => p.id === id);
};

export const getFeaturedProducts = () => {
  return products.filter(p => p.featured);
};

export const getProductsByCategory = (category: string) => {
  return products.filter(p => p.category === category);
};
