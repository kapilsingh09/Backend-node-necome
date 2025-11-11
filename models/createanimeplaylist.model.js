import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // links playlist to the user
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  animes: [
    {
      type: String, // you can later make this ObjectId -> ref: 'Anime'
      trim: true,
    }
  ],
  //i will do it later
//   image: {
//     type: String,
//     default: ""
//   },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default  playlistSchema = mongoose.model('Animeplaylist',playlistSchema)
