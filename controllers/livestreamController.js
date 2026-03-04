const Livestream = require('../models/livestream');
const Joi = require('joi');

const livestreamSchema = Joi.object({
    next: Joi.object({
        title: Joi.string().required(),
        scheduled_at: Joi.date().iso().allow(null, ""),
        video_url: Joi.string().uri().allow(null, ""),
        is_live: Joi.boolean()
    }).optional(),
    previous: Joi.object({
        title: Joi.string().allow(null, ""),
        video_url: Joi.string().uri().allow(null, ""),
        date: Joi.date().iso().allow(null, "")
    }).optional()
});

const livestreamController = {
    getStatus: async (req, res) => {
        try {
            const settings = await Livestream.getSettings();

            if (!settings) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Livestream settings not found'
                });
            }

            res.status(200).json({
                next: {
                    title: settings.next_title,
                    scheduled_at: settings.next_scheduled_at,
                    video_url: settings.next_video_url || "",
                    is_live: !!settings.is_live
                },
                previous: {
                    title: settings.prev_title || "",
                    video_url: settings.prev_video_url || "",
                    date: settings.prev_date ? settings.prev_date.toISOString().split('T')[0] : ""
                }
            });
        } catch (error) {
            console.error('Error fetching livestream status:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    },

    updateSettings: async (req, res) => {
        try {
            // 1. Validate Input
            const { error, value } = livestreamSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    status: 'error',
                    message: error.details[0].message
                });
            }

            // 2. Fetch Existing Settings for Merging
            const currentSettings = await Livestream.getSettings();

            const { next, previous } = value;

            const updateData = {
                next_title: (next && next.title) ? next.title : currentSettings.next_title,
                next_scheduled_at: (next && next.scheduled_at !== undefined) ? (next.scheduled_at || null) : currentSettings.next_scheduled_at,
                next_video_url: (next && next.video_url !== undefined) ? (next.video_url || null) : currentSettings.next_video_url,
                is_live: (next && next.is_live !== undefined) ? next.is_live : currentSettings.is_live,

                prev_title: (previous && previous.title !== undefined) ? previous.title : currentSettings.prev_title,
                prev_video_url: (previous && previous.video_url !== undefined) ? previous.video_url : currentSettings.prev_video_url,
                prev_date: (previous && previous.date !== undefined) ? (previous.date || null) : currentSettings.prev_date
            };

            await Livestream.updateSettings(updateData);

            res.status(200).json({
                success: true,
                message: 'Livestream settings updated'
            });
        } catch (error) {
            console.error('Error updating livestream settings:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    }
};

module.exports = livestreamController;
