'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { ProductType } from '@/utils/types/product';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Product = {
  id: number;
  name: string;
  slug: string;
  price: string | number; // Prisma Decimal serializes to string in JSON
  stock: number;
  isActive: boolean;
  category: { id: number; name: string } | null;
  images: { id: number; url: string }[];
  createdAt: string;
};

type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ProductsResponse = {
  products: Product[];
  pagination: PaginationMeta;
};

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isFetching } = useQuery<ProductsResponse>({
    queryKey: ['admin-products', page],
    queryFn: async () => {
      const response = await axios.get<ProductsResponse>('/api/admin/products', {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      await axios.delete(`/api/admin/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  // Transform products to match ProductType (convert price to string if needed)
  const products: ProductType[] =
    data?.products.map((product) => ({
      ...product,
      price: typeof product.price === 'string' ? product.price : String(product.price),
    })) ?? [];
  const pagination = data?.pagination;

  const handleDelete = (productId: number) => {
    if (!window.confirm('Delete this product? This action cannot be undone.')) return;
    deleteMutation.mutate(productId);
  };

  const totalItems = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground text-sm">
            Keep your handcrafted catalog fresh and organized.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/products/create">
            <PlusCircle className="h-4 w-4" />
            Create Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>All Products</CardTitle>
            <CardDescription>Tabular overview with quick actions and pagination.</CardDescription>
          </div>
          {isFetching && <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No products yet. Click “Create Product” to add your first item.
            </p>
          ) : (
            <>
              <div className="border-border rounded-xl border shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price (NPR)</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: ProductType) => (
                      <TableRow key={product.id}>
                        <TableCell className="text-foreground font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.category?.name ?? 'Uncategorized'}
                        </TableCell>
                        <TableCell className="text-foreground font-medium">
                          {Number(product.price).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{product.stock}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              product.isActive
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {product.isActive ? 'Published' : 'Draft'}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                              className="text-muted-foreground hover:text-foreground"
                              aria-label={`Edit ${product.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(product.id)}
                              className="text-destructive hover:text-destructive"
                              aria-label={`Delete ${product.name}`}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-muted-foreground mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                <p>
                  Showing {startItem}-{endItem} of {totalItems}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1 || isFetching}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages || isFetching}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
