
// app.ts
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import { CronJob } from "cron";
import prisma from "./app/utils/prisma";
import setupIndex from "./app/utils/setupIndex";

const app: Application = express();

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://sapo-frontend.vercel.app"
    ],
    credentials: true,
  })
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.send({ Message: "The server is running. . ." });
});

// Main API Routes
app.use("/api/v1", router);

// Global Error Handler
app.use(globalErrorHandler);

// Cron Job for Scheduled Updates
const job = new CronJob('1 0 * * *', async () => {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const checkRequest = await prisma.request.updateMany({
      where: {
        requestStatus: 'Pending',
        createdAt: { lt: fourteenDaysAgo }
      },
      data: { requestStatus: 'Rejected' }
    });

    const chickListing = await prisma.listing.updateMany({
      where: {
        status: 'Published',
        createdAt: { lt: thirtyDaysAgo }
      },
      data: { status: 'Expired' }
    });

    console.log(`Auto-rejected ${checkRequest.count} requests`);
    console.log(`Expired ${chickListing.count} listings`);
  } catch (error) {
    console.error('Error in CronJob:', error);
  }
});
setupIndex();
job.start();

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;

