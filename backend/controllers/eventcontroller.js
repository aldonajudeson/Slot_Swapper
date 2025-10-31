const Event = require("../models/eventModel");

exports.createEvent = async (req, res) => {
  try {
    const { title, startTime, endTime } = req.body;
    if ((!title || !startTime, endTime)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const event = await Event.create({
      userId: req.user._id,
      title,
      startTime,
      endTime,
      status: "BUSY",
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const events = (await Event.find({ userId: req.user._id })).toSorted({
      startTime: 1,
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.userId.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });
    const { title, starttime, endtime, status } = req.body;

    event.title = title || event.title;
    event.startTime = startTime || event.startTime;
    event.endTime = endTime || event.endTime;
    event.status = status || event.status;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event Not Found" });
    if (event.userId.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
