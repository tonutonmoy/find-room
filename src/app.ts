import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
const { CronJob } = require('cron');
import prisma from "./app/utils/prisma";
import setupIndex from "./app/utils/setupIndex";

const app: Application = express();
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "https://sapo-frontend.vercel.app"
    ],
    credentials: true,
  })
);

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "The server is running. . .",
  });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

const job = new CronJob('1 0 * * *', async () => {
  
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const checkRequest = await prisma.request.updateMany({
      where: {
        requestStatus: 'Pending',
        createdAt: {
          lt: fourteenDaysAgo
        }
      },
      data: {
        requestStatus: 'Rejected'
      }
    });

    const chickListing = await prisma.listing.updateMany({
      where: {
        status: 'Published',
        createdAt: {
          lt: thirtyDaysAgo
        }
      },
      data: {
        status: 'Expired'
      }
    });

    console.log(`Auto-rejected ${checkRequest.count} requests`);
    console.log(`Auto-rejected ${chickListing.count} requests`);
  } catch (error) {
    console.error('Error updating requests:', error);
  }
});
setupIndex(); 

console.log(job.isCallbackRunning); // false
job.start();
console.log(job.isActive); // true
console.log(job.isCallbackRunning); // false

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
