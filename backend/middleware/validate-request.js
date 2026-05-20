function validateRequest(req, next, schema) {
    const options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
    };

    const { error, value } = schema.validate(req.body, options);

    if (error) {
        const message = error.details.map(d => d.message).join(', ');
        return next(new Error(message));
    }

    req.body = value;
    next();
}

module.exports = validateRequest;
