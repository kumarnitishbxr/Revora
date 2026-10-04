import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { Prisma, Role } from "@prisma/client";
import { hashPassword } from "../utils/password";
import { getPagination, formatPaginatedResponse } from "../utils/pagination";
import { ApiError } from "../middleware/error";

export const getDashboard = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    res.status(200).json({
      success: true,
      message: "Admin dashboard metrics retrieved successfully",
      data: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, search, role, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const pagination = getPagination(page as string, limit as string);

    const where: Prisma.UserWhereInput = {};

    if (search && typeof search === "string") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && Object.values(Role).includes(role as Role)) {
      where.role = role as Role;
    }

    // Whitelist sort fields
    const allowedSortFields = ["name", "email", "address", "role", "createdAt"];
    const sortField = allowedSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : "createdAt";
    const direction = sortOrder === "asc" ? "asc" : "desc";

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [sortField]: direction },
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          ownedStore: {
            select: {
              id: true,
              name: true,
              ratings: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((u) => {
      let storeRating: number | null = null;
      let storeName: string | null = null;
      if (u.role === Role.STORE_OWNER && u.ownedStore) {
        storeName = u.ownedStore.name;
        const count = u.ownedStore.ratings.length;
        storeRating =
          count > 0
            ? Number(
                (u.ownedStore.ratings.reduce((acc, curr) => acc + curr.rating, 0) / count).toFixed(1)
              )
            : 0;
      }
      const { ownedStore, ...userData } = u;
      return {
        ...userData,
        storeName,
        storeRating,
      };
    });

    const response = formatPaginatedResponse(formattedUsers, total, pagination.page, pagination.limit);
    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw ApiError.badRequest("Invalid user ID parameter");
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ownedStore: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    let storeRating: number | null = null;
    let storeName: string | null = null;
    if (user.role === Role.STORE_OWNER && user.ownedStore) {
      storeName = user.ownedStore.name;
      const count = user.ownedStore.ratings.length;
      storeRating =
        count > 0
          ? Number(
              (user.ownedStore.ratings.reduce((acc, curr) => acc + curr.rating, 0) / count).toFixed(1)
            )
          : 0;
    }
    const { ownedStore, ...userData } = user;

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: {
        user: {
          ...userData,
          storeName,
          storeRating,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        address,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const getStores = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page,
      limit,
      search,
      name,
      address,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const pagination = getPagination(page as string, limit as string);

    const where: Prisma.StoreWhereInput = {};

    if (search && typeof search === "string") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    if (name && typeof name === "string") {
      where.name = { contains: name, mode: "insensitive" };
    }

    if (address && typeof address === "string") {
      where.address = { contains: address, mode: "insensitive" };
    }

    const allowedSortFields = ["name", "email", "address", "createdAt"];
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
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          ratings: {
            select: { rating: true },
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

      const storeData = { ...store };
      delete (storeData as any).ratings;
      return {
        ...storeData,
        averageRating,
        totalRatings: count,
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

export const createStore = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!ownerId) {
      throw ApiError.badRequest("Owner ID is required to create a store");
    }

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw ApiError.notFound("Assigned store owner not found");
    }

    if (owner.role !== Role.STORE_OWNER && owner.role !== Role.SYSTEM_ADMIN) {
      throw ApiError.badRequest("Assigned user must have STORE_OWNER or SYSTEM_ADMIN role");
    }

    const existingStore = await prisma.store.findUnique({
      where: { ownerId },
    });

    if (existingStore) {
      throw ApiError.conflict("This store owner already has an assigned store");
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: { store },
    });
  } catch (error) {
    next(error);
  }
};

export const updateStore = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw ApiError.badRequest("Invalid store ID parameter");
    }

    const { name, email, address, ownerId } = req.body;

    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound("Store not found");
    }

    if (ownerId && ownerId !== existing.ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!owner) throw ApiError.notFound("Assigned owner not found");
      const alreadyHasStore = await prisma.store.findUnique({ where: { ownerId } });
      if (alreadyHasStore) throw ApiError.conflict("New owner already has a store");
    }

    const updated = await prisma.store.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(address && { address }),
        ...(ownerId && { ownerId }),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Store updated successfully",
      data: { store: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStore = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw ApiError.badRequest("Invalid store ID parameter");
    }

    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound("Store not found");
    }

    await prisma.store.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Store deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
