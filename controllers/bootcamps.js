const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc        Get all bootcamps
// @method      GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
        const reqQuery = { ...req.query };    

        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);   // JSON to string
        queryStr = queryStr.replace(
            /\b{gt|gte|lt|lte|in}\b/g, 
            match => `$${ match }`
        );

        let query = Bootcamp.find(JSON.parse(queryStr)); // string to JSON

        if(req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        if(req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            //default sort
            query = query.sort('-createdAt');     // - descending
        }

        /* PAGINATION */
        const page = parseInt(req.query.page, 10) || 1;     // by default first page is 1
        const limit = parseInt(req.query.limit, 10) || 1;   // by default 1 per page
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Bootcamp.countDocuments();      // total docs

        query = query.skip(startIndex).limit(limit);

        const bootcamps = await query;

        /* PAGINATION RESULT - FrontEnd Use */
        /*
            if last page -> no next link
            if first page -> no prev link
        */
        const pagination = {};
        if(endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if(startIndex > 0) {
            pagination.prev = {
                page: page -1,
                limit
            }
        }

        /*
            ?averageCost[lte]=10000
            ?careers=Business  (careers[in] didnt work)
            ?select=name,description
            ?select=name,location.city,housing&housing=true

            check sorting:
            ?select=name,createAt                // default sorting
            ?select=name,createAt&sort=name
            ?select=name,createAt&sort=-name

            ?limit=2&select=name
            ?page=2&limit=2&select=name          // 2 objects on the 2nd page

            test pagination result:
            ?page=2&select=name
            ?select=name
            ?page=4&select=name
            ?page=2&limit=2&select=name
            ?page=1&limit=2&select=name
            ?limit=3&select=name
            ?limit=4&select=name                // total object is 4, no next & prev
        */

        res.status(200).json(
            {
                success: true,
                count: bootcamps.length,
                pagination: pagination,         // or just pagination (same name)
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