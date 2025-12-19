'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, ImageIcon } from 'lucide-react';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const productFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  compareAtPrice: z.string().optional(),
  stock: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

type Category = {
  id: number;
  name: string;
};

export default function EditProductPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const [newImages, setNewImages] = useState<File[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      compareAtPrice: '',
      stock: '0',
      categoryId: '',
      isActive: true,
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-product', params.productId],
    queryFn: async () => {
      const response = await axios.get<{
        product: {
          id: number;
          name: string;
          description?: string | null;
          price: string;
          compareAtPrice?: string | null;
          stock: number;
          isActive: boolean;
          categoryId: number;
        };
        categories: Category[];
      }>(`/api/admin/products/${params.productId}`);
      return response.data;
    },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      name: data.product.name,
      description: data.product.description ?? '',
      price: data.product.price,
      compareAtPrice: data.product.compareAtPrice ?? '',
      stock: String(data.product.stock),
      categoryId: String(data.product.categoryId),
      isActive: data.product.isActive,
    });
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const formData = new FormData();
      if (values.name) formData.append('name', values.name);
      formData.append('description', values.description ?? '');
      formData.append('price', values.price);
      formData.append('compareAtPrice', values.compareAtPrice ?? '');
      formData.append('stock', values.stock ?? '0');
      formData.append('categoryId', values.categoryId);
      formData.append('isActive', values.isActive ? 'true' : 'false');
      newImages.forEach((file) => formData.append('images', file));

      await axios.patch(`/api/admin/products/${params.productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      router.push('/admin/products');
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    mutation.mutate(values);
  };

  if (isLoading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Edit Product</h1>
          <p className="text-muted-foreground text-sm">
            Update information or add new images for this product.
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{data.product.name}</CardTitle>
          <CardDescription>Last updated product details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Handwoven Wool Basket"
                {...form.register('name')}
                aria-invalid={!!form.formState.errors.name}
              />
              {form.formState.errors.name && (
                <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...form.register('description')} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (NPR) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...form.register('price')}
                  aria-invalid={!!form.formState.errors.price}
                />
                {form.formState.errors.price && (
                  <p className="text-destructive text-sm">{form.formState.errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Compare at price</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  {...form.register('compareAtPrice')}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" min="0" {...form.register('stock')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <select
                  id="categoryId"
                  className="border-input text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs focus-visible:ring-[3px]"
                  {...form.register('categoryId')}
                >
                  <option value="">Select category</option>
                  {data.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.categoryId && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="border-border bg-muted/30 flex items-center space-x-3 rounded-lg border p-3">
              <input
                id="isActive"
                type="checkbox"
                className="border-border size-4 rounded border"
                checked={form.watch('isActive')}
                onChange={(event) => form.setValue('isActive', event.target.checked)}
              />
              <Label htmlFor="isActive" className="font-medium">
                Publish product
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Add Additional Images</Label>
              <div className="flex flex-wrap items-center gap-4">
                <label
                  htmlFor="images"
                  className="border-border text-muted-foreground hover:border-primary hover:text-foreground flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-4 py-3 text-sm"
                >
                  <ImageIcon className="h-5 w-5" />
                  {newImages.length > 0 ? `${newImages.length} new image(s)` : 'Upload new images'}
                </label>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setNewImages(files);
                  }}
                />
                {newImages.length > 0 && (
                  <button
                    type="button"
                    className="text-destructive text-xs underline-offset-2 hover:underline"
                    onClick={() => setNewImages([])}
                  >
                    Remove all
                  </button>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                Existing images remain untouched. Upload additional photos to highlight new details.
              </p>
            </div>

            <Button type="submit" disabled={mutation.isPending} className="w-full">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mutation.isPending ? 'Saving changes...' : 'Update Product'}
            </Button>
            {mutation.isError && (
              <p className="text-destructive text-sm">
                {(mutation.error as Error)?.message ?? 'Failed to update product.'}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
