const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res, next) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try {
        let {
            username,
            email,
            password
        } = req.body;
        const newUser = new User({
            username,
            email
        });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", `Welcome to HomelyGo, ${username}! We're glad to have you here.`);
            res.redirect("/listings");
        });
    } catch (err) {
        req.flash("error", err.message || "Something went wrong!");
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", `Dear ${req.body.username}, Welcome back to HomelyGo!`);
    let redirectUrl = res.locals.redirectUrl || "/listings";
    console.log(redirectUrl);
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have successfully logged out!");
        res.redirect("/listings");
    });
}