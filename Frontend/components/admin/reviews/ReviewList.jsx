"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Trash2, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ReviewList({ initialReviews }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`/api/admin/reviews/${id}`, { withCredentials: true });
        setReviews(reviews.filter((r) => r.id !== id));
        router.refresh();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting review');
      }
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-border shadow-sm overflow-hidden relative">
      <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search reviews by user, product, or content..." 
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
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Rating</th>
              <th className="px-6 py-4 font-medium max-w-[300px]">Review</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                  No reviews found.
                </td>
              </tr>
            ) : (
              filteredReviews.map((review) => (
                <tr key={review.id} className="border-b border-border hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={review.user.profileImage} alt={review.user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs uppercase">{review.user.name.slice(0,2)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-foreground">{review.user.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-white border border-border flex items-center justify-center overflow-hidden shrink-0">
                        {review.product.images[0] ? (
                          <img src={review.product.images[0]} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-surface-container" />
                        )}
                      </div>
                      <span className="truncate max-w-[150px]" title={review.product.name}>{review.product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted-foreground fill-transparent'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[300px]">
                    <div className="text-muted-foreground line-clamp-2" title={review.comment}>
                      {review.comment || <span className="italic">No text provided</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(review.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(review.id)}>
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                    </Button>
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
