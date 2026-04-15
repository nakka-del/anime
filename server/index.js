const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const seedDemoUsers = require("./config/seedDemoUsers");
const seedDemoAnime = require("./config/seedDemoAnime");
const authRoutes = require("./routes/authRoutes");
const animeRoutes = require("./routes/animeRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "AnimeVerse API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/anime", animeRoutes);
app.use("/api/watchlist", watchlistRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  try {
    await connectDB();
    await seedDemoUsers();
    await seedDemoAnime();
  } catch (error) {
    console.error(`MongoDB unavailable, continuing without auth/watchlist persistence: ${error.message}`);
  }
};

startServer();
