const AdminModel = require('../models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ status: 'error', message: 'Username and password are required' });
            }

            const admin = await AdminModel.findByUsername(username);

            if (!admin) {
                return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, admin.password);

            if (!isMatch) {
                return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: admin.id, username: admin.username },
                process.env.JWT_SECRET || 'your_jwt_secret_key_here',
                { expiresIn: '8h' }
            );

            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                token,
                user: {
                    id: admin.id,
                    username: admin.username,
                    full_name: admin.full_name
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    }
};

module.exports = authController;
