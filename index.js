import express from "express";
import dotenv from "dotenv"
import { connectDB } from "./config/db.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/userRoute.js";
import serviceRoutes from "./routes/serviceRoute.js";
import bookingRoutes from "./routes/bookingRoute.js";
import cors from 'cors';
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
connectDB();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
  origin: ['http://localhost:5173'], 
  credentials: true,               
}));


app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
    console.log(`${process.env.PORT} server is running`);
})