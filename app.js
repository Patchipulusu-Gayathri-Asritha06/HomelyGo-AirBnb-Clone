/* HomelyGo website */
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");

const ExpressError = require("./utils/ExpressError.js");

const User = require("./models/user.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const users = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/HomelyGo";
const DB_URL = process.env.ATLASDB_URL2;
const port = 16711;

console.log(DB_URL);
main()
    .then(() => {
        console.log("Connected to Database successfully");
    })
    .catch((err) => {
        console.log("Some error in connecting to database ", err);
    });

async function main() {
    await mongoose.connect(DB_URL);
}

const store = MongoStore.create({
    mongoUrl: DB_URL,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
});

store.on("error", () => {
    console.log("Error in mongo session store", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({
    extended: true
}));
app.engine("ejs", ejsMate);


app.use(cookieParser());
app.use(flash());
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demoUser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "demo-student"
//     });

//     const registeredUser = await User.register(fakeUser, "secretpassword");
//     res.send(registeredUser);
// });

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", users);

app.get("/", (req, res) => {
    res.send("Hello, Welcome to HomelyGo");
});

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let {
        statusCode = 500, message = "Something went wrong"
    } = err;
    // console.log(err);
    res.status(statusCode).render("listings/error.ejs", {
        message
    });
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


/* Airbnb Old website : https://www.webdesignmuseum.org/gallery/airbnb-in-2024 */