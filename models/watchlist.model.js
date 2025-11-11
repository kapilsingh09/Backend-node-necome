import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    animeId: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    seen: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound index to ensure unique anime per user
watchlistSchema.index({ userId: 1, animeId: 1 }, { unique: true });

export const Watchlist = mongoose.model("Watchlist", watchlistSchema);