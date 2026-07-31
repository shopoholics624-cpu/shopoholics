import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export function RatingStars({ rating, reviewCount, size = 14 }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[#5a403c]">
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{ width: size, height: size }}
            className={`${
              star <= Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : star - rating < 1
                ? "fill-amber-200 text-amber-400"
                : "text-[#e3beb8]"
            }`}
          />
        ))}
      </div>
      <span className="font-semibold text-[#261816]">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-[#8e706b]">({reviewCount})</span>
      )}
    </div>
  );
}
