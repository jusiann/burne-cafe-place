class API_ERROR extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode || 400;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message = 'Bad request') {
        return new API_ERROR(message, 400);
    }

    static unauthorized(message = 'Unauthorized') {
        return new API_ERROR(message, 401);
    }

    static forbidden(message = 'Forbidden') {
        return new API_ERROR(message, 403);
    }

    static notFound(message = 'Resource not found') {
        return new API_ERROR(message, 404);
    }

    static conflict(message = 'Conflict') {
        return new API_ERROR(message, 409);
    }

    static internal(message = 'Internal server error') {
        return new API_ERROR(message, 500);
    }
}

export default API_ERROR;