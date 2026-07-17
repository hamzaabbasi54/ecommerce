"use client";

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Trash2, Search, Star } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

export default function ReviewList({ initialReviews, currentPage, totalPages, initialQuery = '' }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const initialRender = useRef(true);
  const router = useRouter();

  // Sync state if props change
  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    router.push(`/admin/reviews?page=1&q=${encodeURIComponent(debouncedSearchTerm)}`);
  }, [debouncedSearchTerm, router]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    router.push(`/admin/reviews?page=${page}&q=${encodeURIComponent(searchTerm)}`);
  };

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

  // Filter logic moved to server
  const displayReviews = reviews;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-border shadow-sm overflow-hidden relative">
      <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search reviews by user, product, or content..." 
            className="pl-9 w-full bg-surface-container"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="min-h-[300px]">
        <Table>
          <TableHeader className="bg-surface-container/50">
            <TableRow>
              <TableHead className="font-medium">User</TableHead>
              <TableHead className="font-medium">Product</TableHead>
              <TableHead className="font-medium">Rating</TableHead>
              <TableHead className="font-medium max-w-[300px]">Review</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No reviews found.
                </TableCell>
              </TableRow>
            ) : (
              displayReviews.map((review) => (
                <TableRow key={review.id} className="hover:bg-surface-container-low transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={review.user.profileImage} alt={review.user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs uppercase">{review.user.name.slice(0,2)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium text-foreground">{review.user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-white border border-border flex items-center justify-center overflow-hidden shrink-0">
                        {review.product.images[0] ? (
                          <img src={review.product.images[0]} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-surface-container" />
                        )}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate max-w-[150px] cursor-help">{review.product.name}</span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="max-w-[300px] text-wrap">{review.product.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted-foreground fill-transparent'}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-muted-foreground line-clamp-2 cursor-help">
                          {review.comment || <span className="italic">No text provided</span>}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-[400px] text-wrap">{review.comment || 'No text provided'}</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(review.createdAt).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionButtons 
                      onDelete={() => handleDelete(review.id)}
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
