import { AnimePlaylist } from "../models/createanimeplaylist.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Create a new anime playlist for the authenticated user
 * POST /api/playlist/playlists
 */
export const createAnimePlaylist = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user._id; // Get userId from authenticated user

  // Validate required fields
  if (!title || title.trim() === "") {
    throw new ApiError(400, "Playlist title is required");
  }

  // Create new playlist
  const newPlaylist = new AnimePlaylist({
    userId,
    title: title.trim(),
    description: description?.trim() || "",
    animes: [],
  });

  await newPlaylist.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        newPlaylist,
        "Playlist created successfully"
      )
    );
});

/**
 * Get all playlists for the authenticated user
 * GET /api/playlist/playlists
 */
export const getAnimePlaylist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const playlists = await AnimePlaylist.find({ userId }).populate(
    "userId",
    "name email"
  );

  if (!playlists || playlists.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No playlists found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists retrieved successfully"));
});

/**
 * Get all animes in a specific playlist by ID
 * GET /api/playlist/playlists/:id
 */
export const seeAllAnimeOnPlaylist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Validate playlist ID format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid playlist ID format");
  }

  const playlist = await AnimePlaylist.findById(id).populate(
    "userId",
    "name email"
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Verify the playlist belongs to the authenticated user
  if (playlist.userId._id.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to access this playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Playlist retrieved successfully")
    );
});

/**
 * Add an anime to a specific playlist
 * POST /api/playlist/playlists/:id/add-anime
 */
export const addAnimeToPlaylist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { animeTitle } = req.body;
  const userId = req.user._id;

  // Validate inputs
  if (!animeTitle || animeTitle.trim() === "") {
    throw new ApiError(400, "Anime title is required");
  }

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid playlist ID format");
  }

  // Find the playlist
  const playlist = await AnimePlaylist.findById(id);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Verify ownership
  if (playlist.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to modify this playlist");
  }

  // Check for duplicates
  if (playlist.animes.includes(animeTitle.trim())) {
    throw new ApiError(400, "Anime is already in this playlist");
  }

  // Add anime to playlist
  playlist.animes.push(animeTitle.trim());
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Anime added to playlist successfully"
      )
    );
});
