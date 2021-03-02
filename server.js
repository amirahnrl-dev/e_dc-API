const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');
const bootcamps = require('./routes/bootcamps');

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config({ path: './config/config.env' });

connectDB();

if (process.env.NODE_ENV === 'development') {   // DEV-ONLY
    app.use(morgan('dev'));
}

app.use('/api/v1/bootcamps', bootcamps);

const server = app.listen(
    PORT, 
    console.log(
        `Server running in ${ process.env.NODE_ENV } mode on port ${ PORT }`
        .yellow
        .bold
    )
);

/* HANDLE UNHANDLED PROMISE REJECTION */
process.on('unhandledRejection', (err, promise) => {
        console.log(`Error: ${ err.message }`.red);

        // close server & exit process
        server.close(() => process.exit(1));
    }
);