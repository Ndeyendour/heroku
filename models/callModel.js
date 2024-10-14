import Call from "./models/callModel.js";

// Example of saving a new call
const newCall = new Call({
  callerId: callerUserId,
  receiverId: receiverUserId,
  callType: "video", // or "voice"
  token: zegocloudToken, // ZEGOCLOUD token generated for this session
});

await newCall.save();
