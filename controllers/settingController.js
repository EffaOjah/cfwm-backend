const Setting = require('../models/settingModel');
const Joi = require('joi');

const podcastVideoSchema = Joi.object({
    url: Joi.string().uri().required().messages({
        'string.uri': 'Please provide a valid YouTube URL',
        'any.required': 'URL is required'
    })
});

const settingController = {
    /**
     * GET /api/settings/podcast-video
     * Public endpoint to retrieve the current podcast video URL
     */
    getPodcastVideo: async (req, res) => {
        try {
            const url = await Setting.getSetting('podcast_video_url');
            res.status(200).json({
                status: 'success',
                url: url || ""
            });
        } catch (error) {
            console.error('Error fetching podcast video URL:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    },

    /**
     * POST /api/settings/podcast-video
     * Protected endpoint to update the podcast video URL
     */
    updatePodcastVideo: async (req, res) => {
        try {
            // Validate input
            const { error, value } = podcastVideoSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    status: 'error',
                    message: error.details[0].message
                });
            }

            const { url } = value;
            await Setting.upsertSetting('podcast_video_url', url);

            res.status(200).json({
                status: 'success',
                message: 'Podcast video URL updated successfully'
            });
        } catch (error) {
            console.error('Error updating podcast video URL:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
};

module.exports = settingController;
