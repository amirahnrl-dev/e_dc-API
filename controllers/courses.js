const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc        Get all courses
// @method      GET /api/v1/courses
// @route       GET /api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {
        let query;

        if(req.params.bootcampId) {
            query = Course.find({ bootcamp: req.params.bootcampId });
        } else {
            query = Course.find().populate(
                {
                    path: 'bootcamp',
                    select: 'name description'
                }
            );
        }

        const courses = await query;

        res.status(200).json(
            {
                success: true,
                count: courses.length,
                data: courses
            }
        );
    }
);

// @desc        Get single course
// @method      GET /api/v1/courses/:id
// @access      Public
exports.getCourse = asyncHandler(async (req, res, next) => {
        const course = await Course.findById(req.params.id).populate(
            {
                path: 'bootcamp',
                select: 'name description'
            }
        );

        if(!course) {
            return next(
                new ErrorResponse(`No course with the id of ${ req.params.id }`), 
                404
            );
        }

        res.status(200).json(
            {
                success: true,
                data: course
            }
        );
    }
);

// @desc        Create new course
// @route       POST /api/v1/bootcamps/:bootcampId/courses
// @access      Private
exports.createCourse = asyncHandler(async (req, res, next) => {
        // show bootcamp id in the body
        req.body.bootcamp = req.params.bootcampId;

        const bootcamp = await Bootcamp.findById(req.params.bootcampId).populate(
            {
                path: 'bootcamp',
                select: 'name description'
            }
        );

        if(!bootcamp) {
            return next(
                new ErrorResponse(`No bootcamp with the id of ${ req.params.bootcampId }`),
                404
            );
        }

        const course = await Course.create(req.body);

        res.status(200).json(
            {
                success: true,
                data: course
            }
        );
    }
);

// @desc        Update course
// @method      PUT /api/v1/courses/:id
// @access      Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if(!course) {
            return next(
                new ErrorResponse(`No course with the id of ${ req.params.id }`),
                404
            );
        }

        res.status(200).json(
            {
                success: true,
                data: course
            }
        );
    }
);

// @desc        Delete course
// @method      DELETE /api/v1/courses/:id
// @access      Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
        const course = await Course.findByIdAndRemove(req.params.id);

        if(!course) {
            return next(
                new ErrorResponse(`No course with the id of ${ req.params.id }`),
                404
            );
        }

        await course.remove();

        res.status(200).json(
            {
                success: true,
                data: {}
            }
        );
    }
);