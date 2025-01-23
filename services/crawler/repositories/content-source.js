const { default: mongoose } = require('mongoose');
const contentSourceSchema = require('../models/content-sources');

exports.create = async ({ name, homepage, establishedYear }) => {
    const newContentSource = await contentSourceSchema.create({
        name,
        homepage,
        establishedYear,
    });
    return newContentSource;
};

exports.list = async ({ limit, page, name }) => {
    const getContentSources = await contentSourceSchema.aggregate([{
        $match: {
            name: name,
        }
    }, {
        $skip: (page - 1) * limit,
    }, {
        $limit: limit,
    }]);
    return getContentSources;
};

exports.update = async (id, { name, establishedYear, url }) => {
    const updates = {};
    if (name) {
        updates.name = name;
    }
    if (establishedYear) {
        updates.establishedYear = establishedYear;
    }
    if (url) {
        updates.url = url;
    }
    await contentSourceSchema.updateOne({
        _id: new mongoose.Types.ObjectId(id),
    }, {
        ...updates
    });
};

exports.getById = async (id) => {
    const contentSource = await contentSourceSchema.findById(new mongoose.Types.ObjectId(id));
    return contentSource;
};

exports.deleteById = async (id) => {
    await contentSourceSchema.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
};
