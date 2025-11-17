import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Favourites } from "../models/favourites.model.js";

/**
 * Get user's favourites with pagination
 */
export const getFavourites = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalCount = await Favourites.countDocuments({ userId });

    // Get paginated results
    const favourites = await Favourites.find({ userId })
        .sort({ createdAt: -1 })
        .select("-userId -__v")
        .skip(skip)
        .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json(
        new ApiResponse(200, { 
            favourites,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalCount,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        }, "Favourites fetched successfully")
    );
});

/**
 * Add anime to favourites
 */
export const addToFavourites = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { animeId, title, image } = req.body;
    
    if (!animeId || !title || !image) {
        throw new ApiError(400, "Anime ID, title, and image are required");
    }

    // Check if already in favourites
    const existingItem = await Favourites.findOne({ userId, animeId });

    if (existingItem) {
        const favourites = await Favourites.find({ userId })
            .sort({ createdAt: -1 })
            .select("-userId -__v");
        return res.status(200).json(
            new ApiResponse(200, { favourites }, "Anime already in favourites")
        );
    }

    await Favourites.create({
        userId,
        animeId,
        title,
        image
    });

    const favourites = await Favourites.find({ userId })
        .sort({ createdAt: -1 })
        .select("-userId -__v");

    return res.status(201).json(
        new ApiResponse(201, { favourites }, "Anime added to favourites successfully")
    );
});

/**
 * Remove anime from favourites
 */
export const removeFromFavourites = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { animeId } = req.params;

    if (!animeId) {
        throw new ApiError(400, "Anime ID is required");
    }

    const deletedItem = await Favourites.findOneAndDelete({ userId, animeId });

    if (!deletedItem) {
        throw new ApiError(404, "Anime not found in favourites");
    }

    const favourites = await Favourites.find({ userId })
        .sort({ createdAt: -1 })
        .select("-userId -__v");

    return res.status(200).json(
        new ApiResponse(200, { favourites }, "Anime removed from favourites successfully")
    );
});

/**
 * Check if anime is in favourites
 */
export const checkFavouritesStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { animeId } = req.params;

    if (!animeId) {
        throw new ApiError(400, "Anime ID is required");
    }

    const favouritesItem = await Favourites.findOne({ userId, animeId });

    return res.status(200).json(
        new ApiResponse(200, { isInFavourites: !!favouritesItem }, "Status checked successfully")
    );
});

