const CustomAnime = require("../models/CustomAnime");
const User = require("../models/User");
const demoAnimeSeedData = require("./demoAnimeSeedData");

const buildPromoVideos = (trailer, trailerImage) =>
  trailer
    ? [
        {
          title: "Seed Trailer",
          trailer: {
            embed_url: trailer,
            url: trailer,
          },
          images: {
            jpg: {
              image_url: trailerImage || "",
            },
          },
        },
      ]
    : [];

const seedDemoAnime = async () => {
  const adminUser = await User.findOne({ email: "admin@animeverse.demo" });

  if (!adminUser) {
    return;
  }

  for (const anime of demoAnimeSeedData) {
    const existingAnime = await CustomAnime.findOne({ animeId: anime.animeId });

    if (existingAnime) {
      continue;
    }

    await CustomAnime.create({
      ...anime,
      promoVideos: buildPromoVideos(anime.trailer, anime.trailerImage),
      createdBy: adminUser._id,
    });
  }
};

module.exports = seedDemoAnime;
