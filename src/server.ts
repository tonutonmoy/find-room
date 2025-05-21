// import { Server } from 'http';
// import app from './app';
// import seedSuperAdmin from './app/DB';
// import config from './config';

// const port = config.port || 5000;

// async function main() {
//   const server: Server = app.listen(port, () => {
//     console.log('Sever is running on port ', port);
//     seedSuperAdmin();
//   });
//   const exitHandler = () => {
//     if (server) {
//       server.close(() => {
//         console.info('Server closed!');
//       });
//     }
//     process.exit(1);
//   };

//   process.on('uncaughtException', error => {
//     console.log(error);
//     exitHandler();
//   });

//   process.on('unhandledRejection', error => {
//     console.log(error);
//     exitHandler();
//   });
// }

// main();





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
        "https://sapo-frontend.vercel.app"
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
      console.log(result.reciverId,'tonu')
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
