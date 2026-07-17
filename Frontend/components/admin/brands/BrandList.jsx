"use client";

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, Search, Image as ImageIcon } from 'lucide-react';
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

export default function BrandList({ initialBrands, currentPage, totalPages, initialQuery = '' }) {
  const [brands, setBrands] = useState(initialBrands);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const initialRender = useRef(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state if props change
  useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    router.push(`/admin/brands?page=1&q=${encodeURIComponent(debouncedSearchTerm)}`);
  }, [debouncedSearchTerm, router]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    router.push(`/admin/brands?page=${page}&q=${encodeURIComponent(searchTerm)}`);
  };

  const openModal = (brand = null) => {
    setEditingBrand(brand);
    if (brand) {
      setFormData({ name: brand.name, description: brand.description || '' });
      setPreviewUrl(brand.logo || '');
    } else {
      setFormData({ name: '', description: '' });
      setPreviewUrl('');
    }
    setLogoFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.description) data.append('description', formData.description);
      if (logoFile) data.append('logo', logoFile);

      const url = editingBrand ? `/api/admin/brands/${editingBrand.id}` : '/api/admin/brands';
      const method = editingBrand ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (response.data.success) {
        if (editingBrand) {
          setBrands(brands.map(b => b.id === editingBrand.id ? response.data.data : b));
        } else {
          setBrands([response.data.data, ...brands]);
        }
        closeModal();
        router.refresh();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save brand');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        await axios.delete(`/api/admin/brands/${id}`, { withCredentials: true });
        setBrands(brands.filter((b) => b.id !== id));
        router.refresh();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting brand');
      }
    }
  };

  // Filter logic moved to server
  const displayBrands = brands;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-border shadow-sm overflow-hidden relative">
      <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search brands..." 
            className="pl-9 w-full bg-surface-container"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button onClick={() => openModal()} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Brand
        </Button>
      </div>

      <div className="min-h-[300px]">
        <Table>
          <TableHeader className="bg-surface-container/50">
            <TableRow>
              <TableHead className="font-medium">Brand</TableHead>
              <TableHead className="font-medium">Slug</TableHead>
              <TableHead className="font-medium">Description</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayBrands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No brands found.
                </TableCell>
              </TableRow>
            ) : (
              displayBrands.map((brand) => (
                <TableRow key={brand.id} className="hover:bg-surface-container-low transition-colors">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-white border border-border overflow-hidden flex items-center justify-center shrink-0">
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.name} className="object-contain max-h-full max-w-full" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      {brand.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{brand.slug}</TableCell>
                  <TableCell className="text-muted-foreground line-clamp-2 max-w-[200px]">{brand.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <ActionButtons 
                      onEdit={() => openModal(brand)}
                      onDelete={() => handleDelete(brand.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-[450px] overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">{editingBrand ? 'Edit Brand' : 'Add Brand'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-error/10 text-error rounded border border-error/20 text-sm">{error}</div>}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Optional description..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded border border-dashed border-border flex items-center justify-center overflow-hidden shrink-0 bg-white">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
