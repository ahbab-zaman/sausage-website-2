"use client";

import { useState, memo } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

interface ReviewsSectionProps {
  productId: string;
  reviews?: Review[];
  averageRating?: number;
}

// Review Summary Component with hover popover
const ReviewSummary = memo(
  ({
    hasReviews,
    reviewCount,
    ratingCounts,
    totalReviews
  }: {
    hasReviews: boolean;
    reviewCount: number;
    ratingCounts: number[];
    totalReviews: number;
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className="relative inline-block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        {/* Default view */}
        <div className="flex cursor-pointer items-start gap-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current text-gray-300" />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {hasReviews
              ? `${totalReviews} review${totalReviews !== 1 ? "s" : ""}`
              : "There are no reviews for this product."}
          </p>
        </div>

        {/* Popover with arrow */}
        {isHovered && (
          <div className="absolute top-full left-0 z-50 mt-3 w-80">
            {/* Arrow pointing up */}
            <div className="relative">
              <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 border-t border-l border-gray-200 bg-white shadow-lg" />

              {/* Popover content */}
              <div className="animate-in fade-in-0 zoom-in-95 rounded-xl border border-gray-200 bg-white px-7 pt-6 pb-7 shadow-2xl duration-200">
                <p className="mb-4 text-base font-medium text-gray-900">
                  {hasReviews
                    ? `Customer Reviews (${totalReviews})`
                    : "There are no reviews for this product."}
                </p>

                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingCounts[rating - 1] || 0;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="w-5 text-sm font-medium text-gray-700">{rating}</span>
                        <Star className="h-4 w-4 fill-current text-red-600" />
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs font-medium text-gray-500">
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
ReviewSummary.displayName = "ReviewSummary";

export default function ReviewsSection({
  productId,
  reviews = [],
  averageRating = 0
}: ReviewsSectionProps) {
  const [showAddReview, setShowAddReview] = useState(false);

  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // For 1-5 stars
  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++;
    }
  });

  const totalReviews = reviews.length;
  const hasReviews = totalReviews > 0;

  return (
    <div id="review" className="review mt-12">
      {/* Review Header */}
      <div className="review-head mb-8">
        <div className="top mb-6 flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">Reviews</span>
          <Button
            onClick={() => setShowAddReview(!showAddReview)}
            className="group relative overflow-hidden bg-gray-800 px-6 py-3 text-white transition-all hover:bg-gray-900">
            <span className="relative z-10">Add A Review</span>
          </Button>
        </div>

        {/* Review Summary with Stars */}
        <ReviewSummary
          hasReviews={hasReviews}
          reviewCount={totalReviews}
          ratingCounts={ratingCounts}
          totalReviews={totalReviews}
        />
      </div>

      {/* Add Review Form - Show when button clicked */}
      {showAddReview && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Write a Review</h3>
          {/* Add your review form here */}
          <p className="text-sm text-gray-500">Review form goes here...</p>
        </div>
      )}

      {/* Reviews List */}
      {hasReviews && (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900">{review.author}</span>
                <span className="text-sm text-gray-500">• {review.date}</span>
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
