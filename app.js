require("dotenv").config();

// --- DEBUGGING ENVIRONMENT VARIABLES (moved to very top) ---
console.log("--- DEBUGGING ENVIRONMENT VARIABLES ---");
console.log("process.env.APP_URL:", process.env.APP_URL);
console.log("process.env.PORT:", process.env.PORT);
console.log("process.env.TENANT_ID:", process.env.TENANT_ID);
console.log("process.env.CLIENT_ID:", process.env.CLIENT_ID);
console.log("process.env.CLIENT_SECRET:", process.env.CLIENT_SECRET ? "********* (present)" : "MISSING");
console.log("process.env.OAUTH_SERVER_URL:", process.env.OAUTH_SERVER_URL);
console.log("process.env.SESSION_SECRET:", process.env.SESSION_SECRET ? "********* (present)" : "MISSING");
console.log("process.env.DATABASE_URL:", process.env.DATABASE_URL);
console.log("--- END DEBUGGING ENV ---");


const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose"); // For MongoDB
const WebAppStrategy = require("ibmcloud-appid").WebAppStrategy;

const app = express();
const PORT = process.env.PORT || 3000;
const CALLBACK_URL = "/ibm/cloud/appid/callback";

// --- Database Connection (MongoDB Example) ---
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("Connected to MongoDB")) // This custom log should appear
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// --- Mongoose Schema & Model for Blog Posts ---
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: String, required: true }, // Store App ID user ID
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model("Post", postSchema);


// -------------------------
// Middleware
// -------------------------
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(express.json()); // For parsing JSON data

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// IBM App ID configuration
try {
    // The console.log statements are already moved to the top, so remove them from here
    passport.use(
        new WebAppStrategy({
            tenantId: process.env.TENANT_ID,
            clientId: process.env.CLIENT_ID,
            secret: process.env.CLIENT_SECRET,
            oauthServerUrl: process.env.OAUTH_SERVER_URL,
            redirectUri: process.env.APP_URL + CALLBACK_URL
        })
    );
    console.log("WebAppStrategy initialized successfully.");
} catch (error) {
    console.error("Error initializing WebAppStrategy:", error);
    process.exit(1); // Exit if App ID setup fails critically
}

// Static files
app.use(express.static(path.join(__dirname, "public")));

// -------------------------
// Routes
// -------------------------

// Public Home Page (displays public posts)
app.get("/", async (req, res) => {
    // ... (rest of your / route) ...
    try {
        const publicPosts = await Post.find().sort({ createdAt: -1 }).limit(5); // Get 5 latest posts
        res.sendFile(path.join(__dirname, "public", "index.html"));
    } catch (error) {
        console.error("Error fetching public posts:", error);
        res.status(500).send("Error fetching content.");
    }
});

// ... (rest of your routes) ...

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// --- Ensure this console.log appears ---
console.log("Attempting to start server on port", PORT); // Add this line

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});