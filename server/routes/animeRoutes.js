const express = require("express");
const {
  getHomeData,
  getAnimeList,
  getAnimeSuggestions,
  getAnimeById,
  getAdminAnime,
  createAdminAnime,
  deleteAdminAnime,
} = require("../controllers/animeController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/admin", protect, adminOnly, getAdminAnime);
router.post("/admin", protect, adminOnly, createAdminAnime);
router.delete("/admin/:id", protect, adminOnly, deleteAdminAnime);
router.get("/home", getHomeData);
router.get("/search/suggestions", getAnimeSuggestions);
router.get("/", getAnimeList);
router.get("/:id", getAnimeById);

module.exports = router;
