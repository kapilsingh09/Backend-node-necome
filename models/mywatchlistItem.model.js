import mongoose from "mongoose";

const myWatchlistItemSchema = new mongoose.Schema({
  watchlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MyWatchlist",
    required: true
  },
  animeId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ""
  },
  seen: {
    type: Boolean,
    default: false
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

export const MyWatchlistItem = mongoose.model("MyWatchlistItem", myWatchlistItemSchema);
