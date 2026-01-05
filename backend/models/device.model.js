import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
  {
    /* =====================
       DEVICE IDENTITY
    ====================== */
    deviceID: {
      type: String,
      required: true,
      unique: true,
    },

    deviceName: {
      type: String,
      default: "RFID Shelf",
    },

    /* =====================
       LIVE STATUS (Dashboard)
    ====================== */
    isOnline: {
      type: Boolean,
      default: false,
    },

    lastUpdate: {
      type: Date,
      default: Date.now,
    },

    /* =====================
       QUICK STATS CARDS
    ====================== */
    totalBooks: {
      type: Number,
      default: 0,
    },

    availableBooks: {
      type: Number,
      default: 0,
    },

    borrowedBooks: {
      type: Number,
      default: 0,
    },

    newArrivals: {
      type: Number,
      default: 0,
    },

    /* =====================
       RECENT ACTIVITY FEED
    ====================== */
    lastActivity: {
      type: String, // "Book Borrowed", "Book Returned"
      default: "",
    },

    lastActivityTime: {
      type: Date,
      default: Date.now,
    },

    /* =====================
       ALERTS & NOTIFICATIONS
    ====================== */
    hasAlert: {
      type: Boolean,
      default: false,
    },

    alertMessage: {
      type: String,
      default: "",
    },

    /* =====================
       ANALYTICS SUPPORT
    ====================== */
    borrowCountToday: {
      type: Number,
      default: 0,
    },

    borrowCountMonth: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Device = mongoose.model("Device", DeviceSchema);

export default Device;