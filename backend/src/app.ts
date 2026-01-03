import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import companiesRoutes from './routes/companies.routes';
import breaksRoutes from './routes/breaks.routes';
import reportsRoutes from './routes/reports.routes';
import employeesRoutes from './routes/employees.routes';
import dashboardRoutes from './routes/dashboard.routes';
import platesRoutes from './routes/plates.routes';
import usersRoutes from './routes/users.routes';
import { masterRouter } from './routes/master.routes';
import healthRoutes from './routes/health.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRoutes);
app.use('/master', masterRouter); // Master Control Layer
app.use('/auth', authRoutes);
app.use('/companies', companiesRoutes);
app.use('/breaks', breaksRoutes);
app.use('/reports', reportsRoutes);
app.use('/employees', employeesRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/plates', platesRoutes);
app.use('/users', usersRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Pausa SaaS Backend');
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Global Error Handler (must be after all routes)
import { errorHandler } from './middleware/errorHandler.middleware';
app.use(errorHandler);

export default app;
// Force restart

