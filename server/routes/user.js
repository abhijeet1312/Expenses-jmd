import { Router } from "express"; // Import Router from express  
const router = Router();
import bcrypt from "bcrypt"; // Import bcrypt for password hashing  
import User from "../models/user.js"; // Import the User model  
import passport from "passport"; // Import Passport for authentication  
import { Strategy } from "passport-local"; // Import local strategy for Passport  
import Expense from "../models/expense.js"; // Import the Expense model  
import GoogleStrategy from "passport-google-oauth2"; // Import Google OAuth strategy  
import env from "dotenv"; // Import dotenv to manage environment variables  
// import { bind } from "body-parser"; // Unused import  

import user from "../models/user.js";
env.config(); // Load environment variables  
import PDFDocument from "pdfkit";

// GET route to render the user home page  
router.get("/user", async(req, res) => {
    res.render("user/user.ejs");
});

// GET route to render the registration page  
router.get("/register", async(req, res) => {
    res.render("user/user-register.ejs");
});

// GET route to render the login page  
router.get("/loginUser", async(req, res) => {
    res.render("user/user-login.ejs");
});

// GET route for rendering user dashboard  
router.get("/user-dashboard", (req, res) => {
    res.render("user/user-dashboard.ejs");
});

// GET route for Google OAuth authentication, requesting profile and email access  
router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

// GET route to handle the OAuth callback after authentication  
router.get(
    "/auth/google/user-dashboard",
    passport.authenticate("google", {
        successRedirect: "/user-dashboard", // Redirect to dashboard on success  
        failureRedirect: "/loginUser", // Redirect to login page on failure  
    })
);

// GET route for logging out the current user  
router.get("/logoutUser", (req, res) => {
    req.logout(function(err) {
        if (err) {
            return next(err); // Handle logout error  
        }
        res.redirect("/"); // Redirect to home after logout  
    });
}); // POST route to handle user expense submissions  
router.post("/user-expense", async(req, res) => {
    const BILL = Number(req.body.bill); // Parse the bill amount from the request body  
    const FRIENDSCOUNT = Number(req.body.friendsCount) + 1; // Get the friends count and increment for the user  
    const action = req.body.action; // Determine the type of action (equal, exact, percentage)  
    const PURPOSE = req.body.purpose; // Obtain the purpose of the expense  

    // Validate input   
    const errors = []; // Array to accumulate validation errors  
    const Friendcount = FRIENDSCOUNT - 1; // Calculate the number of friends  
    if (!BILL || isNaN(BILL)) {
        errors.push("A valid BILL is required."); // Check if BILL is valid  
    }
    if (!Friendcount || isNaN(Friendcount)) {
        errors.push("A valid Friendcount is required."); // Check if Friendcount is valid  
    }
    if (!PURPOSE || PURPOSE.trim() === "") {
        errors.push("PURPOSE is required."); // Ensure PURPOSE is not empty  
    }

    // Check for errors  
    if (errors.length > 0) {
        return res.status(400).send(errors.join('<br>')); // Return errors if found  
    }

    // Proceed if user is authenticated  
    if (req.isAuthenticated()) {
        const userEmail = req.user.useremail; // Get user's email from the request  


        // Handle expense splitting based on action type  
        if (action === 'equal') {
            // Split bill equally among friends  
            const eachbill = BILL / FRIENDSCOUNT;
            const result = await Expense.create({ userId: userEmail, totalAmount: eachbill, purpose: PURPOSE, totalFriends: FRIENDSCOUNT, totalbillamount: BILL });
            res.send(`Each friend owes ${eachbill}`); // Send response with the amount each friend owes  
        } else if (action === 'exact') {
            // Render page for exact bill splitting  

            res.render("user/user-exact.ejs", {
                friendsCount: FRIENDSCOUNT - 1,
                totalAmount: BILL,
                purpose: PURPOSE
            });
        } else if (action === 'percentage') {
            // Render page for percentage bill splitting  

            res.render("user/user-percentage.ejs", {
                friendsCount: FRIENDSCOUNT - 1,
                totalAmount: BILL,
                purpose: PURPOSE
            });
        }
    }
});

// GET route to display user details  
router.get("/userDetails", (req, res) => {
    if (req.isAuthenticated()) { // Check if the user is authenticated  
        res.render("user/user-details.ejs", {
            NAME: req.user.username, // Render user's name  
            EMAIL: req.user.useremail, // Render user's email  
            MOBILENUMBER: req.user.mobile, // Render user's mobile number  
        });
    }
});

// GET route to fetch all user expenses  
router.get("/userOverallExpenses", async(req, res) => {
    if (req.isAuthenticated()) { // Check if the user is authenticated  
        const resultBill = await Expense.find({ userId: req.user.useremail }) // Fetch all expenses  

        res.render("user/user-expenses.ejs", {
            list: resultBill, // Pass the expenses list to the view  
            EMAIL: req.user.useremail,
        });
    }
});

