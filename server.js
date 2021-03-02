const express = require('express');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 5000;
const morgan = require('morgan');
const bootcamps = require('./routes/bootcamps');

dotenv.config({ path: './config/config.env' });

if (process.env.NODE_ENV === 'development') {   // DEV-ONLY
    app.use(morgan('dev'));
}

app.use('/api/v1/bootcamps', bootcamps);

app.listen(
    PORT, 
    console.log(
        `Server running in ${ process.env.NODE_ENV } mode on port ${ PORT }`
    )
);