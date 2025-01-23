const mongoose = require('mongoose');

module.exports = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (e) {
       console.error('Database Connection Failed -->>', e);
    }
}