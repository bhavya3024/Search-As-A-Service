const mongoose = require('mongoose');

const mongooseConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

module.exports = mongooseConnection;