// GET route to display overall expenses  
router.get("/overallExpenses", async(req, res) => {
    if (req.isAuthenticated()) { // Check if the user is authenticated  

        const resultBill = await Expense.find({ userId: req.user.useremail }) // Fetch the bills  

        res.render("user/overall-bill.ejs", { list: resultBill, EMAIL: req.user.useremail, }); // Render expenses  
    }
});

// GET route to download user expenses  
router.get("/download", async(req, res) => {
    if (req.isAuthenticated) {


        const resultBill = await Expense.find({ userId: req.user.useremail }) // Fetch all expenses  
        res.render("user/user-download.ejs", {

            EMAIL: req.user.useremail
                // Pass the expenses to the download view  

        });
    }
});

// GET route to handle PDF generation for expenses  
router.post("/download-pdf/:id", async(req, res) => {
    const emailId = req.params.id;


    try {
        const result = await Expense.find({ userId: emailId });


        if (result.length === 0) {
            return res.status(404).send('No expenses found for this user.');
        }

        // Create a new PDF document
        const doc = new PDFDocument();
        let filename = `expenses-${emailId}.pdf`;
        filename = encodeURIComponent(filename); // Encode the filename for safe download

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        // Pipe the PDF into the response
        doc.pipe(res);

        // Add title
        doc.fontSize(25).text('User Expenses Report', { align: 'center' });
        doc.moveDown();

        // Add each expense to the PDF
        result.forEach(expense => {
            doc.fontSize(12).text(`Description: ${expense.purpose}`);
            doc.text(`Amount: $${expense.totalAmount}`);
            doc.text(`Date: ${expense.createdAt}`);
            doc.moveDown();
        });
        doc.fontSize(25).text('Total Trips  Report', { align: 'center' });
        doc.moveDown();

        // Add each expense to the PDF
        result.forEach(expense => {
            doc.fontSize(12).text(`Description: ${expense.purpose}`);
            doc.text(`Total amount spent: $${expense.totalbillamount}`);
            doc.text(`Date: ${expense.createdAt}`);
            doc.moveDown();
        });

        // Finalize the PDF and end the stream
        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal server error');
    }


});
// POST route to handle friends' expenses with exact amounts  
router.post("/user-friends-expenses", async(req, res) => {
    const totalFriends1 = Number(req.body.totalfriends); // Number of friends  
    const totalbill = Number(req.body.totalamount); // Total bill amount  
    const PURPOSE = req.body.purpose; // Purpose of the expense  

    const bill = 'bill'; // Prefix for bill inputs  

    if (req.isAuthenticated()) { // Check if user is authenticated  
        const userEmail = req.user.useremail; // Get user's email  

        var totalAmountByFriends = 0; // Initialize total amount paid by friends  

        // Loop through each friend's paid amount  
        for (var i = 0; i < totalFriends1; i++) {
            const jmd = String(bill + (i + 1)); // Construct input name for friend's bill  
            var BILL = Number(req.body[jmd]); // Fetch amount paid by the friend  
            res.write(`Amount paid by Friend ${i+1} is ${BILL}\n`); // Log the amount  
            totalAmountByFriends += BILL; // Accumulate total amount paid by friends  
        }

        var amountPaidByMe = (totalbill - totalAmountByFriends); // Calculate the amount paid by the user  

        res.write(`The amount paid by me is ${amountPaidByMe} `); // Log user's contribution  
        const result = await Expense.create({
            userId: userEmail,
            totalAmount: amountPaidByMe,
            purpose: PURPOSE,
            totalFriends: totalFriends1,
            totalbillamount: totalbill
        });

        res.send(); // Send response to client  
    }
});

// POST route to handle friends' expenses with percentages  
router.post("/user-friends-percentage", async(req, res) => {
    const totalFriends1 = Number(req.body.totalfriends); // Number of friends  
    const totalbill = Number(req.body.totalamount); // Total bill amount  
    const PURPOSE = req.body.purpose; // Purpose of the expense  

    const bill = 'bill'; // Prefix for bill inputs  

    if (req.isAuthenticated()) { // Check if user is authenticated  
        const userEmail = req.user.useremail; // Get user's email  

        var totalAmountByFriends = 0; // Initialize total percentage paid by friends  
        var flag = true; // Flag for successful validation  
        var billArray = []; // Array to hold each friend's percentage  

        // Loop through each friend's percentage input  
        for (var i = 0; i < totalFriends1; i++) {
            const jmd = String(bill + (i + 1)); // Construct input name for friend's percentage  
            var BILL = Number(req.body[jmd]); // Fetch percentage paid by the friend  

            totalAmountByFriends += BILL; // Accumulate total percentage  
            // Validate that total percentage does not exceed 100%  
            if (totalAmountByFriends >= 100 || BILL >= 100) {
                res.write("Error please fill the percentage less than 100");
                flag = false; // Set flag to false if validation fails  
                break;
            } else {
                billArray[i] = BILL; // Store valid percentage in array  
            }
        }

        var amountPaidByMe = (100 - totalAmountByFriends); // Calculate percentage to be paid by the user  


        if (flag) {
            // Log the percentage amounts  
            for (var i = 0; i < totalFriends1; i++) {
                res.write(`Amount paid by Friend ${i+1} is ${billArray[i]}%\n`);
            }
            res.write(`The percentage paid by me is ${amountPaidByMe}%`);
        }

        // Calculate the actual amount to be paid by the user based on the total bill  
        var totalbillPercentage = (amountPaidByMe / 100) * (totalbill);

        const result = await Expense.create({
            userId: userEmail,
            totalAmount: totalbillPercentage,
            purpose: PURPOSE,
            totalFriends: totalFriends1,
            totalbillamount: totalbill
        });

        res.send(); // Send response to client  
    }
});

