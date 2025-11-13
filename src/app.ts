import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import passport from "./config/passport";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { env } from "./config/env";
import authRoutes from "./modules/auth/auth.router";
import collaboratorsRoutes from "./modules/collaborators/collaborators.router";
import stripeRoutes from "./modules/stripe/stripe.router";
import addressRoutes from "./modules/address/address.router";
const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true, // Important for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(passport.initialize());
app.use("/api/stripe", stripeRoutes);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/collaborators", collaboratorsRoutes);

// Swagger UI
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
