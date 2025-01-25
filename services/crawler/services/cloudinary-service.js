const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({ 
    cloud_name:  process.env.CLOUDINARY_APP_ID, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadFile = async (path) => {
    try {
       const fileUploadResponse =  await cloudinary.uploader.upload(path);
       return fileUploadResponse.url;
    } catch (error) {
        console.error('An Error Occured while uploading a file:', error);
        throw error;
    }
}


exports.deleteTempPath = (path) => {
   fs.unlinkSync(path);
}