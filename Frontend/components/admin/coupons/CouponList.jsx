"use client";

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Search, Pencil } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ActionButtons from '@/components/admin/ActionButtons';
import Pagination from '@/components/ui/Pagination';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CouponList({ initialCoupons, currentPage, totalPages, initialQuery = '' }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const initialRender = useRef(true);
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

  // Sync state if props change
  useEffect(() => {
    setCoupons(initialCoupons);
  }, [initialCoupons]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    router.push(`/admin/coupons?page=1&q=${encodeURIComponent(debouncedSearchTerm)}`);
  }, [debouncedSearchTerm, router]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    router.push(`/admin/coupons?page=${page}&q=${encodeURIComponent(searchTerm)}`);
  };

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

  // Filter logic moved to server
  const displayCoupons = coupons;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-border shadow-sm overflow-hidden relative">
      <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search coupon codes..." 
            className="pl-9 w-full bg-surface-container"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button onClick={openCreateModal} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Coupon
        </Button>
      </div>

      <div className="min-h-[300px]">
        <Table>
          <TableHeader className="bg-surface-container/50">
            <TableRow>
              <TableHead className="font-medium">Code</TableHead>
              <TableHead className="font-medium">Discount</TableHead>
              <TableHead className="font-medium">Usage</TableHead>
              <TableHead className="font-medium">Limits</TableHead>
              <TableHead className="font-medium">Expiry</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCoupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No coupons found.
                </TableCell>
              </TableRow>
            ) : (
              displayCoupons.map((coupon) => (
                <TableRow key={coupon.id} className="hover:bg-surface-container-low transition-colors">
                  <TableCell className="font-bold text-foreground">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">{coupon.code}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {coupon.timesUsed} {coupon.usageLimit && `/ ${coupon.usageLimit}`}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {coupon.minOrderValue ? `Min $${coupon.minOrderValue}` : 'No Min'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionButtons 
                      onEdit={() => openEditModal(coupon)}
                      onDelete={() => handleDelete(coupon.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />

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
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) => setFormData({...formData, discountType: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
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

