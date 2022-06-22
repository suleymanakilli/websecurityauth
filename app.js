
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
var bodyParser = require('body-parser')

const globalErrorHandler = require('./errorController');

const AppError = require('./utils/appError');
const userRouter = require('./userRoutes');

// Start express app
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.enable('trust proxy');

app.set('view engine', 'pug');
//app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());


// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,//1hours
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// 3) ROUTES
app.get('/', (req, res) => {
    res.send("hello express app")
})
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
