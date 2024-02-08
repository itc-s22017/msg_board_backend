const router = require("express").Router();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
// const {check, validationResult} = require("express-validator");
const bcrypt = require("bcrypt");

const SALT = 10;

const loginCheck = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({message: "unauthenticated"})
        return;
    }
    next();
};

router.get("/", loginCheck, (req, res, next) => {
    // const b = req.session.passport
    console.log(req.user)
    return res.status(200).json({message: "logged in",u:req.user })
})

router.post("/signup", async (req, res, next) => {
    const {name, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, SALT)

    try {
        await prisma.user.create({
            data: {
                name,
                password: hashedPassword,
            }
        })
        return res.status(200).json({message: "Created"})
    } catch (error) {
        next(error)
        return res.status(401).json({message: error})
    }
})

router.post('/login', passport.authenticate('local', {keepSessionInfo: true}), (req, res, next) => {
    passport.authenticate('local', { keepSessionInfo: true,failWithError:true }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: "name and/or password is invalid" });
        }
        req.logIn(user, { keepSessionInfo: true }, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }
            req.session.user = user;
            return res.json({ message: 'OK', user: user });
        });
    })(req, res, next);
});

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        // req.session.user = null
        return res.status(200).json({message: "logout"});
    });
});

module.exports = router;
