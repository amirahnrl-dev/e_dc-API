const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

mongoose.connect(
    process.env.MONGO_URI, 
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }
);

const bootcamps = JSON.parse(
    fs.readFileSync(
        `${ __dirname }/_data/bootcamps.json`, 
        'utf-8'
    )
);

const courses = JSON.parse(
    fs.readFileSync(
        `${ __dirname }/_data/courses.json`, 
        'utf-8'
    )
);

// into DB
const importData = async() => {
    try {
        await Bootcamp.create(bootcamps);
        //await Course.create(courses);
        console.log('Data Imported...'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}

// from DB
const deleteData = async() => {
    try {
        await Bootcamp.deleteMany();    // no arg == delete all
        await Course.deleteMany();
        console.log('Data Destroyed...'.red.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}

// node seeder -i || node seeder -d
if(process.argv[2] === '-i') {
    importData();
} else if(process.argv[2] === '-d') {
    deleteData();
}