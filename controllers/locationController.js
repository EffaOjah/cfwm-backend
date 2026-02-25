const District = require('../models/district.js');
const Branch = require('../models/branch.js');

const locationController = {
    // Districts
    getDistricts: async (req, res) => {
        try {
            const districts = await District.getAll();
            res.status(200).json(districts);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching districts', error: error.message });
        }
    },

    getDistrictsWithBranches: async (req, res) => {
        try {
            const districts = await District.getAll();
            const result = await Promise.all(districts.map(async (district) => {
                const branches = await Branch.getByDistrict(district.id);
                return { ...district, branches };
            }));
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching districts with branches', error: error.message });
        }
    },

    createDistrict: async (req, res) => {
        try {
            const id = await District.create(req.body);
            res.status(201).json({ message: 'District created successfully', id });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'District name already exists.' });
            }
            res.status(500).json({ message: 'Error creating district', error: error.message });
        }
    },

    updateDistrict: async (req, res) => {
        try {
            await District.update(req.params.id, req.body);
            res.status(200).json({ message: 'District updated successfully' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'District name already exists.' });
            }
            res.status(500).json({ message: 'Error updating district', error: error.message });
        }
    },

    deleteDistrict: async (req, res) => {
        try {
            await District.delete(req.params.id);
            res.status(200).json({ message: 'District deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting district', error: error.message });
        }
    },

    // Branches
    getBranches: async (req, res) => {
        try {
            const branches = await Branch.getAll();
            res.status(200).json(branches);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching branches', error: error.message });
        }
    },

    getHeadquarters: async (req, res) => {
        try {
            const hq = await Branch.getHeadquarters();
            if (!hq) {
                return res.status(404).json({ message: 'Headquarters not found' });
            }
            res.status(200).json(hq);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching headquarters', error: error.message });
        }
    },

    createBranch: async (req, res) => {
        try {
            const branchData = req.body;
            if (req.file) {
                branchData.image_url = req.file.path;
            }
            const id = await Branch.create(branchData);
            res.status(201).json({ message: 'Branch created successfully', id });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Branch name already exists.' });
            }
            res.status(500).json({ message: 'Error creating branch', error: error.message });
        }
    },

    updateBranch: async (req, res) => {
        try {
            const branchData = req.body;
            if (req.file) {
                branchData.image_url = req.file.path;
            }
            await Branch.update(req.params.id, branchData);
            res.status(200).json({ message: 'Branch updated successfully' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Branch name already exists.' });
            }
            res.status(500).json({ message: 'Error updating branch', error: error.message });
        }
    },

    deleteBranch: async (req, res) => {
        try {
            await Branch.delete(req.params.id);
            res.status(200).json({ message: 'Branch deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting branch', error: error.message });
        }
    }
};

module.exports = locationController;
