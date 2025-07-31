import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import errorMiddleWare from "./middleware/error";

// import routes...
import userRouter from "./routes/userRoutes";
import runnerHistoryRouter from "./routes/runnerHistory";
import twitterRouter from "./routes/twitterRoutes";
import paymentRouter from "./routes/paymentRoutes";
import botRouter from "./routes/botRoutes";

// config the dotenv
dotenv.config({ path: "./src/config/.env" });

// Initiallising app
const app = express();
app.use(cookieParser());

// Allow requests from any origin
app.use(cors());
// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   })
// );
// const allowedOrigins = [
//   "http://localhost:5500",
//   "https://social-sniper.vercel.app",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({ path: "./src/config/.env" });
}

// It's for error handling
app.use(errorMiddleWare);

// Routes...
app.use("/api/v1/user", userRouter);
app.use("/api/v1/runnerhistory", runnerHistoryRouter);
app.use("/api/v1/twittertarget", twitterRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/bot", botRouter);

// export app
export default app;
