const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const shopifyRoutes = require('./routes/shopify');
const tagRoutes = require('./routes/tag');

//app
const app = express();
app.use(compression())
app.use(helmet())

//db
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false }).then(() => console.log('Database Connected.'));

//middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());

//cors
if (process.env.NODE_ENV == 'development') {
    app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

app.use('/api',blogRoutes);
app.use('/api',authRoutes);
app.use('/api',userRoutes);
app.use('/api',categoryRoutes);
app.use('/api',shopifyRoutes);
app.use('/api',tagRoutes);

//port
const port = process.env.PORT || 8000
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});

