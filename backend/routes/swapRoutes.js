const express = require("express");
const router = express.Router();
const {
  getSwappableSlots,
  createSwapRequest,
  respondSwapRequest,
} = require("../controllers/swapController");
const { protect } = require("../middleware/authMiddleware");

router.get("/swappable", protect, getSwappableSlots);
router.post("/request", protect, createSwapRequest);
router.post("/response/:requestId", protect, respondSwapRequest);

module.exports = router;
