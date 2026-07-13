"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Search, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CouponList({ initialCoupons }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null); // null = create mode, object = edit mode
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    usageLimit: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', usageLimit: '', expiryDate: '' });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderValue: coupon.minOrderValue ? coupon.minOrderValue.toString() : '',
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingCoupon) {
        // Edit mode
        const response = await axios.put(`/api/admin/coupons/${editingCoupon.id}`, formData, { withCredentials: true });
        if (response.data.success) {
          setCoupons(coupons.map(c => c.id === editingCoupon.id ? response.data.data : c));
          closeModal();
          router.refresh();
        }
      } else {
        // Create mode
        const response = await axios.post('/api/admin/coupons', formData, { withCredentials: true });
        if (response.data.success) {
          setCoupons([response.data.data, ...coupons]);
          closeModal();
          router.refresh();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingCoupon ? 'update' : 'create'} coupon`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      try {
        await axios.delete(`/api/admin/coupons/${id}`, { withCredentials: true });
        setCoupons(coupons.filter((c) => c.id !== id));
        router.refresh();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting coupon');
      }
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-border shadow-sm overflow-hidden relative">
      <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search coupon codes..." 
            className="pl-9 w-full bg-surface-container"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={openCreateModal} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Coupon
        </Button>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-surface-container/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Discount</th>
              <th className="px-6 py-4 font-medium">Usage</th>
              <th className="px-6 py-4 font-medium">Limits</th>
              <th className="px-6 py-4 font-medium">Expiry</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                  No coupons found.
                </td>
              </tr>
            ) : (
              filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-border hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">{coupon.code}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {coupon.timesUsed} {coupon.usageLimit && `/ ${coupon.usageLimit}`}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {coupon.minOrderValue ? `Min $${coupon.minOrderValue}` : 'No Min'}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(coupon)}>
                      <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-[450px] overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-error/10 text-error rounded border border-error/20 text-sm">{error}</div>}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Coupon Code *</label>
                <Input 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                  placeholder="e.g. SUMMER20"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value *</label>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discountValue} 
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Order Value ($)</label>
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minOrderValue} 
                  onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})} 
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Usage Limit</label>
                  <Input 
                    type="number"
                    min="1"
                    value={formData.usageLimit} 
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})} 
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiry Date</label>
                  <Input 
                    type="date"
                    value={formData.expiryDate} 
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (editingCoupon ? 'Updating...' : 'Creating...') : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

