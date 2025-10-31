const Event = require("../models/eventModel");
const SwapRequest = require("../models/swapRequestModel");

exports.getSwappableSlots = async (req, res) => {
  try {
    const slots = await Event.find({
      userId: { $ne: req.user._id },
      status: "SWAPPABLE",
    }).sort({ startTime: 1 });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSwapRequest = async (req, res) => {
  try {
    const { mySlotId, theirSlotId } = req.body;

    const mySlot = await Event.findById(mySlotId);
    const theirSlot = await Event.findById(theirSlotId);

    if (!mySlot || !theirSlot)
      return res.status(404).json({ message: "Slot not found" });

    if (mySlot.userId.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not your slot" });

    if (mySlot.status !== "SWAPPABLE" || theirSlot.status !== "SWAPPABLE")
      return res.status(400).json({ message: "Both slots must be SWAPPABLE" });

    const swapRequest = await SwapRequest.create({
      requesterId: req.user._id,
      responderId: theirSlot.userId,
      mySlotId,
      theirSlotId,
      status: "PENDING",
    });

    mySlot.status = "SWAP_PENDING";
    theirSlot.status = "SWAP_PENDING";
    await mySlot.save();
    await theirSlot.save();

    res.status(201).json(swapRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.respondSwapRequest = async (req, res) => {
  try {
    const { accepted } = req.body;
    const request = await SwapRequest.findById(req.params.requestId);

    if (!request)
      return res.status(404).json({ message: "Swap request not found" });

    if (request.responderId.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    const mySlot = await Event.findById(request.mySlotId);
    const theirSlot = await Event.findById(request.theirSlotId);

    if (accepted) {
      request.status = "ACCEPTED";

      // Swap ownership
      const tempUser = mySlot.userId;
      mySlot.userId = theirSlot.userId;
      theirSlot.userId = tempUser;

      mySlot.status = "BUSY";
      theirSlot.status = "BUSY";

      await mySlot.save();
      await theirSlot.save();
      await request.save();

      res.json({ message: "Swap accepted", request });
    } else {
      request.status = "REJECTED";
      mySlot.status = "SWAPPABLE";
      theirSlot.status = "SWAPPABLE";

      await mySlot.save();
      await theirSlot.save();
      await request.save();

      res.json({ message: "Swap rejected", request });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
