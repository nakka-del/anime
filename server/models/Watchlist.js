const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    animeId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "",
    },
    episodes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

watchlistSchema.index({ userId: 1, animeId: 1 }, { unique: true });

module.exports = mongoose.model("Watchlist", watchlistSchema);
