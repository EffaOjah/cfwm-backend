const Event = require('../models/event.js');

const eventController = {
    getEvents: async (req, res) => {
        try {
            const events = await Event.getAll();
            res.status(200).json(events);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching events', error: error.message });
        }
    },

    getEvent: async (req, res) => {
        try {
            const event = await Event.getById(req.params.id);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.status(200).json(event);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching event', error: error.message });
        }
    },

    createEvent: async (req, res) => {
        try {
            const eventData = req.body;
            if (req.file) {
                eventData.image_url = req.file.path;
            }
            const id = await Event.create(eventData);
            res.status(201).json({ message: 'Event created successfully', id });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Title already exists. Please use a unique title.' });
            }
            res.status(500).json({ message: 'Error creating event', error: error.message });
        }
    },

    updateEvent: async (req, res) => {
        try {
            const eventData = req.body;
            if (req.file) {
                eventData.image_url = req.file.path;
            }
            await Event.update(req.params.id, eventData);
            res.status(200).json({ message: 'Event updated successfully' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Title already exists. Please use a unique title.' });
            }
            res.status(500).json({ message: 'Error updating event', error: error.message });
        }
    },

    deleteEvent: async (req, res) => {
        try {
            await Event.delete(req.params.id);
            res.status(200).json({ message: 'Event deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting event', error: error.message });
        }
    }
};

module.exports = eventController;
