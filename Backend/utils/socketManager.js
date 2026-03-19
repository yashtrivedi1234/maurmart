// Socket.IO instance manager - avoid circular dependency issues
let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
  console.log("✅ Socket.IO instance registered");
};

export const getIO = () => {
  if (!ioInstance) {
    console.error("❌ Socket.IO instance not initialized");
    return null;
  }
  return ioInstance;
};
