'use client';

import { useMemo } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const categoryFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | null;
  isActive: boolean;
  createdAt: string;
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      parentId: '',
    },
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await axios.get<{ categories: Category[] }>('/api/admin/categories');
      return response.data.categories;
    },
  });

  const categories = data ?? [];
  const hasCategories = categories.length > 0;

  const mutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      await axios.post('/api/admin/categories', {
        name: values.name,
        description: values.description || undefined,
        parentId: values.parentId ? Number(values.parentId) : undefined,
      });
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const isSubmitting = mutation.isPending;

  const parentOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categories]
  );

  const onSubmit = (values: CategoryFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-2xl font-semibold">Manage Categories</h1>
        <p className="text-muted-foreground text-sm">
          Create and organize product categories for your catalog.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
            <CardDescription>Define category hierarchy to keep products organized.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Wooden Decor"
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
                  placeholder="Describe the type of items in this category"
                  rows={4}
                  {...form.register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Category (optional)</Label>
                <select
                  id="parentId"
                  className="border-input text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs focus-visible:ring-[3px]"
                  {...form.register('parentId')}
                >
                  <option value="">Top-level category</option>
                  {parentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </Button>
              {mutation.isError && (
                <p className="text-destructive text-sm">
                  {(mutation.error as Error)?.message ?? 'Failed to create category.'}
                </p>
              )}
              {mutation.isSuccess && (
                <p className="text-primary text-sm">Category created successfully.</p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Existing Categories</CardTitle>
              <CardDescription>Overview of your current categories.</CardDescription>
            </div>
            {isFetching && <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />}
          </CardHeader>
          <CardContent>
            {!hasCategories ? (
              <p className="text-muted-foreground text-sm">
                {isLoading
                  ? 'Loading categories...'
                  : 'No categories yet. Create one to get started.'}
              </p>
            ) : (
              <div className="border-border overflow-hidden rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-foreground px-4 py-3 font-medium">Name</th>
                      <th className="text-foreground px-4 py-3 font-medium">Parent</th>
                      <th className="text-foreground px-4 py-3 font-medium">Status</th>
                      <th className="text-foreground px-4 py-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => {
                      const parentName =
                        category.parentId &&
                        categories.find((parent) => parent.id === category.parentId)?.name;

                      return (
                        <tr key={category.id} className="border-border/60 border-t">
                          <td className="text-foreground px-4 py-3 font-medium">{category.name}</td>
                          <td className="text-muted-foreground px-4 py-3">{parentName ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                category.isActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {category.isActive ? 'Active' : 'Hidden'}
                            </span>
                          </td>
                          <td className="text-muted-foreground px-4 py-3">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
