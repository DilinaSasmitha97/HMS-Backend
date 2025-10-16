const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const patientRoutes = require('./routes/patientRoutes'); // 1. Import the routes

dotenv.config();
// Note: You might need to change the mongoose connection options in './config/db'
// The options useNewUrlParser: true and useUnifiedTopology: true are often obsolete 
// or unnecessary in recent Mongoose versions.
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 2. Use the patient routes for the '/api/patients' endpoint
app.use('/api/patients', patientRoutes); 

// Basic root route for server status check
app.get('/', (req, res) => {
    res.send('Hospital Management System MERN Backend is running!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}. API available at http://localhost:${PORT}/api/patients`));
