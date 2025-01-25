const mongoose = require('mongoose');
const { METHODS } = require('http');

const apiConfigSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // A name or identifier for the API configuration
    },
    contentSourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContentSource', // Reference to the User model
        required: true,
    }, 
    description: {
        type: String,
    },
    endpoint: {
        type: String,
        required: true, // The base endpoint (e.g., "/users/:id")
    },
    method: {
        type: String,
        enum: METHODS, // HTTP methods (GET, POST, PUT, DELETE, etc.)
        required: true,
    },
    pathParams: [
        {
            key: { type: String, required: true }, // Path parameter name (e.g., "id")
            description: { type: String },        // Optional description
            required: { type: Boolean, default: true }, // Whether the parameter is required
        },
    ],
    queryParams: [
        {
            key: { type: String, required: true }, // Query parameter name (e.g., "page")
            value: { type: mongoose.SchemaTypes.Mixed }, // Default or sample value
            required: { type: Boolean, default: false }, // Whether the parameter is required
            isSecure: { type: Boolean, default: false }, // Whether it contains sensitive data
            isPaginated: { type: Boolean, default: false }, // For pagination parameters
        },
    ],
    headers: [
        {
            key: { type: String, required: true }, // Header name (e.g., "Authorization")
            value: { type: mongoose.SchemaTypes.Mixed }, // Default or sample value
            required: { type: Boolean, default: false }, // Whether the header is required
        },
    ],
    requestBody: {
        type: mongoose.Schema.Types.Mixed, // Flexible structure for request body (can be JSON, object, string, etc.)
    },
    apiConfigType: {
        type: String,
        enum: ['AUTHORIZE', 'CRAWL'],
        required: true, 
    }
}, {
    timestamps: true,
});

// Create the model
const ApiConfig = mongoose.model('ApiConfiguration', apiConfigSchema);
module.exports = ApiConfig;