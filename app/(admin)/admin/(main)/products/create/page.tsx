'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
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

export default function CreateProductPage() {
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

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

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await axios.get<{ categories: Category[] }>('/api/admin/categories');
      return response.data.categories;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const formData = new FormData();
      formData.append('name', values.name);
      if (values.description) formData.append('description', values.description);
      formData.append('price', values.price);
      if (values.compareAtPrice) formData.append('compareAtPrice', values.compareAtPrice);
      if (values.stock) formData.append('stock', values.stock);
      formData.append('categoryId', values.categoryId);
      formData.append('isActive', values.isActive ? 'true' : 'false');
      selectedImages.forEach((file) => formData.append('images', file));

      await axios.post('/api/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      form.reset();
      setSelectedImages([]);
      router.push('/admin/products');
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Create Product</h1>
          <p className="text-muted-foreground text-sm">
            Add new handcrafted items to your storefront.
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>Fields marked with * are required.</CardDescription>
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
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe the materials, craftsmanship, and story behind this product."
                {...form.register('description')}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (NPR) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="1200"
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
                  placeholder="1500"
                  {...form.register('compareAtPrice')}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="10"
                  {...form.register('stock')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <select
                  id="categoryId"
                  disabled={isLoading}
                  className="border-input text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs focus-visible:ring-[3px]"
                  {...form.register('categoryId')}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
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
                Publish immediately
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Product Images</Label>
              <div className="flex flex-wrap items-center gap-4">
                <label
                  htmlFor="images"
                  className="border-border text-muted-foreground hover:border-primary hover:text-foreground flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-4 py-3 text-sm"
                >
                  <ImageIcon className="h-5 w-5" />
                  {selectedImages.length > 0
                    ? `${selectedImages.length} file(s) selected`
                    : 'Upload images'}
                </label>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setSelectedImages(files);
                  }}
                />
                {selectedImages.length > 0 && (
                  <button
                    type="button"
                    className="text-destructive text-xs underline-offset-2 hover:underline"
                    onClick={() => setSelectedImages([])}
                  >
                    Remove all
                  </button>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                Upload up to 5 images (JPG or PNG). Files are served from <code>/uploads</code>.
              </p>
            </div>

            <Button type="submit" disabled={mutation.isPending} className="w-full">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mutation.isPending ? 'Saving...' : 'Create Product'}
            </Button>
            {mutation.isError && (
              <p className="text-destructive text-sm">
                {(mutation.error as Error)?.message ?? 'Failed to create product.'}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
