const Joi = require('joi');

exports.createUser = Joi.object({  
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).max(12).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,12}$')),
});

exports.updateUser = Joi.object({
    fullName: Joi.string().optional(),
    password: Joi.string().optional().min(6).max(12).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,12}$')),
    email: Joi.string().email().optional(),
});
