const FirstTimer = require('../models/firstTimer.js');
const PrayerRequest = require('../models/prayerRequest.js');

const formController = {
    // First Timers
    submitFirstTimer: async (req, res) => {
        try {
            const id = await FirstTimer.create(req.body);
            res.status(201).json({ message: 'First Timer details submitted successfully', id });
        } catch (error) {
            res.status(500).json({ message: 'Error submitting First Timer details', error: error.message });
        }
    },

    getFirstTimers: async (req, res) => {
        try {
            const firstTimers = await FirstTimer.getAll();
            res.status(200).json(firstTimers);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching First Timers', error: error.message });
        }
    },

    deleteFirstTimer: async (req, res) => {
        try {
            await FirstTimer.delete(req.params.id);
            res.status(200).json({ message: 'First Timer record deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting First Timer record', error: error.message });
        }
    },

    toggleFirstTimerStatus: async (req, res) => {
        try {
            const { status } = req.body;
            await FirstTimer.toggleStatus(req.params.id, status);
            res.status(200).json({ message: 'Status updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating status', error: error.message });
        }
    },

    // Prayer Requests
    submitPrayerRequest: async (req, res) => {
        try {
            const id = await PrayerRequest.create(req.body);
            res.status(201).json({ message: 'Prayer request submitted successfully', id });
        } catch (error) {
            res.status(500).json({ message: 'Error submitting prayer request', error: error.message });
        }
    },

    getPrayerRequests: async (req, res) => {
        try {
            const prayerRequests = await PrayerRequest.getAll();
            res.status(200).json(prayerRequests);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching prayer requests', error: error.message });
        }
    },

    deletePrayerRequest: async (req, res) => {
        try {
            await PrayerRequest.delete(req.params.id);
            res.status(200).json({ message: 'Prayer request deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting prayer request', error: error.message });
        }
    },

    togglePrayerRequestStatus: async (req, res) => {
        try {
            const { status } = req.body;
            await PrayerRequest.toggleStatus(req.params.id, status);
            res.status(200).json({ message: 'Status updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating status', error: error.message });
        }
    }
};

module.exports = formController;
