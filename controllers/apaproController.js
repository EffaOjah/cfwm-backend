const apaproModel = require('../models/apaproModel');
const { apaproSchema } = require('../services/validation');
const logger = require('../services/logger');

// PUBLIC: Get all published devotionals for dates <= today
const getPublishedDevotionals = async (req, res) => {
    try {
        const devotionals = await apaproModel.getPublished();
        res.status(200).json({ status: 'success', data: devotionals });
    } catch (error) {
        console.error('getPublishedDevotionals error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch devotionals.' });
    }
};

// PUBLIC: Get single devotional by date
const getDevotionalByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const devotional = await apaproModel.getByDate(date);
        if (!devotional) {
            return res.status(404).json({ status: 'error', message: 'No devotional found for this date.' });
        }
        res.status(200).json({ status: 'success', data: devotional });
    } catch (error) {
        console.error('getDevotionalByDate error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch devotional.' });
    }
};

// ADMIN: Get all devotionals (all statuses)
const getAllDevotionals = async (req, res) => {
    try {
        const devotionals = await apaproModel.getAll();
        console.log(devotionals);

        res.status(200).json({ status: 'success', data: devotionals });
    } catch (error) {
        console.error('getAllDevotionals error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch devotionals.' });
    }
};

// ADMIN: Create devotional
const createDevotional = async (req, res) => {
    try {
        const { error, value } = apaproSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 'error', message: error.details[0].message });
        }

        const result = await apaproModel.create(value);
        res.status(201).json({ status: 'success', message: 'Devotional created.', id: result });
    } catch (error) {
        console.error('createDevotional error:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Failed to create devotional.' });
    }
};

// ADMIN: Update devotional
const updateDevotional = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = apaproSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 'error', message: error.details[0].message });
        }

        const existing = await apaproModel.getById(id);
        if (!existing) {
            return res.status(404).json({ status: 'error', message: 'Devotional not found.' });
        }
        await apaproModel.update(id, value);
        res.status(200).json({ status: 'success', message: 'Devotional updated.' });
    } catch (error) {
        console.error('updateDevotional error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update devotional.' });
    }
};

// ADMIN: Delete devotional
const deleteDevotional = async (req, res) => {
    try {
        const { id } = req.params;
        await apaproModel.delete(id);
        res.status(200).json({ status: 'success', message: 'Devotional deleted.' });
    } catch (error) {
        console.error('deleteDevotional error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete devotional.' });
    }
};

module.exports = {
    getPublishedDevotionals,
    getDevotionalByDate,
    getAllDevotionals,
    createDevotional,
    updateDevotional,
    deleteDevotional,
};