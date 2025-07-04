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

// config the dotenv
dotenv.config({ path: "./src/config/.env" });

// Initiallising app
const app = express();
// app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Allow requests from any origin
app.use(cors());

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

// export app
export default app;
