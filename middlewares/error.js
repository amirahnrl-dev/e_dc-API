const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    console.log(err);

    let error = { ...err }
    error.message = err.message;

    /* MONGOOSE bad ObjectId */
    if(err.name === 'CastError') {
        const message = `Bootcamp not found with id of ${ err.value }.`;
        error = new ErrorResponse(message, 404);
    }

    /* MONGOOSE duplicate key */
    if(error.code === 11000) {
        const message = 'Duplicated field value entered.';
        error = new ErrorResponse(message, 400);
    }

    /* MONGOOSE validation error */
    if(err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(
            value => value.message
        );
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json(
        {
            success: false,
            error: error.message || "Server Error"
        }
    );
}

module.exports = errorHandler;