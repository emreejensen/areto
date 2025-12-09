import express from 'express';
import cors from 'cors';
// import notesRoutes from './routes/notesRoutes.js'; //
import quizRoutes from './routes/quizRoutes.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import rateLimiter from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// middleware to parse JSON bodies
app.use(express.json());
app.use(rateLimiter);
// custom logging middleware
app.use((req, res, next) => {
    console.log("Request received:", req.method, req.url);
    next();
});

// Root route - prevents 404 when visiting backend URL directly
app.get('/', (req, res) => {
  res.json({ 
    message: 'Areto Quiz API',
    status: 'running',
    version: '1.0.0'
  });
});

// app.use("/api/notes", notesRoutes); //
app.use("/api/quizzes", quizRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});