import express from "express";
import ConnectDB from "./config/ConnectDB.js";
import cookieParser from "cookie-parser";
import cors from "cors"; 

import authRoutes from "./routes/authRoutes.js"
import bookRoutes from "./routes/bookRoutes.js"
import inventoryRoutes from "./routes/inventoryRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import userRoutes  from "./routes/userRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js"
import wishListRoutes from "./routes/wishListRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import checkoutRoutes from "./routes/checkoutRoutes.js"
import shippingAddressRoutes from "./routes/shippingAddressRoutes.js";
import OrderRoutes from "./routes/orderRoutes.js"

import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


// -------------------- 
//  Middleware           
// -------------------- 


const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Book Store Backend is running");
});

ConnectDB()


// Auth routes
app.use("/api/auth", authRoutes);

// book routes
app.use("/api/book", bookRoutes);

// inventory routes
app.use("/api/inventory",inventoryRoutes);

// cart routes
app.use("/api/cart",cartRoutes);

// user routes
app.use("/api/users",userRoutes);

// seller routes
app.use("/api/seller",sellerRoutes);

// wishList routes
app.use("/api/wishList",wishListRoutes);

// checkout routes
app.use("/api/checkout",checkoutRoutes);

// admin routes
app.use("/api/admin", adminRoutes);

// order routes
app.use("/api/order", OrderRoutes);

// shippingAddress routes

app.use(
  "/api/shippingAddress",
  shippingAddressRoutes
);



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});