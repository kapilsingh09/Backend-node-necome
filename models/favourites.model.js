import mongoose from "mongoose";

const favouritesSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound index to ensure unique anime per user
favouritesSchema.index({ userId: 1, animeId: 1 }, { unique: true });

export const Favourites = mongoose.model("Favourites", favouritesSchema);

