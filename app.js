require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');



const app = express();
const port = process.env.PORT;
const urlmongoDB = process.env.DATABASE_URL;
const secretKey = process.env.SECRET_KEY;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));


mongoose.connect(urlmongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
    });

global.loggedIn = null;

app.use("*", (req, res, next) => {
    loggedIn = req.session.UserId;
    next();
})

app.use('/auth',authRoutes)
app.use('/blog',blogRoutes)

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
