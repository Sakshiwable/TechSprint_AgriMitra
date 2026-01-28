// sockets/index.js
import { Server } from "socket.io";
import mongoose from "mongoose";
import { verifyToken } from "../utils/jwt.js";
import GroupMember from "../models/GroupMember.js";
import GroupMessage from "../models/GroupMessage.js";
import DirectMessage from "../models/DirectMessage.js";
import Group from "../models/Group.js";

import {
  getRouteInfo,
  haversineDistance,
} from "../services/tomtomApi.js";

let ioInstance = null;

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  ioInstance = io;

  io.on("connection", async (socket) => {
    console.log("🟢 User connected:", socket.id);

    // 🔐 Verify JWT
    const token = socket.handshake.auth?.token;
    const decoded = verifyToken(token);
    if (!decoded) {
      socket.disconnect();
      return;
    }

    socket.userId = decoded.id;
    socket.join(`user_${socket.userId}`);

    // 👥 JOIN GROUP
    socket.on("joinGroup", async ({ groupId }) => {
      if (!mongoose.isValidObjectId(groupId)) return;

      socket.join(groupId);
      console.log(`👥 User ${socket.userId} joined group ${groupId}`);

      try {
        await GroupMember.findOneAndUpdate(
          { userId: socket.userId, groupId },
          { isOnline: true },
          { upsert: true, new: true }
        );

        const members = await GroupMember.find({ groupId }).populate(
          "userId",
          "name email avatar"
        );

        const payload = members.map((m) => ({
          userId: m.userId?._id,
          name: m.userId?.name,
          email: m.userId?.email,
          avatar: m.userId?.avatar,
          lat: m.lastLocation?.lat ?? null,
          lng: m.lastLocation?.lng ?? null,
          eta: m.eta ?? 0,
          routeDeviation: m.routeDeviation ?? false,
          isOnline: m.isOnline,
          role: m.role,
        }));

        const messages = await GroupMessage.find({ groupId })
          .sort({ createdAt: 1 })
          .limit(100)
          .populate("fromUserId", "name email");

        socket.emit("initialMessages", messages);
        io.to(groupId).emit("groupLocations", payload);
      } catch (err) {
        console.error("❌ joinGroup error:", err.message);
      }
    });

    // 💬 GROUP MESSAGE
    socket.on("sendMessage", async ({ groupId, text }) => {
      if (!groupId) return;

      try {
        const msg = await GroupMessage.create({
          groupId,
          fromUserId: socket.userId,
          text,
          messageType: "text",
        });

        const populated = await msg.populate("fromUserId", "name email");
        io.to(groupId).emit("newMessage", populated);
      } catch (err) {
        console.error("❌ sendMessage error:", err.message);
      }
    });

    // 📍 LOCATION UPDATE (CORE LOGIC)
    socket.on("locationUpdate", async ({ groupId, lat, lng }) => {
      if (
        !mongoose.isValidObjectId(groupId) ||
        typeof lat !== "number" ||
        typeof lng !== "number"
      )
        return;

      try {
        const group = await Group.findById(groupId);
        if (
          !group ||
          !group.destination ||
          typeof group.destination.lat !== "number" ||
          typeof group.destination.lng !== "number"
        ) {
          // Update location only (no routing)
          await GroupMember.findOneAndUpdate(
            { userId: socket.userId, groupId },
            {
              lastLocation: { lat, lng, updatedAt: new Date() },
              isOnline: true,
            },
            { upsert: true }
          );
          return;
        }

        const member = await GroupMember.findOne({
          userId: socket.userId,
          groupId,
        }).populate("userId", "name");

        let eta = member?.eta ?? 0;
        let routeDeviation = member?.routeDeviation ?? false;

        // ⏱ ROUTE API THROTTLING (1 min)
        const now = Date.now();
        let routeInfo = null;

        if (
          !member?.lastRouteCheck ||
          now - member.lastRouteCheck.getTime() > 60000
        ) {
          routeInfo = await getRouteInfo(
            { lat, lng },
            {
              lat: group.destination.lat,
              lng: group.destination.lng,
            }
          );

          await GroupMember.updateOne(
            { userId: socket.userId, groupId },
            { lastRouteCheck: new Date(now) }
          );
        }

        if (routeInfo?.durationValue) {
          eta = Math.round(routeInfo.durationValue / 60);
        }

        // 📐 ROUTE DEVIATION CHECK (HAVERSINE)
        const distanceFromDest = haversineDistance(
          lat,
          lng,
          group.destination.lat,
          group.destination.lng
        );

        routeDeviation = distanceFromDest > 0.5; // 500m

        // 💾 UPDATE MEMBER
        await GroupMember.findOneAndUpdate(
          { userId: socket.userId, groupId },
          {
            lastLocation: { lat, lng, updatedAt: new Date() },
            eta,
            routeDeviation,
            isOnline: true,
          },
          { upsert: true }
        );

        // 🔁 BROADCAST GROUP LOCATIONS
        const members = await GroupMember.find({ groupId }).populate(
          "userId",
          "name email avatar"
        );

        const payload = members.map((m) => ({
          userId: m.userId?._id,
          name: m.userId?.name,
          lat: m.lastLocation?.lat ?? null,
          lng: m.lastLocation?.lng ?? null,
          eta: m.eta ?? 0,
          routeDeviation: m.routeDeviation ?? false,
          isOnline: m.isOnline,
        }));

        io.to(groupId).emit("groupLocations", payload);
      } catch (err) {
        console.error("❌ locationUpdate error:", err.message);
      }
    });

    // 💬 DIRECT MESSAGE
    socket.on("sendDirectMessage", async ({ toUserId, text }) => {
      if (!toUserId) return;

      try {
        const msg = await DirectMessage.create({
          fromUserId: socket.userId,
          toUserId,
          text,
          messageType: "text",
        });

        const populated = await msg
          .populate("fromUserId", "name email avatar")
          .populate("toUserId", "name email avatar");

        socket.emit("newDirectMessage", populated);
        io.to(`user_${toUserId}`).emit("newDirectMessage", populated);
      } catch (err) {
        console.error("❌ sendDirectMessage error:", err.message);
      }
    });

    // 🌾 COMMUNITY EVENTS
    socket.on("joinCommunity", ({ communityId }) => {
      if (!communityId) return;
      socket.join(communityId);
      console.log(`🌾 User ${socket.userId} joined community ${communityId}`);
    });

    socket.on("leaveCommunity", ({ communityId }) => {
      if (!communityId) return;
      socket.leave(communityId);
    });

    // 🚪 DISCONNECT
    socket.on("disconnect", async () => {
      console.log(`🔴 User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => ioInstance;
