const Sermon = require('../models/sermon.js');

const sermonController = {
    getSermons: async (req, res) => {
        try {
            const { type, search } = req.query;
            const sermons = await Sermon.getAll(type, search);
            res.status(200).json(sermons);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching sermons', error: error.message });
        }
    },

    getSermon: async (req, res) => {
        try {
            const sermon = await Sermon.getById(req.params.id);
            if (!sermon) {
                return res.status(404).json({ message: 'Sermon not found' });
            }
            res.status(200).json(sermon);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching sermon', error: error.message });
        }
    },

    createSermon: async (req, res) => {
        try {
            const sermonData = req.body;
            if (req.file) {
                sermonData.thumbnail_url = req.file.path;
            }
            const id = await Sermon.create(sermonData);
            res.status(201).json({ message: 'Sermon created successfully', id });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Title already exists. Please use a unique title.' });
            }
            res.status(500).json({ message: 'Error creating sermon', error: error.message });
        }
    },

    updateSermon: async (req, res) => {
        try {
            const sermonData = req.body;
            if (req.file) {
                sermonData.thumbnail_url = req.file.path;
            }
            await Sermon.update(req.params.id, sermonData);
            res.status(200).json({ message: 'Sermon updated successfully' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Title already exists. Please use a unique title.' });
            }
            res.status(500).json({ message: 'Error updating sermon', error: error.message });
        }
    },

    deleteSermon: async (req, res) => {
        try {
            await Sermon.delete(req.params.id);
            res.status(200).json({ message: 'Sermon deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting sermon', error: error.message });
        }
    }
};

module.exports = sermonController;
