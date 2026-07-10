'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductReviews({ productId, initialReviews = [] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, rating, title, comment: body })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setSuccess('Review submitted successfully!');
      setRating(0);
      setTitle('');
      setBody('');
      
      // Optionally fetch new reviews or optimistically update UI
      // Here we just append a mock review for immediate feedback
      setReviews([{
        id: Date.now().toString(),
        rating,
        title,
        comment: body,
        createdAt: new Date().toISOString(),
        user: { name: 'You' }
      }, ...reviews]);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="border-t border-border bg-surface-container-lowest py-16 md:py-24 animate-in fade-in duration-700">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-12">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Write Review Form */}
          <div className="lg:col-span-1 bg-surface-container-low p-8 border border-border rounded-lg h-fit">
            <h3 className="text-xl font-semibold text-foreground mb-6">Write a Review</h3>
            
            {error && <div className="mb-4 text-sm text-destructive font-medium p-3 bg-destructive/10 rounded">{error}</div>}
            {success && <div className="mb-4 text-sm text-green-600 font-medium p-3 bg-green-50 rounded">{success}</div>}
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Overall Rating</label>
                <div className="flex gap-1 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`h-6 w-6 transition-colors ${
                          (hoverRating || rating) >= star 
                            ? 'text-primary fill-primary' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="review-title" className="block text-sm font-medium text-muted-foreground mb-2">Review Title</label>
                <input 
                  id="review-title" 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full border border-input rounded-md bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary text-sm h-10 px-3 transition-colors"
                />
              </div>

              {/* Body */}
              <div>
                <label htmlFor="review-body" className="block text-sm font-medium text-muted-foreground mb-2">Review</label>
                <textarea 
                  id="review-body" 
                  rows="4"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  className="w-full border border-input rounded-md bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary text-sm p-3 resize-none transition-colors"
                ></textarea>
              </div>

              <Button type="submit" disabled={submitting} className="mt-2 h-10 font-semibold tracking-wide">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {reviews.length === 0 ? (
              <div className="text-muted-foreground py-8">No reviews yet. Be the first to review this product!</div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-variant rounded-full flex items-center justify-center text-muted-foreground font-semibold text-sm">
                        {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-foreground">{review.user?.name || 'Anonymous User'}</span>
                        <div className="flex text-primary gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-3 w-3 ${review.rating >= star ? 'fill-primary' : ''}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && <h4 className="text-base font-semibold text-foreground mb-1">{review.title}</h4>}
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
