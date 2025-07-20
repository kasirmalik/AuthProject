import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDb from "./config/mongodb.js";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

const port = process.env.PORT || 4000;
connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to log incoming request headers and body for debugging
app.use((req, res, next) => {
  console.log("Request Headers:", req.headers);
  console.log("Request Body:", req.body);
  next();
});

app.use(cookieParser());
app.use(cors({ credential: true }));

// Api End points
app.get("/", (req, res) => {
  res.send("Api Working Fine");
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
