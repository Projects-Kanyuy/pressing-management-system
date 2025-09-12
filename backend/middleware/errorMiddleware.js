// server/middleware/errorMiddleware.js

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
    
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        message = 'Resource not found';
        statusCode = 404;
    }

    if (err.isAxiosError) {
        message = 'Could not connect to an external service.';
        statusCode = 503;
    }

    res.status(statusCode).json({
        message: message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
};

// --- THIS IS THE FIX ---
// Export each function as a named export instead of a default object
export { notFound, errorHandler };