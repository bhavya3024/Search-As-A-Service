const apiConfigurationsRepository = require('../repositories/api-configurations');
const contentSourceRepository = require('../repositories/content-source');

exports.create = async (req, res) => {
    try {
        const { name, endpoint, method, headers, body, contentSourceId, apiConfigType, queryParams } = req.body;
        const newApiConfiguration = { name, endpoint, method, headers, body, contentSourceId, apiConfigType, queryParams };
        const contentSource = await contentSourceRepository.getById(contentSourceId);
        if (!contentSource) {
            return res.status(404).json({
                success: false,
                message: 'Content Source Not Found',
            });
        }


        const result = await apiConfigurationsRepository.createApiConfiguration(newApiConfiguration);

        return res.status(200).send({
            success: true,
            result,
        });
    } catch (error) {
        console.error('Error creating new API configuration:', error.stack);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        const { limit = 10, page = 1, name } = req.query;
        const result = await apiConfigurationsRepository.list({
            limit,
            page,
            name
        });
        return res.status(200).send({
            success: true,
            result,
        });
    } catch (error) {
        console.error('Error fetching API configurations:', error.stack);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await apiConfigurationsRepository.getApiConfigurationById(id);
        if (!result) {
            return res.status(404).send({
                success: false,
                message: 'API configuration not found'
            });
        }
        return res.status(200).send({
            success: true,
            result,
        });
    } catch (error) {
        console.error('Error fetching API configuration:', error.stack);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, endpoint, method, headers, body, contentSourceId } = req.body;

        if (contentSourceId) {
            const contentSource = await contentSourceRepository.getById(contentSourceId);
            if (!contentSource) {
                return res.status(404).json({
                    success: false,
                    message: 'Content Source Not Found',
                });
            }
        }

        const result = await apiConfigurationsRepository.updateApiConfiguration(id, {
            name, endpoint, method, headers, body
        });

        if (!result) {
            return res.status(404).send({
                success: false,
                message: 'API configuration not found'
            });
        }

        return res.status(200).send({
            success: true,
            result,
        });
    } catch (error) {
        console.error('Error updating API configuration:', error.stack);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await apiConfigurationsRepository.deleteApiConfiguration(id);
        if (!result) {
            return res.status(404).send({
                success: false,
                message: 'API configuration not found'
            });
        }
        return res.status(200).send({
            success: true,
            message: 'API configuration deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting API configuration:', error.stack);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }
};
