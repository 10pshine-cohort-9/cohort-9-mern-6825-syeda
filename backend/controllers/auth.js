const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const logger = require("../config/logger");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      logger.warn({ email }, "Registration attempt with existing email");
      return res.status(409).json({ message: "User already exists with this email" });
    }

    const user = await User.create({ name, email, password });

    logger.info({ userId: user._id, email: user.email }, "New user registered");

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    logger.error({ err: error }, "Register error");
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error during registration" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      logger.warn({ email }, "Failed login attempt");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, cookieOptions);

    logger.info({ userId: user._id, email: user.email }, "User logged in");

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    logger.error({ err: error }, "Login error");
    res.status(500).json({ message: "Server error during login" });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  logger.info("User logged out");
  res.status(200).json({ message: "Logged out successfully" });
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    logger.error({ err: error }, "GetMe error");
    res.status(500).json({ message: "Server error fetching user" });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getMe };