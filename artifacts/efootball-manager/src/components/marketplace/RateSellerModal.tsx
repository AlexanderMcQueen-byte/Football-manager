import React, { useState } from 'react';
import { SellerReview } from '@/types/marketplace';
import { X, Star, CheckCircle2, Sparkles, Send, ShieldCheck, Tag } from 'lucide-react';

interface RateSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  listingTitle?: string;
  onSubmitReview: (review: SellerReview) => void;
}

export const RateSellerModal: React.FC<RateSellerModalProps> = ({
  isOpen,
  onClose,
  sellerName,
  listingTitle,
  onSubmitReview,
}) => {
  if (!isOpen) return null;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [buyerName, setBuyerName] = useState<string>('Alex_Buyer');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Fast Escrow Handoff',
    'Authentic Konami ID',
  ]);
  const [comment, setComment] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const AVAILABLE_TAGS = [
    'Fast Escrow Handoff',
    'Authentic Konami ID',
    '100% Honest Seller',
    'Responsive & Friendly',
    'Clean Email Account',
    'Fair Negotiator',
    'Safe Escrow Trade',
  ];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newRev: SellerReview = {
      id: `rev-${Date.now()}`,
      sellerName,
      buyerName: buyerName.trim() || 'Verified Buyer',
      rating,
      tags: selectedTags,
      comment,
      date: new Date().toISOString().split('T')[0],
      listingTitle: listingTitle || 'eFootball Squad Trade',
      verifiedPurchase: true,
    };

    onSubmitReview(newRev);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="bg-indigo-950 p-4 border-b border-indigo-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 font-bold">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">
                Rate &amp; Review Seller: <span className="text-orange-400">{sellerName}</span>
              </h3>
              <p className="text-[11px] text-slate-300 font-mono">
                Verified Buyer Feedback • Appears on Marketplace
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-indigo-900/80 hover:bg-indigo-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-black text-lg text-white">Review Submitted Successfully!</h4>
            <p className="text-xs text-slate-300 font-medium max-w-sm mx-auto">
              Thank you for rating <strong className="text-orange-400">{sellerName}</strong>. Your rating helps keep the eFootball Escrow marketplace safe and transparent!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            {/* Star Rating selector */}
            <div className="text-center space-y-1.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                Select Star Rating
              </label>
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const active = (hoverRating || rating) >= starVal;
                  return (
                    <button
                      type="button"
                      key={starVal}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starVal)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          active
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {rating === 5 && '⭐⭐⭐⭐⭐ 5.0 - Excellent & Highly Trusted'}
                {rating === 4 && '⭐⭐⭐⭐ 4.0 - Very Good Handoff'}
                {rating === 3 && '⭐⭐⭐ 3.0 - Average Experience'}
                {rating <= 2 && '⭐⭐ 2.0 - Below Expectations'}
              </span>
            </div>

            {/* Buyer Name Input */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Your Username / Buyer Name
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. Alex_Buyer"
                className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-bold"
              />
            </div>

            {/* Quick Praise Tags */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-400" /> Select Seller Quality Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-orange-600 text-white border-orange-500 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Comment Textarea */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Write Your Review Comment
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Share your experience trading with ${sellerName} (e.g. Konami ID OTP delivery, squad condition, negotiation response time)...`}
                className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl p-3 text-xs text-white outline-none leading-relaxed"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition-colors shadow-md flex items-center gap-1.5 cursor-pointer border-b-2 border-orange-800"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Post Seller Review
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
