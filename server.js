const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const raceManager = require('./routes/raceManager');
const driverManager = require('./routes/driverManager');
const lapManager = require('./routes/lapManager');
const initDatabase = require('./config/initDatabase');
const accessKeyAuth = require('./middleware/accessKeyAuth');
require('dotenv').config();

// List of required environment variables
const REQUIRED_ENV_VARS = ['RECEPTIONIST_KEY', 'OBSERVER_KEY', 'SAFETY_KEY'];

// Check for missing environment variables
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
    // Log an error message and exit if any required environment variables are missing
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

const app = express(); // Create an Express application.
const server = http.createServer(app); // Create an HTTP server using the Express app.
const io = socketIo(server); // Attach Socket.IO to the HTTP server to handle WebSocket connections.

const PORT = 8080;

app.use(express.json()); // For parsing application/json (this is needed to parse auth key data)

// Middleware to serve static files
app.use(express.static('public'));
app.use('/controllers', express.static('controllers'));

app.get('/middleware/auth.js', (req, res) => {
    res.set('Content-Type', 'text/javascript');
    res.sendFile(path.join(__dirname, 'middleware', 'auth.js'));
});

// Define routes (first 3 require authentication)
app.get('/front-desk', accessKeyAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'front-desk.html'));
});

app.get('/race-control', accessKeyAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'race-control.html'));
});

app.get('/lap-line-tracker', accessKeyAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'lap-line-tracker.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'index.html'));
});

app.get('/next-race', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'next-race.html'));
});

app.get('/race-flags', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'race-flags.html'));
});

app.get('/leader-board', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'leader-board.html'));
});

app.get('/race-countdown', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'race-countdown.html'));
});

// Endpoint to validate access keys
app.post('/validate-key', (req, res) => {
    const { key } = req.body;
    if (key === process.env.RECEPTIONIST_KEY) {
        res.json({ valid: true, redirectUrl: '/front-desk' });
    } else if (key === process.env.SAFETY_KEY) {
        res.json({ valid: true, redirectUrl: '/race-control' });
    } else if (key === process.env.OBSERVER_KEY) {
        res.json({ valid: true, redirectUrl: '/lap-line-tracker' });
    } else {
        res.json({ valid: false });
    }
});

// Initialize the database and then start the server
initDatabase().then(() => {
    // Set race duration based on environment
    const RACE_DURATION = process.env.NODE_ENV === 'development' ? 60 : 600;
    raceManager.setRaceDuration(RACE_DURATION); // Set the race duration in raceManager

    // Initialize race manager with io
    raceManager.initialize(io);
    driverManager.initialize(io);
    lapManager.initialize(io);

    io.on('connection', (socket) => {
        console.log('A client connected');

        // Load sessions and ongoing race from the database when a client connects
        raceManager.loadSessions();
        raceManager.loadOngoingRace();

        // Socket.IO event handlers
        socket.on('requestSessionList', () => {
            raceManager.loadSessions();
        });

        socket.on('addSession', (session) => {
            console.log('addSession event received:', session);
            raceManager.addSession(session);
        });

        socket.on('removeSession', (sessionId) => {
            console.log('removeSession event received:', sessionId);
            raceManager.removeSession(sessionId);
        });

        socket.on('addDriver', (driver) => {
            console.log('addDriver event received:', driver);
            driverManager.addDriver(driver);
        });

        socket.on('editDriver', (driver) => {
            console.log('editDriver event received:', driver);
            driverManager.editDriver(driver);
        });

        socket.on('removeDriver', (driverId) => {
            console.log('removeDriver event received:', driverId);
            driverManager.removeDriver(driverId);
        });

        socket.on('getDrivers', ({ sessionId }) => {
            console.log('getDrivers event received for sessionId:', sessionId);
            driverManager.getDrivers(sessionId);
        });

        socket.on('startRace', ({ sessionId }) => {
            console.log('startRace event received for sessionId:', sessionId);
            raceManager.startRace(sessionId);
        });

        socket.on('updateRaceStatus', (data) => {
            console.log('updateRaceStatus event received:', data);
            raceManager.updateRaceStatus(data);
        });

        socket.on('endRace', ({ sessionId }) => {
            console.log('endRace event received for sessionId:', sessionId);
            raceManager.endRace(sessionId);
        });

        socket.on('carLap', (data) => {
            console.log('carLap event received:', data);
            lapManager.carLap(data);
        });

        socket.on('disconnect', () => {
            console.log('A client disconnected');
        });
    });

    // Start the server
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    // Log an error message and exit if there's an issue initializing the database
    console.error('Error initializing database', err);
    process.exit(1);
});

