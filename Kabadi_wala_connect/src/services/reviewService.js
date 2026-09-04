import { supabase, isSupabaseConfigured } from "../lib/supabase";

const STORAGE_KEY = "kabadi_buyer_reviews";

// Seed default reviews for demo realism
const DEFAULT_REVIEWS = [
  {
    id: "rev_1",
    recyclerId: "rec_1",
    buyerName: "EcoRecycle India Hub",
    collectorName: "Ramesh Pawar",
    rating: 5,
    comment: "Fair digital weight scale and instant cash payment without any deductions.",
    tags: ["Fair Weight ⚖️", "Instant Cash ⚡"],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "rev_2",
    recyclerId: "rec_1",
    buyerName: "EcoRecycle India Hub",
    collectorName: "Sanjay Gupta",
    rating: 5,
    comment: "Very respectful staff. Accepted all e-waste PCBs and gave green certificate.",
    tags: ["Official EPR 🌿", "Polite Staff 👍"],
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "rev_3",
    recyclerId: "rec_2",
    buyerName: "Maharashtra E-Waste Recyclers",
    collectorName: "Abdul Khan",
    rating: 4,
    comment: "Good wholesale prices for copper wire scrap.",
    tags: ["Best Price 💰"],
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  }
];

export const getStoredReviews = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REVIEWS));
      return DEFAULT_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_REVIEWS;
  }
};

export const getReviewsForRecycler = (recyclerId) => {
  const all = getStoredReviews();
  return all.filter((r) => String(r.recyclerId) === String(recyclerId));
};

export const getRecyclerRatingStats = (recyclerId, defaultRating = 4.7, defaultCount = 42) => {
  const reviews = getReviewsForRecycler(recyclerId);
  if (reviews.length === 0) {
    return {
      averageRating: Number(defaultRating).toFixed(1),
      reviewsCount: defaultCount,
      reviews: []
    };
  }

  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
  const avg = (sum / reviews.length).toFixed(1);
  return {
    averageRating: avg,
    reviewsCount: defaultCount + reviews.length,
    reviews
  };
};

export const addRecyclerReview = async ({
  recyclerId,
  buyerName = "Authorized Recycler",
  collectorName = "Kabadiwala Partner",
  rating = 5,
  comment = "",
  tags = []
}) => {
  const newReview = {
    id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    recyclerId: String(recyclerId),
    buyerName,
    collectorName,
    rating: Number(rating),
    comment: comment.trim(),
    tags,
    createdAt: new Date().toISOString()
  };

  const all = getStoredReviews();
  const updated = [newReview, ...all];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Optionally persist to Supabase if configured and table exists
  if (isSupabaseConfigured) {
    try {
      await supabase.from("buyer_reviews").insert({
        recycler_id: recyclerId,
        collector_name: collectorName,
        rating,
        comment,
        tags
      });
    } catch {
      // Graceful fallback to localStorage
    }
  }

  return newReview;
};
