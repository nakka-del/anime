const express = require("express");
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} = require("../controllers/watchlistController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getWatchlist);
router.post("/", addToWatchlist);
router.delete("/:animeId", removeFromWatchlist);

module.exports = router;
