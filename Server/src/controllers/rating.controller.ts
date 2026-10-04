import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { ApiError } from "../middleware/error";
import { AuthRequest } from "../middleware/auth";
import { verifyToken } from "../utils/jwt";

export const getStoreRating = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const storeId = parseInt(req.params.storeId as string, 10);
    if (isNaN(storeId)) {
      throw ApiError.badRequest("Invalid store ID parameter");
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw ApiError.notFound("Store not found");
    }

    let currentUserId: number | null = req.user?.id || null;
    if (!currentUserId) {
      const authHeader = req.headers.authorization;
      const cookieToken = req.cookies?.token;
      const token =
        cookieToken || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);
      if (token) {
        try {
          const decoded = verifyToken(token);
          currentUserId = parseInt(decoded.sub, 10);
        } catch {
          currentUserId = null;
        }
      }
    }

    let userRating: number | null = null;
    if (currentUserId) {
      const found = await prisma.rating.findUnique({
        where: {
          userId_storeId: {
            userId: currentUserId,
            storeId,
          },
        },
      });
      if (found) userRating = found.rating;
    }

    // Database aggregation for store ratings
    const aggregations = await prisma.rating.aggregate({
      where: { storeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = aggregations._avg.rating
      ? Number(aggregations._avg.rating.toFixed(1))
      : 0;
    const totalRatings = aggregations._count.rating;

    res.status(200).json({
      success: true,
      message: "Store rating fetched successfully",
      data: {
        storeId,
        averageRating,
        totalRatings,
        userRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitRating = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const storeId = parseInt(req.params.storeId as string, 10);
    if (isNaN(storeId)) {
      throw ApiError.badRequest("Invalid store ID parameter");
    }

    const { rating } = req.body;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw ApiError.notFound("Store not found");
    }

    if (store.ownerId === req.user.id) {
      throw ApiError.forbidden("Store owners cannot rate their own store");
    }

    // Check if user already submitted rating
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId,
        },
      },
    });

    if (existingRating) {
      throw ApiError.conflict(
        "You have already rated this store. Use PATCH to update your rating."
      );
    }

    const createdRating = await prisma.rating.create({
      data: {
        userId: req.user.id,
        storeId,
        rating,
      },
    });

    // Database aggregation for updated average rating
    const aggregations = await prisma.rating.aggregate({
      where: { storeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = aggregations._avg.rating
      ? Number(aggregations._avg.rating.toFixed(1))
      : 0;

    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        rating: createdRating,
        averageRating,
        totalRatings: aggregations._count.rating,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateRating = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const storeId = parseInt(req.params.storeId as string, 10);
    if (isNaN(storeId)) {
      throw ApiError.badRequest("Invalid store ID parameter");
    }

    const { rating } = req.body;

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId,
        },
      },
    });

    if (!existingRating) {
      throw ApiError.notFound("You have not rated this store yet. Use POST to submit a rating.");
    }

    const updatedRating = await prisma.rating.update({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId,
        },
      },
      data: { rating },
    });

    const aggregations = await prisma.rating.aggregate({
      where: { storeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = aggregations._avg.rating
      ? Number(aggregations._avg.rating.toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      message: "Rating updated successfully",
      data: {
        rating: updatedRating,
        averageRating,
        totalRatings: aggregations._count.rating,
      },
    });
  } catch (error) {
    next(error);
  }
};
