import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { Prisma } from "@prisma/client";
import { getPagination, formatPaginatedResponse } from "../utils/pagination";
import { ApiError } from "../middleware/error";
import { AuthRequest } from "../middleware/auth";
import { verifyToken } from "../utils/jwt";

export const getStores = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const pagination = getPagination(page as string, limit as string);

    // Identify requesting user if token exists (even optional)
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

    const where: Prisma.StoreWhereInput = {};

    if (search && typeof search === "string") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const allowedSortFields = ["name", "address", "createdAt"];
    const sortField = allowedSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : "createdAt";
    const direction = sortOrder === "asc" ? "asc" : "desc";

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [sortField]: direction },
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          createdAt: true,
          ratings: {
            select: {
              rating: true,
              userId: true,
            },
          },
        },
      }),
      prisma.store.count({ where }),
    ]);

    const formattedStores = stores.map((store) => {
      const count = store.ratings.length;
      const averageRating =
        count > 0
          ? Number((store.ratings.reduce((acc, curr) => acc + curr.rating, 0) / count).toFixed(1))
          : 0;

      // Find authenticated user's own rating, if any
      let userRating: number | null = null;
      if (currentUserId) {
        const found = store.ratings.find((r) => r.userId === currentUserId);
        if (found) userRating = found.rating;
      }

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        createdAt: store.createdAt,
        overallRating: averageRating,
        totalRatings: count,
        userRating,
      };
    });

    const response = formatPaginatedResponse(
      formattedStores,
      total,
      pagination.page,
      pagination.limit
    );
    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw ApiError.badRequest("Invalid store ID parameter");
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

    const store = await prisma.store.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true,
        ratings: {
          select: {
            rating: true,
            userId: true,
          },
        },
      },
    });

    if (!store) {
      throw ApiError.notFound("Store not found");
    }

    const count = store.ratings.length;
    const averageRating =
      count > 0
        ? Number((store.ratings.reduce((acc, curr) => acc + curr.rating, 0) / count).toFixed(1))
        : 0;

    let userRating: number | null = null;
    if (currentUserId) {
      const found = store.ratings.find((r) => r.userId === currentUserId);
      if (found) userRating = found.rating;
    }

    res.status(200).json({
      success: true,
      message: "Store fetched successfully",
      data: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        createdAt: store.createdAt,
        overallRating: averageRating,
        totalRatings: count,
        userRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOwnerDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    // Must determine store ownership strictly from authenticated user ID
    const store = await prisma.store.findUnique({
      where: { ownerId: req.user.id },
      include: {
        ratings: {
          orderBy: { updatedAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!store) {
      throw ApiError.notFound("No store found assigned to your account");
    }

    const ratingCount = store.ratings.length;
    const averageRating =
      ratingCount > 0
        ? Number(
            (store.ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratingCount).toFixed(1)
          )
        : 0;

    const ratingUsers = store.ratings.map((r) => ({
      ratingId: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: r.user,
    }));

    res.status(200).json({
      success: true,
      message: "Store owner dashboard retrieved successfully",
      data: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          createdAt: store.createdAt,
        },
        averageRating,
        ratingCount,
        ratingUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};
