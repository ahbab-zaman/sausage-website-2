"use client";

import { useState } from "react";
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

        <div className="bottom flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:gap-8">
          {/* Star Rating Display */}
          <div className="rate-stars flex items-center gap-3">
            <div className="display-product-rating flex">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-7 w-7 ${
                    index < Math.floor(averageRating)
                      ? "fill-red-700 text-red-700"
                      : "fill-white text-red-700"
                  }`}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {hasReviews
                ? `Based on ${totalReviews} review${totalReviews > 1 ? "s" : ""}`
                : "There are no reviews for this product."}
            </span>
          </div>

          {/* Review Counter Popup */}
          {hasReviews && (
            <div className="reviewCounter relative">
              <div
                id="rate-info"
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
                {/* Arrow */}
                <div className="arrow-up absolute -top-2 left-8 h-4 w-4 rotate-45 border-t border-l border-gray-200 bg-white"></div>

                <div className="rate-title mb-4 font-semibold text-gray-900">
                  Rating Distribution
                </div>

                <div id="rate-wrapper" className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingCounts[rating - 1];
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                    return (
                      <div key={rating} className="rate-row flex items-center gap-3">
                        <div className="side flex items-center gap-1 text-sm font-medium">
                          <span>{rating}</span>
                          <Star className="h-4 w-4 fill-red-700 text-red-700" strokeWidth={1.5} />
                        </div>

                        <div className="middle flex-1">
                          <div className="bar-container h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="bar h-full bg-red-700 transition-all duration-300"
                              style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>

                        <div className="side right text-sm text-gray-600">({count})</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Write a Review</h3>
          <form className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className="transition-transform hover:scale-110">
                    <Star
                      className="h-8 w-8 fill-white text-red-700 hover:fill-red-700"
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="review-name" className="mb-2 block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                id="review-name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-700 focus:ring-2 focus:ring-red-700 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label
                htmlFor="review-comment"
                className="mb-2 block text-sm font-medium text-gray-700">
                Your Review
              </label>
              <textarea
                id="review-comment"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-700 focus:ring-2 focus:ring-red-700 focus:outline-none"
                placeholder="Write your review here..."></textarea>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-gray-800 hover:bg-gray-900">
                Submit Review
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddReview(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Review Content/List */}
      <div className="review-content">
        {hasReviews ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{review.author}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < review.rating
                              ? "fill-red-700 text-red-700"
                              : "fill-white text-red-700"
                          }`}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
}
