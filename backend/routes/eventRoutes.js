const express = require("express");
const router = express.Router();
const {
  createEvent,
  getMyEvents,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventcontroller");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createEvent);
router.get("/my", protect, getMyEvents);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

module.exports = router;
