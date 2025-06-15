import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import logger from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

// internal dependencies
import analysisRoutes from './routes/analysis.routes.ts';
import { swaggerSpec } from './config/swagger.ts';

const app = express();

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later.',
});

app.use(logger('dev')); // Logging middleware for development on every request a log is generated
app.use(express.json());

app.use(limiter); // Apply rate limiting middleware to all routes

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Serve Swagger UI documentation at /api-docs

// created a route
app.use('/api/analyze-pr', analysisRoutes);

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || '', {})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));

export default app; // Export the app for testing purposes
