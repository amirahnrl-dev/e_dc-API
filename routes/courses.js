const express = require('express');
const router = express.Router({ mergeParams: true });   // rerouting from bootcamps route
const {
    getCourses
} = require('../controllers/courses');

router.route('/').get(getCourses);

module.exports = router;