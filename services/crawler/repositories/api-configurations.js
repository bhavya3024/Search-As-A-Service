const ApiConfigurations = require('../models/api-configurations');

exports.createApiConfiguration = async function(data) {
    try {
        const apiConfiguration = new ApiConfigurations(data);
        await apiConfiguration.save();
        return apiConfiguration;
    } catch (error) {
        throw error;
    }
};

// Read an API configuration by ID
exports.getApiConfigurationById = async function(id) {
    try {
        const apiConfiguration = await ApiConfigurations.findById(id);
        if (!apiConfiguration) {
            throw new Error('API Configuration not found');
        }
        return apiConfiguration;
    } catch (error) {
        throw error;
    }
};

// Update an API configuration by ID
exports.updateApiConfiguration = async function(id, data) {
    try {
        const apiConfiguration = await ApiConfigurations.findByIdAndUpdate(id, data, { new: true });
        if (!apiConfiguration) {
            throw new Error('API Configuration not found');
        }
        return apiConfiguration;
    } catch (error) {
        throw error;
    }
};

// Delete an API configuration by ID
exports.deleteApiConfiguration = async function(id) {
    try {
        const apiConfiguration = await ApiConfigurations.findByIdAndDelete(id);
        if (!apiConfiguration) {
            throw new Error('API Configuration not found');
        }
        return apiConfiguration;
    } catch (error) {
        throw error;
    }
};
