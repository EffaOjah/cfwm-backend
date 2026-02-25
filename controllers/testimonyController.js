const Testimony = require('../models/testimony.js');

const testimonyController = {
    getApprovedTestimonies: async (req, res) => {
        try {
            const testimonies = await Testimony.getAllApproved();
            res.status(200).json(testimonies);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching testimonies', error: error.message });
        }
    },

    getAllTestimonies: async (req, res) => {
        try {
            const testimonies = await Testimony.getAll();
            res.status(200).json(testimonies);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching all testimonies', error: error.message });
        }
    },

    getTestimony: async (req, res) => {
        try {
            const testimony = await Testimony.getById(req.params.id);
            if (!testimony) {
                return res.status(404).json({ message: 'Testimony not found' });
            }
            res.status(200).json(testimony);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching testimony', error: error.message });
        }
    },

    submitTestimony: async (req, res) => {
        try {
            const id = await Testimony.create(req.body);
            res.status(201).json({ message: 'Testimony submitted successfully and is pending approval', id });
        } catch (error) {
            res.status(500).json({ message: 'Error submitting testimony', error: error.message });
        }
    },

    updateTestimony: async (req, res) => {
        try {
            await Testimony.update(req.params.id, req.body);
            res.status(200).json({ message: 'Testimony updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating testimony', error: error.message });
        }
    },

    deleteTestimony: async (req, res) => {
        try {
            await Testimony.delete(req.params.id);
            res.status(200).json({ message: 'Testimony deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting testimony', error: error.message });
        }
    }
};

module.exports = testimonyController;
