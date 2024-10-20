import express from "express";
import bodyParser from "body-parser";

import passport from "passport";
import session from "express-session";
import env from "dotenv";
import userRouter from "./server/routes/user.js"
// import adminRouter from "./server/routes/admin.js"
import cookieParser from "cookie-parser";

import connectDB from "./server/config/db.js";
// import mongoose from "mongoose";


env.config(); //very important line for initaliszing env file
connectDB(); //mongodb connects from here
const app = express();
const port = process.env.PORT || 3001;


// Set up session middleware for the application  
app.use(
    session({
        // Secret key for signing the session ID cookie, sourced from environment variables  
        secret: process.env.SESSION_SECRET,
        // Configure session behavior to not save the session if it hasn't been modified  
        resave: false,
        // Configure session behavior to save uninitialized sessions to the store, even if they are not modified  
        saveUninitialized: true,
    })
);
app.use(passport.initialize());

// Enable persistent login sessions for authenticated users using Passport  
app.use(passport.session());

// Use cookie-parser middleware to parse cookies from the HTTP requests  
app.use(cookieParser());

//middle wares for parsing the user input
app.use(bodyParser.urlencoded({ extended: true }));
//middleware for accessing the css files
app.use(express.static("public"));



// Initialize Passport middleware for authentication  



// Use userRouter for handling routes related to user functionality  
app.use("/", userRouter);

// Use adminRouter for handling routes related to admin functionality  
// app.use("/", adminRouter);


//renders the home page
app.get("/", (req, res) => {
    res.render("home.ejs");

})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});