// POST route to authenticate the logged-in user using passport local strategy  
router.post("/loginUser", passport.authenticate("localUser", {
    successRedirect: "/user-dashboard", // Redirect on successful login  
    failureRedirect: "/loginUser", // Redirect on failed login  
}));

// POST route for user registration  
router.post("/register", async(req, res) => {
    try {
        const USEREMAIL = req.body.useremail; // Get user email  
        const PASSWORD = req.body.password; // Get user password  
        const MOBILENUMBER = req.body.usernumber; // Get user mobile number  
        const USERNAME = req.body.username; // Get username  

        const result = await User.findOne({ useremail: USEREMAIL }); // Check if user already exists  

        if (result) {
            res.status(401).json({ message: "You are already registered" }); // Respond if user already exists  
        } else {
            // Hash password and store user information  
            bcrypt.hash(PASSWORD, 10, async(err, hash) => {
                if (err) {
                    console.error("Error hashing password:", err);
                } else {
                    const result = await User.create({ useremail: USEREMAIL, password: hash, username: USERNAME, mobile: MOBILENUMBER });
                    const user = result;
                    req.login(user, (err) => {
                        console.log("success");
                        res.redirect("/user-dashboard"); // Redirect to dashboard after successful registration  
                    });
                }
            });
        }
    } catch (error) {
        console.log(error); // Log any errors  
    }
});

// Passport local strategy for user authentication  
passport.use("localUser", new Strategy(async function verify(username, password, cb) {
    try {
        const result = await User.find({ useremail: username }); // Find user by email  

        // If user is found, compare passwords  
        if (result) {
            const user = result[0];
            const storedHashedPassword = user.password;
            bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                if (err) {
                    console.error("Error comparing passwords:", err);
                    return cb(err);
                } else { // Return authenticated user or failure  
                    if (valid) {
                        return cb(null, user);
                    } else {
                        return cb(null, false);
                    }
                }
            });
        } else {
            return cb("User not found"); // Handle user not found  
        }
    } catch (err) {
        console.log(err); // Log any errors  
    }
}));
// Use Passport to authenticate user using Google's OAuth2 strategy  
passport.use(
    "google", // Name of the strategy  
    new GoogleStrategy({ // Initialize the Google strategy  
            clientID: process.env.GOOGLE_CLIENT_ID, // Google client ID from environment variables  
            clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google client secret from environment variables  
            callbackURL: "http://localhost:3001/auth/google/user-dashboard", // URL for handling the callback after authentication  
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo", // URL to fetch user profile info from Google  
        },
        async(accessToken, refreshToken, profile, cb) => { // Callback function executed after Google verifies the user's identity  
            try {
                // Find user in database using the email provided by Google  
                const result = await User.find({ useremail: profile.email });

                // Check if the user is registered or not  
                if (result.length === 0) { // If no user is found  
                    // Create a new user with default fields in the database  
                    const Newuser = await User.create({
                        useremail: profile.email, // User's email from Google profile  
                        password: "google", // Placeholder password (consider improving for security)  
                        username: "googlename", // Placeholder username (can be improved)  
                        mobile: "+911234567890" // Placeholder mobile number (consider making this user-specific)  
                    });

                    cb(null, Newuser); // Callback with the newly created user object  
                } else {
                    // If user already exists, return the existing user  
                    cb(null, result[0]); // Return the first matching user object  
                }

            } catch (error) {
                console.log(error); // Log any errors encountered in the process  
                cb(error); // Return the error via the callback  
            }
        })
);

// Serialize user to store user information in the session  
passport.serializeUser((user, cb) => {
    cb(null, user); // Store the entire user object in the session  
});

// Deserialize user to retrieve user data from the session  
passport.deserializeUser((user, cb) => {
    cb(null, user); // Retrieve the user object from the session for later use  
});

// Export the router to be used in other modules of the application  
export default router;