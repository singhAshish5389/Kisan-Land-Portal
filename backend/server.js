import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import familyRoutes from './routes/family.js';
import plotRoutes from './routes/plots.js';
import landRecordRoutes from './routes/landRecords.js';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for dev/testing, can restrict in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (fallback for profile photos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/plots', plotRoutes);
app.use('/api/land-records', landRecordRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Meri Khautani backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    message: err.message || 'An internal server error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Connect to MongoDB Atlas and start server
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/meri_khautani';

console.log('Connecting to MongoDB...');
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
