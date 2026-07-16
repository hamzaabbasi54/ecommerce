"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Edit, Trash2, Plus, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProductList({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

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

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesName = p.name.toLowerCase().includes(term);
    const matchesCategory = p.category?.name?.toLowerCase().includes(term);
    const matchesPrice = p.price.toString().includes(term) || (p.discountPrice && p.discountPrice.toString().includes(term));
    return matchesName || matchesCategory || matchesPrice;
  });

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between gap-4 items-center bg-surface-container/30">
        <div className="relative flex-1 w-full min-w-[250px] md:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by product name, category, or price..." 
            className="pl-12 py-6 text-base rounded-full bg-surface-container-lowest shadow-sm border border-border w-full focus-visible:ring-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => router.push('/admin/products/new')} className="w-full md:w-auto py-5 px-6 rounded-full shadow-sm cursor-pointer">
          <Plus className="w-5 h-5 mr-2" /> Add Product
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-surface-container/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-white border border-border overflow-hidden flex items-center justify-center shrink-0">
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="object-contain max-h-full max-w-full" />
                      ) : (
                        <Package className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <span className="line-clamp-1">{product.name}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{product.category?.name || '-'}</td>
                  <td className="px-6 py-4">
                    {product.discountPrice ? (
                      <div>
                        <span className="text-foreground font-medium">${product.discountPrice.toFixed(2)}</span>
                        <span className="text-muted-foreground line-through text-xs ml-2">${product.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-foreground font-medium">${product.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-blue-500/10 hover:text-blue-600 text-muted-foreground transition-colors" onClick={() => router.push(`/admin/products/${product.id}`)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-red-500/10 hover:text-red-600 text-muted-foreground transition-colors" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
