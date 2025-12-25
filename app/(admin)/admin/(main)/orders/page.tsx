'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowUpRight } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

type OrderRow = {
  id: number;
  orderNumber: string;
  totalAmount: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  itemCount: number;
  customer: {
    name: string;
    email: string;
    phoneNumber: string;
  };
};

type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type OrdersResponse = {
  orders: OrderRow[];
  pagination: PaginationMeta;
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isFetching } = useQuery<OrdersResponse>({
    queryKey: ['admin-orders', page],
    queryFn: async () => {
      const response = await axios.get<OrdersResponse>('/api/admin/orders', {
        params: { page, pageSize },
      });
      return response.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
      paymentStatus,
    }: {
      orderId: number;
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
    }) => {
      await axios.patch(`/api/admin/orders/${orderId}`, { status, paymentStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  const totalItems = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const handleRowClick = (orderId: number) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const handleStatusChange = (orderId: number, value: OrderStatus) => {
    statusMutation.mutate({ orderId, status: value });
  };

  const handlePaymentStatusChange = (orderId: number, value: PaymentStatus) => {
    statusMutation.mutate({ orderId, paymentStatus: value });
  };

  const statusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, string> = {
      PENDING: 'bg-amber-100 text-amber-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-rose-100 text-rose-800',
      REFUNDED: 'bg-slate-200 text-slate-800',
    };
    return map[status] ?? 'bg-muted text-foreground';
  };

  const paymentBadge = (status: PaymentStatus) => {
    const map: Record<PaymentStatus, string> = {
      UNPAID: 'bg-slate-200 text-slate-800',
      PAID: 'bg-emerald-100 text-emerald-800',
      REFUNDED: 'bg-rose-100 text-rose-800',
    };
    return map[status] ?? 'bg-muted text-foreground';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Orders</h1>
          <p className="text-muted-foreground text-sm">
            Review all customer orders and keep statuses up to date.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>Table view with quick status updates.</CardDescription>
          </div>
          {isFetching && <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <>
              <div className="border-border rounded-xl border shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total (NPR)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer"
                        onClick={() => handleRowClick(order.id)}
                      >
                        <TableCell className="text-foreground font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex flex-col">
                            <span className="text-foreground font-medium">
                              {order.customer.name}
                            </span>
                            <span className="text-xs">{order.customer.email}</span>
                            <span className="text-xs">{order.customer.phoneNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{order.itemCount}</TableCell>
                        <TableCell className="text-foreground font-semibold">
                          {Number(order.totalAmount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={statusBadge(order.status)}>{order.status}</Badge>
                            <select
                              className="border-border text-foreground bg-background rounded-md border px-2 py-1 text-xs shadow-sm"
                              defaultValue={order.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value as OrderStatus)
                              }
                              disabled={statusMutation.isPending}
                            >
                              {[
                                'PENDING',
                                'PROCESSING',
                                'SHIPPED',
                                'DELIVERED',
                                'CANCELLED',
                                'REFUNDED',
                              ].map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={paymentBadge(order.paymentStatus)}>
                              {order.paymentStatus}
                            </Badge>
                            <select
                              className="border-border text-foreground bg-background rounded-md border px-2 py-1 text-xs shadow-sm"
                              defaultValue={order.paymentStatus}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                handlePaymentStatusChange(order.id, e.target.value as PaymentStatus)
                              }
                              disabled={statusMutation.isPending}
                            >
                              {['UNPAID', 'PAID', 'REFUNDED'].map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(order.id);
                            }}
                            aria-label="View order detail"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
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
