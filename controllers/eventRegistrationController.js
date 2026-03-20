const EventRegistration = require('../models/eventRegistration.js');
const Joi = require('joi');

const registrationSchema = Joi.object({
    full_name: Joi.string().required().messages({
        'string.empty': 'Full name is required.',
        'any.required': 'Full name is required.'
    }),
    phone: Joi.string().required().pattern(/^[0-9+()-\s]+$/).messages({
        'string.empty': 'Phone number is required.',
        'string.pattern.base': 'Phone number contains invalid characters.',
        'any.required': 'Phone number is required.'
    }),
    email: Joi.string().email().allow('', null).messages({
        'string.email': 'Invalid email address.'
    }),
    event_title: Joi.string().required().messages({
        'string.empty': 'Event title is required.',
        'any.required': 'Event title is required.'
    })
});

const eventRegistrationController = {
    /**
     * Handle new event registration
     */
    registerEvent: async (req, res) => {
        try {
            // 1. Validate Input
            const { error, value } = registrationSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    status: 'error',
                    message: error.details[0].message
                });
            }

            // 2. Create Registration
            const id = await EventRegistration.create(value);

            // 3. Success Response
            res.status(201).json({
                status: 'success',
                message: 'Registration successful',
                id
            });
        } catch (error) {
            // Handle duplicate entry error (MySQL error code 1062)
            if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                return res.status(400).json({
                    status: 'error',
                    message: 'You have already registered for this event with this phone number or email.'
                });
            }

            console.error('Error in registerEvent controller:', error);
            res.status(500).json({
                status: 'error',
                message: 'An internal server error occurred. Please try again later.'
            });
        }
    },

    /**
     * Get all event registrations (for admin)
     */
    getRegistrations: async (req, res) => {
        try {
            const registrations = await EventRegistration.getAll();
            res.status(200).json({
                status: 'success',
                data: registrations
            });
        } catch (error) {
            console.error('Error in getRegistrations controller:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error fetching registrations'
            });
        }
    },

    /**
     * Delete an event registration
     */
    deleteRegistration: async (req, res) => {
        try {
            await EventRegistration.delete(req.params.id);
            res.status(200).json({
                status: 'success',
                message: 'Registration deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteRegistration controller:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error deleting registration'
            });
        }
    }
};

module.exports = eventRegistrationController;
