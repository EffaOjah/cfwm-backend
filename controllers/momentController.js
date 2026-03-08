const Moment = require('../models/moment.js');
const { cloudinary } = require('../services/cloudinary');

const streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'cfwm', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        stream.end(buffer);
    });
};

const momentController = {
    /**
     * GET /api/moments - Public
     * Returns the gallery (up to 6 items, newest first).
     */
    getMoments: async (req, res) => {
        try {
            const moments = await Moment.getAll();

            console.log("moments", moments);
            res.status(200).json(moments);
        } catch (error) {
            console.error('Error fetching moments:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    },

    /**
     * POST /api/moments - Admin only
     * Accepts multiple image files. Replaces the entire gallery with the new batch.
     *
     * Body (multipart/form-data):
     *   images      – one or more image files (field name: "images")
     *   type[]      – parallel array of platform types ('facebook' | 'instagram')
     *   link[]      – parallel array of post links (optional)
     */
    replaceMoments: async (req, res) => {
        try {
            const files = req.files;

            console.log("files", files);

            if (!files || files.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'At least one image is required.'
                });
            }

            // Normalise type / link to arrays
            let types = req.body['type[]'] || req.body.type || [];
            let links = req.body['link[]'] || req.body.link || [];

            if (!Array.isArray(types)) types = [types];
            if (!Array.isArray(links)) links = [links];

            // Type validation removed per request - defaulting to facebook


            // Upload files directly from memory buffers to Cloudinary
            const records = [];
            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                try {
                    const result = await streamUpload(f.buffer);
                    records.push({
                        image_url: result.secure_url,
                        type: types[i] || 'facebook', // Default to facebook if not provided
                        link: links[i] || null
                    });
                } catch (uploadErr) {
                    console.error('Cloudinary upload error:', uploadErr);
                    return res.status(500).json({ status: 'error', message: 'Error uploading to Cloudinary' });
                }
            }

            // Replace gallery; get back old image URLs for cleanup
            const oldPaths = await Moment.replaceAll(records);

            // Try to delete old image files from Cloudinary
            for (const oldUrl of oldPaths) {
                try {
                    // In Cloudinary, public_id formatting is complicated, but usually follows /cfwm/name.ext 
                    // Let's attempt to extract the public_id from the URL string.
                    // Example: https://res.cloudinary.com/.../upload/v12345/cfwm/filename.jpg
                    const match = oldUrl.match(/\/v\d+\/(.+)\.[a-z]+$/i);
                    if (match && match[1]) {
                        await cloudinary.uploader.destroy(match[1]);
                    }
                } catch (unlinkErr) {
                    console.warn('Could not delete old file from Cloudinary:', unlinkErr.message);
                }
            }

            // Return the new gallery
            const updated = await Moment.getAll();
            res.status(200).json({
                message: 'Gallery replaced successfully.',
                moments: updated
            });
        } catch (error) {
            console.error('Error replacing moments:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    },

    /**
     * DELETE /api/moments/:id - Admin only
     * Deletes a single moment and its associated Cloudinary image.
     */
    deleteMoment: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedImageUrl = await Moment.deleteById(id);

            if (!deletedImageUrl) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Moment not found'
                });
            }

            // Try to delete the old image file from Cloudinary mapping
            try {
                const match = deletedImageUrl.match(/\/v\d+\/(.+)\.[a-z]+$/i);
                if (match && match[1]) {
                    await cloudinary.uploader.destroy(match[1]);
                }
            } catch (unlinkErr) {
                console.warn('Could not delete file from Cloudinary:', unlinkErr.message);
            }

            res.status(200).json({
                message: 'Moment deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting moment:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    }
};

module.exports = momentController;
