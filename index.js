const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/CorsOptions.js");
const credentials = require("./middleware/credentials.js");
const connectToMongo = require("./config/ConnectMongo.js");
const authRouter = require("./routes/auth.js");
const sellerRouter = require("./routes/sellerRoutes.js");
const productRouter = require("./routes/productRoutes.js");
const cartRouter = require("./routes/cartRoutes.js");
const orderRouter = require("./routes/orderRoutes.js");
const cors = require("cors");

require("dotenv").config();

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

connectToMongo();

app.get("/", (req, res) => res.send("Express on Vercel"));
app.use("/api/auth", authRouter);
app.use("/api/sellers", sellerRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

app.listen(1337, () => {
  console.log("Server started on port 1337");
});
