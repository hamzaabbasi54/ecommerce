"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function OrderList({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const router = useRouter();

  const handleStatusChange = async (orderId, newStatus) => {
    if (confirm(`Change order status to ${newStatus}?`)) {
      setLoadingId(orderId);
      try {
        const response = await axios.put('/api/admin/orders', { orderId, status: newStatus }, { withCredentials: true });
        if (response.data.success) {
          setOrders(orders.map(o => o.id === orderId ? response.data.data : o));
          router.refresh();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error updating order status');
      } finally {
        setLoadingId(null);
      }
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'cancelled': 
      case 'returned': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-border shadow-sm overflow-hidden relative">
      <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders by ID, name, or email..." 
            className="pl-9 w-full bg-surface-container"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-surface-container/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Order ID</th>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Total</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                    #{order.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{order.user.name}</div>
                    <div className="text-xs text-muted-foreground">{order.user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={loadingId === order.id}
                      className={`text-xs rounded-full border px-2 py-1 font-medium capitalize ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="returned">Returned</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setViewOrder(order)}>
                      <Eye className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-foreground">Order Details</h2>
              <div className={`text-xs rounded-full border px-3 py-1 font-medium capitalize ${getStatusColor(viewOrder.status)}`}>
                {viewOrder.status}
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Customer Info</h3>
                  <p className="font-medium">{viewOrder.user.name}</p>
                  <p className="text-sm text-muted-foreground">{viewOrder.user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h3>
                  <p className="text-sm">
                    {viewOrder.address.street}<br/>
                    {viewOrder.address.city}, {viewOrder.address.province} {viewOrder.address.postalCode}<br/>
                    {viewOrder.address.country}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Order Items</h3>
                <div className="border border-border rounded-lg divide-y divide-border">
                  {viewOrder.items.map(item => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded border border-border bg-white flex items-center justify-center overflow-hidden">
                          {item.product.images[0] ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-surface-container" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span> <span>${viewOrder.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span> <span>${viewOrder.shippingCharge.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span> <span>${viewOrder.tax.toFixed(2)}</span></div>
                  {viewOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span> <span>-${viewOrder.discount.toFixed(2)}</span></div>}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span>Total</span> <span>${viewOrder.total.toFixed(2)}</span></div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end shrink-0">
              <Button onClick={() => setViewOrder(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
