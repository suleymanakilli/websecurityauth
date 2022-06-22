
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const User = require('./usermodel');
const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');
const Email = require('./utils/email');
const axios = require('axios');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    console.log("req body name : ", req.body.name)
    const emailCode = crypto.randomBytes(3).toString('hex').toUpperCase()
    const newUser = await User.create({
        name: req.body.name,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        code: emailCode
    });

    await new Email(newUser).sendWelcome(newUser.code);

    res.status(200).json({
        status: 'success',
        message: "Kaydınızın tamamlanması için mailinize gelen kodu giriniz"
    });

    //createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if user exists && password is correct
    let user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }
    const loginCode = crypto.randomBytes(3).toString('hex').toUpperCase() //Login Code
    const now = new Date()
    const sendDateMilliseconds = now.getTime()
    const expireDateMilliseconds = now.getTime() + 60 * 1000 //After 1 minutes

    user = await User.findByIdAndUpdate(user._id, { sendDateMilliseconds, expireDateMilliseconds, loginCode })
    await new Email(user).sendLoginCode(loginCode);
    res.status(200).json({
        status: 'success',
        message: "Emailinize gelen kodu giriniz",
        data: {
            user
        }
    });

    // 3) If everything ok, send token to client
    //createSendToken(user, 200, req, res);
});

exports.confirmLogin = catchAsync(async (req, res, next) => {
    const email = req.body.email
    const loginCode = req.body.loginCode
    const now = new Date()
    let user = await User.findOne({ email });
    console.log("user : ", user);
    console.log("email : ", email);
    if (now.getTime() > user.expireDateMilliseconds) {
        return res.status(401).json({
            status: "error",
            message: "Kod kullanma zamanı geçti"
        })
    }
    if (user.loginCode !== loginCode) {
        return res.status(401).json({
            status: "error",
            message: "Kod yanlış"
        })
    }
    createSendToken(user, 200, req, res);
})

exports.confirmEmailCode = catchAsync(async (req, res, next) => {
    const email = req.body.email
    const emailCode = req.body.code
    let user = await User.findOne({ email })
    if (user.code === emailCode) {
        user = await User.findByIdAndUpdate(user._id, { active: true })
        createSendToken(user, 200, req, res);
    }
    else {
        res.status(401).json({
            status: 'error',
            message: "Kod yanlış",
            data: {
                user
            }
        });
    }
});

exports.deneme = catchAsync(async (req, res, next) => {
    const now = new Date()
    const sendDateMilliseconds = now.getTime()
    const expireDateMilliseconds = now.getTime() + 60 * 1000 //After 1 minutes
    res.status(200).json({
        status: "success",
        sendDate: new Date(sendDateMilliseconds),
        expireDate: new Date(expireDateMilliseconds),
        sendDateMilliseconds,
        expireDateMilliseconds


    })
})

exports.verifyCaptcha = catchAsync(async (req, res, next) => {
    const secret = req.body.secret;
    const token = req.body.token;
    axios.post(`https://www.google.com/recaptcha/api/siteverify?response=${token}&secret=${secret}`)
        .then(data => {
            console.log(data.data)
            if (data.data.success) {
                return res.status(200).json({
                    success: true,
                    status: "success",
                    message: "Valid captcha token"
                })
            }
            return res.status(200).json({
                success: false,
                status: "success",
                message: "Invalid captcha token"
            })
        })
})

