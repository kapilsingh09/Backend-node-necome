import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Watchlist } from "../models/watchlist.model.js";

/**
 * Get user's watchlist
 */
export const getWatchlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const watchlist = await Watchlist.find({ userId })
        .sort({ createdAt: -1 })
        .select("-userId -__v");

    return res.status(200).json(
        new ApiResponse(200, { watchlist }, "Watchlist fetched successfully")
    );
});


export const createMyWatchlist = asyncHandler(async (req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,{message:"Api is working"})
    )
})
/**
 * Get user's seen anime (watchlist items with seen: true)
 */
export const getSeenAnime = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const seenAnime = await Watchlist.find({ userId, seen: true })
        .sort({ createdAt: -1 })
        .select("-userId -__v");

    return res.status(200).json(
        new ApiResponse(200, { seenAnime }, "Seen anime fetched successfully")
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
