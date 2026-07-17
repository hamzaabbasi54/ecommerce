"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Edit, Trash2, Plus, Search, Package } from 'lucide-react';
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

export default function ProductList({ initialProducts, currentPage, totalPages, initialQuery = '' }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const initialRender = useRef(true);
  const router = useRouter();

  // Sync state if props change (e.g., when navigation completes)
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    router.push(`/admin/products?page=1&q=${encodeURIComponent(debouncedSearchTerm)}`);
  }, [debouncedSearchTerm, router]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    router.push(`/admin/products?page=${page}&q=${encodeURIComponent(searchTerm)}`);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/admin/products/${id}`, { withCredentials: true });
        setProducts(products.filter((p) => p.id !== id));
      } catch (error) {
        console.error('Failed to delete product', error);
        alert('Error deleting product');
      }
    }
  };

  // Filter logic moved to server
  const displayProducts = products;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between gap-4 items-center bg-surface-container/30">
        <div className="relative flex-1 w-full min-w-[250px] md:max-w-3xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by product name or category..." 
            className="pl-12 py-6 text-base rounded-full bg-surface-container-lowest shadow-sm border border-border w-full focus-visible:ring-primary/50"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button onClick={() => router.push('/admin/products/new')} className="w-full md:w-auto py-5 px-6 rounded-full shadow-sm cursor-pointer">
          <Plus className="w-5 h-5 mr-2" /> Add Product
        </Button>
      </div>

      <div>
        <Table>
          <TableHeader className="bg-surface-container/50">
            <TableRow>
              <TableHead className="font-medium">Product</TableHead>
              <TableHead className="font-medium">Category</TableHead>
              <TableHead className="font-medium">Subcategory</TableHead>
              <TableHead className="font-medium">Price</TableHead>
              <TableHead className="font-medium">Stock</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              displayProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-surface-container-low transition-colors">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-white border border-border overflow-hidden flex items-center justify-center shrink-0">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="object-contain max-h-full max-w-full" />
                        ) : (
                          <Package className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="line-clamp-1">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.category?.name || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{product.subcategory?.name || '-'}</TableCell>
                  <TableCell>
                    {product.discountPrice ? (
                      <div>
                        <span className="text-foreground font-medium">${product.discountPrice.toFixed(2)}</span>
                        <span className="text-muted-foreground line-through text-xs ml-2">${product.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-foreground font-medium">${product.price.toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionButtons 
                      onEdit={() => router.push(`/admin/products/${product.id}`)}
                      onDelete={() => handleDelete(product.id)}
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
    </div>
  );
}
