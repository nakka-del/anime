const Watchlist = require("../models/Watchlist");

const getWatchlist = async (req, res) => {
  const items = await Watchlist.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(items);
};

const addToWatchlist = async (req, res) => {
  const { animeId, title, image, rating, type, status, episodes } = req.body;

  if (!animeId || !title) {
    return res.status(400).json({ message: "Anime id and title are required" });
  }

  const existingItem = await Watchlist.findOne({
    userId: req.user._id,
    animeId,
  });

  if (existingItem) {
    return res.status(409).json({ message: "Anime already in watchlist" });
  }

  const item = await Watchlist.create({
    userId: req.user._id,
    animeId,
    title,
    image,
    rating,
    type,
    status,
    episodes,
  });

  return res.status(201).json(item);
};

const removeFromWatchlist = async (req, res) => {
  const { animeId } = req.params;
  const deletedItem = await Watchlist.findOneAndDelete({
    userId: req.user._id,
    animeId: Number(animeId),
  });

  if (!deletedItem) {
    return res.status(404).json({ message: "Watchlist item not found" });
  }

  return res.json({ message: "Removed from watchlist" });
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
