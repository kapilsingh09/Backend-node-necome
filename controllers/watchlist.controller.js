import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Watchlist } from "../models/watchlist.model.js";

/**
 * Get user's watchlist with pagination
 */
export const getWatchlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalCount = await Watchlist.countDocuments({ userId });

    // Get paginated results
    const watchlist = await Watchlist.find({ userId })
        .sort({ createdAt: -1 })
        .select("-userId -__v")
        .skip(skip)
        .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json(
        new ApiResponse(200, { 
            watchlist,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalCount,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        }, "Watchlist fetched successfully")
    );
});


export const createMyWatchlist = asyncHandler(async (req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,{message:"Api is working"})
    )
})
/**
 * Get user's seen anime (watchlist items with seen: true) with pagination
 */
export const getSeenAnime = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalCount = await Watchlist.countDocuments({ userId, seen: true });

    // Get paginated results
    const seenAnime = await Watchlist.find({ userId, seen: true })
        .sort({ createdAt: -1 })
        .select("-userId -__v")
        .skip(skip)
        .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json(
        new ApiResponse(200, { 
            seenAnime,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalCount,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        }, "Seen anime fetched successfully")
    );
});

/**
 * Add anime to watchlist
 */
export const addToWatchlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { animeId, title, image } = req.body;

    if (!animeId || !title || !image) {
        throw new ApiError(400, "Anime ID, title, and image are required");
    }

    // Check if already in watchlist
    const existingItem = await Watchlist.findOne({ userId, animeId });

    if (existingItem) {
        return res.status(200).json(
            new ApiResponse(200, { watchlist: await Watchlist.find({ userId }).sort({ createdAt: -1 }).select("-userId -__v") }, "Anime already in watchlist")
        );
    }

    const watchlistItem = await Watchlist.create({
        userId,
        animeId,
        title,
        image,
        seen: false
    });

    const watchlist = await Watchlist.find({ userId })
        .sort({ createdAt: -1 })
        .select("-userId -__v");

    return res.status(201).json(
        new ApiResponse(201, { watchlist }, "Anime added to watchlist successfully")
    );
});

/**
 * Remove anime from watchlist
 */
export const removeFromWatchlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { animeId } = req.params;

    if (!animeId) {
        throw new ApiError(400, "Anime ID is required");
    }

    const deletedItem = await Watchlist.findOneAndDelete({ userId, animeId });

    if (!deletedItem) {
        throw new ApiError(404, "Anime not found in watchlist");
    }

    const watchlist = await Watchlist.find({ userId })
        .sort({ createdAt: -1 })
        .select("-userId -__v");

    return res.status(200).json(
        new ApiResponse(200, { watchlist }, "Anime removed from watchlist successfully")
    );
});

/**
 * Check if anime is in watchlist
 */
export const checkWatchlistStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { animeId } = req.params;

    if (!animeId) {
        throw new ApiError(400, "Anime ID is required");
    }

    const watchlistItem = await Watchlist.findOne({ userId, animeId });

    return res.status(200).json(
        new ApiResponse(200, { isInWatchlist: !!watchlistItem }, "Status checked successfully")
    );
});

/**
 * Toggle seen status
 */
export const toggleSeenStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { animeId } = req.params;
    const { seen } = req.body;

    if (!animeId) {
        throw new ApiError(400, "Anime ID is required");
    }

    if (typeof seen !== 'boolean') {
        throw new ApiError(400, "Seen status must be a boolean");
    }

    const watchlistItem = await Watchlist.findOneAndUpdate(
        { userId, animeId },
        { seen },
        { new: true, runValidators: true }
    );

    if (!watchlistItem) {
        throw new ApiError(404, "Anime not found in watchlist");
    }

    const watchlist = await Watchlist.find({ userId })
        .sort({ createdAt: -1 })
        .select("-userId -__v");

    return res.status(200).json(
        new ApiResponse(200, { watchlist }, "Seen status updated successfully")
    );
});
