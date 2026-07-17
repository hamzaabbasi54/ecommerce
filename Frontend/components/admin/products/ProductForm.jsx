"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductForm({ initialData = null, categories = [], brands = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;

  let initialMainCategoryId = '';
  let initialSubcategoryId = '';

  if (initialData?.categoryId) {
    const selectedCategory = categories.find(c => c.id === initialData.categoryId);
    if (selectedCategory?.parentId) {
      initialMainCategoryId = selectedCategory.parentId;
      initialSubcategoryId = selectedCategory.id;
    } else {
      initialMainCategoryId = initialData.categoryId;
    }
  }

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    discountPrice: initialData?.discountPrice || '',
    stock: initialData?.stock || '',
    mainCategoryId: initialMainCategoryId,
    subcategoryId: initialSubcategoryId,
    brandId: initialData?.brandId || '',
  });

  const mainCategories = categories.filter(c => !c.parentId);
  const availableSubcategories = categories.filter(c => c.parentId === formData.mainCategoryId);

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState(initialData?.images || []);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(selectedFiles);
      const urls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      setThumbnailIndex(0); // Reset thumbnail to first image
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'mainCategoryId' || key === 'subcategoryId') return;
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      const finalCategoryId = formData.subcategoryId || formData.mainCategoryId;
      if (finalCategoryId) {
        data.append('categoryId', finalCategoryId);
      }
      
      if (images.length > 0) {
        const thumbnailFile = images[thumbnailIndex];
        const galleryFiles = images.filter((_, i) => i !== thumbnailIndex);

        if (thumbnailFile) {
          data.append('thumbnail', thumbnailFile);
        }
        galleryFiles.forEach((file) => {
          data.append('gallery', file);
        });
      } else if (previewUrls.length > 0) {
        // No new files, but maybe reordered existing
        const newUrls = [
          previewUrls[thumbnailIndex],
          ...previewUrls.filter((_, i) => i !== thumbnailIndex)
        ];
        newUrls.forEach(url => data.append('existingImages', url));
      }

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
        toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(response.data.message || 'Failed to save product');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error(err.response?.data?.message || 'Failed to save product.');
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
            <label className="text-sm font-medium text-foreground">Main Category *</label>
            <Select
              value={formData.mainCategoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, mainCategoryId: value, subcategoryId: '' }))}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {mainCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Subcategory</label>
            <Select
              value={formData.subcategoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, subcategoryId: value === "none" ? "" : value }))}
              disabled={!formData.mainCategoryId || availableSubcategories.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={!formData.mainCategoryId ? "Select a main category first" : availableSubcategories.length === 0 ? "No subcategories available" : "None"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {availableSubcategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Brand *</label>
            <Select
              value={formData.brandId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, brandId: value }))}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <p className="text-xs text-muted-foreground mt-1 mb-3">Click on any image preview below to set it as the main Thumbnail.</p>
          
          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-4">
              {previewUrls.map((url, index) => (
                <div 
                  key={index} 
                  onClick={() => setThumbnailIndex(index)}
                  className={`relative w-24 h-24 rounded-lg border-2 overflow-hidden bg-white shadow-sm cursor-pointer transition-all ${thumbnailIndex === index ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                >
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-contain" />
                  {thumbnailIndex === index && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-sm font-medium">
                      Main Thumbnail
                    </div>
                  )}
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
                {images.length > 0 ? `${images.length} file(s) selected` : "Upload Images"}
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
