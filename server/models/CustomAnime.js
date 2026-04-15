const mongoose = require("mongoose");

const namedSchema = new mongoose.Schema(
  {
    mal_id: Number,
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const promoVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Promo Video",
    },
    trailer: {
      embed_url: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },
    images: {
      jpg: {
        image_url: {
          type: String,
          default: "",
        },
      },
    },
  },
  { _id: false },
);

const customAnimeSchema = new mongoose.Schema(
  {
    animeId: {
      type: Number,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    title_english: {
      type: String,
      default: "",
    },
    title_japanese: {
      type: String,
      default: "",
    },
    synopsis: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    scored_by: {
      type: Number,
      default: 0,
    },
    episodes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "Finished Airing",
    },
    type: {
      type: String,
      default: "TV",
    },
    season: {
      type: String,
      default: "",
    },
    year: {
      type: Number,
      default: null,
    },
    seasonYear: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      required: true,
    },
    trailer: {
      type: String,
      default: "",
    },
    trailerImage: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    popularity: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    genres: {
      type: [namedSchema],
      default: [],
    },
    themes: {
      type: [namedSchema],
      default: [],
    },
    demographics: {
      type: [namedSchema],
      default: [],
    },
    studios: {
      type: [namedSchema],
      default: [],
    },
    characters: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    promoVideos: {
      type: [promoVideoSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("CustomAnime", customAnimeSchema);
