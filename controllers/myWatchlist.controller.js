import { MyWatchlist } from "../models/MyWatchlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Create new MyWatchlist item
 */
export const createMyWatchlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { title, note } = req.body;

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  const item = await MyWatchlist.create({
    userId,
    title,
    note: note || "",
  });

  const myWatchlist = await MyWatchlist.find({ userId })
    .sort({ createdAt: -1 })
    .select("-userId -__v");

  return res
    .status(201)
    .json(new ApiResponse(201, { myWatchlist }, "Anime added successfully"));
});

/**
 * Get all MyWatchlist items
 */
export const getMyWatchlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const myWatchlist = await MyWatchlist.find({ userId })
    .sort({ createdAt: -1 })
    .select("-userId -__v");

  return res
    .status(200)
    .json(new ApiResponse(200, { myWatchlist }, "Fetched successfully"));
});

/**
 * Toggle seen status
 */
export const toggleMySeenStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { seen } = req.body;

  if (typeof seen !== "boolean") {
    throw new ApiError(400, "Seen status must be a boolean");
  }

  const updated = await MyWatchlist.findOneAndUpdate(
    { _id: id, userId },
    { seen },
    { new: true }
  );

  if (!updated) {
    throw new ApiError(404, "Item not found");
  }

  const myWatchlist = await MyWatchlist.find({ userId })
    .sort({ createdAt: -1 })
    .select("-userId -__v");

  return res
    .status(200)
    .json(new ApiResponse(200, { myWatchlist }, "Seen status updated"));
});

/**
 * Delete from MyWatchlist
 */
export const deleteMyWatchlistItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const deleted = await MyWatchlist.findOneAndDelete({ _id: id, userId });

  if (!deleted) {
    throw new ApiError(404, "Item not found");
  }

  const myWatchlist = await MyWatchlist.find({ userId })
    .sort({ createdAt: -1 })
    .select("-userId -__v");

  return res
    .status(200)
    .json(new ApiResponse(200, { myWatchlist }, "Item deleted successfully"));
});
