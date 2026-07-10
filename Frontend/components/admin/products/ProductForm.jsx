"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function ProductForm({ initialData = null, categories = [], brands = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    discountPrice: initialData?.discountPrice || '',
    stock: initialData?.stock || '',
    categoryId: initialData?.categoryId || '',
    brandId: initialData?.brandId || '',
  });

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState(initialData?.images || []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(selectedFiles);
      
      // Generate preview URLs
      const urls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });
      
      images.forEach((image) => {
        data.append('images', image);
      });

      const url = isEditing ? `/api/admin/products/${initialData.id}` : '/api/admin/products';
      const method = isEditing ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (response.data.success) {
        router.push('/admin/products');
        router.refresh();
      } else {
        setError(response.data.message || 'Failed to save product');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-border rounded-xl shadow-sm">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        <Link href="/admin/products" className="text-sm font-medium text-muted-foreground flex items-center hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && <div className="p-3 bg-error/10 text-error rounded border border-error/20 text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Product Name *</label>
            <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Enter product name" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Stock *</label>
            <Input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" placeholder="0" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Price ($) *</label>
            <Input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required min="0" placeholder="0.00" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Discount Price ($)</label>
            <Input type="number" step="0.01" name="discountPrice" value={formData.discountPrice} onChange={handleChange} min="0" placeholder="Optional" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Brand *</label>
            <select
              name="brandId"
              value={formData.brandId}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Detailed product description..."
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-foreground">Product Images {isEditing && '(Upload new to replace)'}</label>
          
          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative w-24 h-24 rounded-lg border border-border overflow-hidden bg-white shadow-sm">
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          )}

          {/* Upload Button styling */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                title="Choose images"
              />
              <Button type="button" variant="outline" className="pointer-events-none">
                <ImageIcon className="w-4 h-4 mr-2" /> 
                {images.length > 0 ? `${images.length} file(s) selected` : "Choose Images"}
              </Button>
            </div>
            {images.length === 0 && <span className="text-sm text-muted-foreground">No file chosen</span>}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Product</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
