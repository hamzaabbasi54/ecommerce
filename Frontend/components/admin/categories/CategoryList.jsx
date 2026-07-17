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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CategoryList({ initialCategories, currentPage, totalPages, initialQuery = '' }) {
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const initialRender = useRef(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({ name: '', parentId: '' });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state if props change
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    router.push(`/admin/categories?page=1&q=${encodeURIComponent(debouncedSearchTerm)}`);
  }, [debouncedSearchTerm, router]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    router.push(`/admin/categories?page=${page}&q=${encodeURIComponent(searchTerm)}`);
  };

  const openModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setFormData({ name: category.name, parentId: category.parentId || '' });
      setPreviewUrl(category.image || '');
    } else {
      setFormData({ name: '', parentId: '' });
      setPreviewUrl('');
    }
    setImageFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
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
      if (formData.parentId) data.append('parentId', formData.parentId);
      if (imageFile) data.append('image', imageFile);

      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
      const method = editingCategory ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (response.data.success) {
        if (editingCategory) {
          setCategories(categories.map(c => c.id === editingCategory.id ? response.data.data : c));
        } else {
          setCategories([response.data.data, ...categories]);
        }
        closeModal();
        router.refresh();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/admin/categories/${id}`, { withCredentials: true });
        setCategories(categories.filter((c) => c.id !== id));
        router.refresh();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting category');
      }
    }
  };

  // Filter logic moved to server
  const displayCategories = categories;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-border shadow-sm overflow-hidden relative">
      <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search categories..." 
            className="pl-9 w-full bg-surface-container"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button onClick={() => openModal()} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      <div className="min-h-[300px]">
        <Table>
          <TableHeader className="bg-surface-container/50">
            <TableRow>
              <TableHead className="font-medium">Category</TableHead>
              <TableHead className="font-medium">Slug</TableHead>
              <TableHead className="font-medium">Parent</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              displayCategories.map((category) => (
                <TableRow key={category.id} className="hover:bg-surface-container-low transition-colors">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-white border border-border overflow-hidden flex items-center justify-center shrink-0">
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="object-cover w-full h-full" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      {category.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="text-muted-foreground">{category.parent?.name || '-'}</TableCell>
                  <TableCell className="text-right">
                    <ActionButtons 
                      onEdit={() => openModal(category)}
                      onDelete={() => handleDelete(category.id)}
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
              <h2 className="text-xl font-bold text-foreground">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
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
                <label className="text-sm font-medium">Parent Category</label>
                <Select
                  value={formData.parentId || "none"}
                  onValueChange={(value) => setFormData({...formData, parentId: value === "none" ? "" : value})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.filter(c => c.id !== editingCategory?.id).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded border border-dashed border-border flex items-center justify-center overflow-hidden shrink-0">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
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
