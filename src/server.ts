




// server.ts
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import config from "./config";
import seedSuperAdmin from "./app/DB";
import { updateRequestIntoDB } from "./app/modules/request/requst.service";

const port = config.port || 5000;

async function main() {
  const httpServer = createServer(app);

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://sapo-frontend.vercel.app",
        "http://10.0.10.55:5000 "
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket.IO events
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

  socket.on("register_user", (userId: string) => {
      socket.join(userId);
      console.log(`📌 User ${userId} joined room`);
    });

    // 2. Handle update_request
    socket.on("update_request", async (data) => {
      const { id, receverId, requestStatus } = data;

      

      const result:any = await updateRequestIntoDB(id, receverId, requestStatus);



       
      if (result && receverId) {
        // Emit only to that user

      const result:any = await updateRequestIntoDB(id, receverId, requestStatus);
    
        io.to(result.reciverId).emit("send_notification", result);
        console.log(`🔔 Notification sent to ${result.reciverId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    seedSuperAdmin(); // DB setup
  });

  // Graceful shutdown
  const exitHandler = () => {
    httpServer.close(() => {
      console.info("🛑 Server closed!");
    });
    process.exit(1);
  };

  process.on("uncaughtException", (error) => {
    console.error("❗ Uncaught Exception:", error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.error("❗ Unhandled Rejection:", error);
    exitHandler();
  });
}

main();
