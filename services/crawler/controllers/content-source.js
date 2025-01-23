const contentSourceRepoisotry = require('../repositories/content-source');

exports.create = async (req, res) => {
    try {
        const {
            name,
            url,
            establishedYear
        } = req.body;

        const result = await contentSourceRepoisotry.create({
            name, url, establishedYear
        });

        return res.status(200).send({
            success: true,
            result,
        });
    } catch (error) {
        console.error('Error creating new content source:', error.stack);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }
}
exports.getAll = async (req, res) => {
    try {
        const { limit = 10, page = 1, name } = req.query;
        const result = await contentSourceRepoisotry.list({
            limit,
            page,
            name
        });
        return res.status(200).send({
            success: true,
            result,
        });
    } catch (error) {
        console.error('Error fetching content sources:', error.stack);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await contentSourceRepoisotry.getById(id);
        if (!result) {
            return res.status(404).send({
                success: false,
                message: 'Content source not found'
            });
        }
        return res.status(200).send({
            success: true,
            result,
        });
    } catch (error) {
        console.error('Error fetching content source:', error.stack);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { body: {
            name,
            url,
            establishedYear
        } } = req;

        const result = await contentSourceRepoisotry.update(id, {
            name, url, establishedYear
        });

        if (!result) {
            return res.status(404).send({
                success: false,
                message: 'Content source not found'
            });
        }

        return res.status(200).send({
            success: true,
            result,
        });
    } catch (error) {
        console.error('Error updating content source:', error.stack);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await contentSourceRepoisotry.delete(id);
        if (!result) {
            return res.status(404).send({
                success: false,
                message: 'Content source not found'
            });
        }
        return res.status(200).send({
            success: true,
            message: 'Content source deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting content source:', error.stack);
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

