const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAvatar = (seed) =>
  `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;

const seedDemoUsers = async () => {
  const demoUsers = [
    {
      name: "AnimeVerse Admin",
      email: "admin@animeverse.demo",
      password: "Admin@123",
      role: "admin",
      avatar: createAvatar("AnimeVerse Admin"),
    },
    {
      name: "AnimeVerse User",
      email: "user@animeverse.demo",
      password: "User@123",
      role: "user",
      avatar: createAvatar("AnimeVerse User"),
    },
  ];

  for (const demoUser of demoUsers) {
    const existingUser = await User.findOne({ email: demoUser.email });

    if (existingUser) {
      continue;
    }

    const hashedPassword = await bcrypt.hash(demoUser.password, 10);
    await User.create({
      name: demoUser.name,
      email: demoUser.email,
      password: hashedPassword,
      avatar: demoUser.avatar,
      role: demoUser.role,
    });
  }
};

module.exports = seedDemoUsers;
