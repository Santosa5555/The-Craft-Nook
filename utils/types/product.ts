export type ProductType = {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock: number;
  isActive: boolean;
  category: { id: number; name: string } | null;
  images: { id: number; url: string }[];
  createdAt: string;
};