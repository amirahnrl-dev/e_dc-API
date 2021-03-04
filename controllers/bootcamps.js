const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc        Get all bootcamps
// @method      GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
        //console.log(req.query);

        let queryStr = JSON.stringify(req.query);   // JSON to string
        queryStr = queryStr.replace(
            /\b{gt|gte|lt|lte|in}\b/g, 
            match => `$${ match }`
        );
        console.log(queryStr);

        const query = Bootcamp.find(JSON.parse(queryStr)); // string to JSON

        /*
            ?averageCost[lte]=10000
            ?careers=Business  (careers[in] didnt work)
        */

        const bootcamps = await query;

        res.status(200).json(
            {
                success: true,
                count: bootcamps.length,
                data: bootcamps
            }
        );
    }
);

// @desc        Get single bootcamp
// @method      GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp) {
            return next(
                new ErrorResponse(
                    `Bootcamp not found with id of ${ req.params.id }`, 
                    404
                )
            );
        }

        res.status(200).json(
            {
                success: true,
                data: bootcamp
            }
        );
    }
);

// @desc        Create new bootcamp
// @method      POST /api/v1/bootcamps
// @access      Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.create(req.body);
        
        res.status(201).json(
            {
                success: true,
                data: bootcamp
            }
        );
    }
);

// @desc        Update bootcamp
// @method      PUT /api/v1/bootcamps/:id
// @access      Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            {
                new: true,
                runValidators: true
            }
        );
    
        if(!bootcamp) {
            return next(
                new ErrorResponse(
                    `Bootcamp not found with id of ${ req.params.id }`, 
                    404
                )
            );
        }
    
        res.status(200).json(
            {
                success: true,
                data: bootcamp
            }
        );
    }
);

// @desc        Delete bootcamp
// @method      DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    
        if(!bootcamp) {
            return next(
                new ErrorResponse(
                    `Bootcamp not found with id of ${ req.params.id }`, 
                    404
                )
            );
        }
    
        res.status(200).json(
            {
                success: true,
                data: {}
            }
        );
    }
);

// @desc        Get bootcamps within a radius
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
        const { zipcode, distance } = req.params;

        const loc = await geocoder.geocode(zipcode);
        const lat = loc[0].latitude;
        const lon = loc[0].longitude;

        // calculate radius using radians
        // divide distance by radius of Earth (3,963 mi || 6,378 km)
        const radius = distance / 3963;

        const bootcamps = await Bootcamp.find(
            {
                location: {
                    $geoWithin: {
                        $centerSphere: [[ lon , lat ], radius]
                    }
                }
            }
        );

        res.status(200).json(
            {
                success: true,
                count: bootcamps.length,
                data: bootcamps
            }
        );
    }
);