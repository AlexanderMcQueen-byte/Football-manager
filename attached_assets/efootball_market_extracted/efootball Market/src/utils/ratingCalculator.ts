export interface AccountRatingDetails {
  score: number; // e.g. 8.7
  scoreFormatted: string; // e.g. "8.7 / 10"
  tierLabel: string; // e.g. "S+ Legendary Tier"
  badgeColor: string;
  breakdown: {
    squadStrengthScore: number;
    epicDepthScore: number;
    screenshotProofGrade: string;
  };
}

export function calculateAccountRating(listing: {
  squadRating?: number;
  epicCount?: number;
  showtimeCount?: number;
  squadImages?: string[];
  maxDivision?: string;
  coinBalance?: number;
}): AccountRatingDetails {
  const sqRating = listing.squadRating || 3000;
  const epics = listing.epicCount || 10;
  const showtimes = listing.showtimeCount || 5;
  const imageCount = listing.squadImages?.length || 0;
  
  // 1. Squad strength component (up to 4.5 pts)
  // squadRating typical range: 2700 to 3220
  let squadPts = ((sqRating - 2700) / 520) * 4.5;
  if (squadPts < 0.5) squadPts = 0.5;
  if (squadPts > 4.5) squadPts = 4.5;

  // 2. Epic depth component (up to 3.5 pts)
  let epicPts = (epics * 0.08) + (showtimes * 0.04);
  if (epicPts > 3.5) epicPts = 3.5;

  // 3. Screenshot proof component (up to 1.5 pts)
  let imagePts = imageCount >= 2 ? 1.5 : imageCount === 1 ? 0.9 : 0.2;

  // 4. Division bonus (up to 0.5 pts)
  let divPts = 0.2;
  if (listing.maxDivision?.includes('Division 1')) divPts = 0.5;
  else if (listing.maxDivision?.includes('Division 2')) divPts = 0.35;

  let totalScore = squadPts + epicPts + imagePts + divPts;
  if (totalScore > 9.9) totalScore = 9.9;
  if (totalScore < 1.0) totalScore = 1.0;

  // Round to 1 decimal place (e.g. 5.5, 8.7, 9.4)
  const rounded = Math.round(totalScore * 10) / 10;

  let tierLabel = 'Standard Account';
  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-300';

  if (rounded >= 9.0) {
    tierLabel = '👑 S+ Legendary Tier';
    badgeColor = 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-300';
  } else if (rounded >= 8.0) {
    tierLabel = '🔥 S Tier Competitive';
    badgeColor = 'bg-orange-600 text-white border-orange-400';
  } else if (rounded >= 6.5) {
    tierLabel = '⚡ A Tier High End';
    badgeColor = 'bg-indigo-950 text-orange-400 border-indigo-800';
  } else if (rounded >= 5.0) {
    tierLabel = '🛡️ B Tier Mid-Range';
    badgeColor = 'bg-emerald-700 text-white border-emerald-600';
  } else {
    tierLabel = '🌱 C Tier Starter';
    badgeColor = 'bg-slate-700 text-slate-100 border-slate-600';
  }

  return {
    score: rounded,
    scoreFormatted: `${rounded.toFixed(1)} / 10`,
    tierLabel,
    badgeColor,
    breakdown: {
      squadStrengthScore: Math.round((squadPts / 4.5) * 100) / 10,
      epicDepthScore: Math.round((epicPts / 3.5) * 100) / 10,
      screenshotProofGrade: imageCount >= 2 ? `A+ (${imageCount} Photos Uploaded)` : imageCount === 1 ? `B+ (${imageCount} Photo Uploaded)` : 'C (No Screenshot Uploaded)'
    }
  };
}
