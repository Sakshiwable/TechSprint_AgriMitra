import DirectMessage from "../models/DirectMessage.js";
import { getIO } from "../sockets/index.js";

// Get messages between current user and another user
export const getDirectMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const myId = req.userId;

    const messages = await DirectMessage.find({
      $or: [
        { fromUserId: myId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: myId },
      ],
    })
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};

// Send a direct message
export const sendDirectMessage = async (req, res) => {
  try {
    const { toUserId } = req.params;
    const { content, messageType } = req.body;
    const fromUserId = req.userId;

    // content is generic: text, url (for image/file/voice)
    
    const newMessageData = {
      fromUserId,
      toUserId,
      messageType: messageType || "text",
    };

    if (["image", "file", "voice"].includes(messageType)) {
        if (messageType === "voice") newMessageData.voiceUrl = content;
        else newMessageData.attachmentUrl = content;
    } else {
        newMessageData.text = content;
    }

    const newMessage = await DirectMessage.create(newMessageData);

    // Socket Emission
    const io = getIO();
    if (io) {
        // Emit to receiver room (usually user ID)
        io.to(toUserId).emit("newDirectMessage", newMessage);
        // Also emit to sender (for multi-device sync)
        io.to(fromUserId).emit("newDirectMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};
