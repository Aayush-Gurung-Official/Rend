const ApiError = require('../utils/ApiError');

// Very lightweight placeholder – in a real app you would plug in Joi/Zod/Yup schemas per key.
const validateRequest = (schemaKey) => {
  // eslint-disable-next-line no-unused-vars
  return (req, _res, next) => {
    // For now, pass through without validation to keep the scaffold simple.
    // You can attach validation logic based on schemaKey later.
    if (!schemaKey) {
      return next();
    }

    // Example place to hook in validation:
    // const { error } = schemas[schemaKey].validate(req.body);
    // if (error) throw new ApiError(400, 'Validation failed', error.details);

    next();
  };
};

module.exports = validateRequest;

