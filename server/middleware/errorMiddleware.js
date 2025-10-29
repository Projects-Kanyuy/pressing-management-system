// backend/middleware/errorMiddleware.js

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // --- THIS IS THE FIX ---
    // Catch the specific MongoDB duplicate key error (code 11000)
    if (err.code === 11000) {
        // Get the field that caused the error (e.g., 'email', 'name')
        const field = Object.keys(err.keyValue)[0];
        
        // Make the field name more readable (e.g., 'email' -> 'Email')
        const readableField = field.charAt(0).toUpperCase() + field.slice(1);
        
        // Create a user-friendly and specific message
        message = `The ${readableField} '${err.keyValue[field]}' is already taken. Please choose another.`;
        statusCode = 400; // Bad Request
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        message = 'Resource not found';
        statusCode = 404;
    }
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
    }

    res.status(statusCode).json({
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export default { notFound, errorHandler };