import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  sellerName: z.string().min(2, 'Seller name is required'),
  price: z.number().positive('Price must be a positive number'),
  ownerId: z.string().min(3, 'Owner ID is required'),
  platform: z.enum(['Mobile (Android/iOS)', 'PC (Steam)', 'PlayStation 5', 'Xbox']).optional(),
  region: z.enum(['Europe', 'Asia/Japan', 'South America', 'North America', 'Middle East']).optional(),
  epicCount: z.number().nonnegative().optional(),
  showtimeCount: z.number().nonnegative().optional(),
  coinBalance: z.number().nonnegative().optional(),
  gpBalance: z.number().nonnegative().optional(),
  description: z.string().optional(),
});

export const initiateEscrowSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  buyerName: z.string().min(1, 'Buyer name is required'),
});

export const escrowStepSchema = z.object({
  step: z.number().int().min(1).max(4),
});

export const disputeEscrowSchema = z.object({
  reason: z.string().min(3, 'Reason is required'),
  details: z.string().min(5, 'Details must be at least 5 characters'),
});

export const reportScammerSchema = z.object({
  gameName: z.string().min(2, 'Game name is required'),
  scamType: z.string().min(2, 'Scam type is required'),
  konamiId: z.string().optional(),
  discordHandle: z.string().optional(),
  whatsappNumber: z.string().optional(),
  stolenAmount: z.number().nonnegative().optional(),
  evidenceSummary: z.string().optional(),
});

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
};
