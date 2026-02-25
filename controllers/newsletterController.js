const Subscriber = require('../models/subscriber.js');

const newsletterController = {
    subscribe: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: 'Email is required.' });
            }

            // Check if already subscribed
            const existing = await Subscriber.getByEmail(email);
            if (existing) {
                if (existing.status === 'active') {
                    return res.status(400).json({ message: 'This email is already subscribed.' });
                } else {
                    // Re-activate
                    await Subscriber.activate(email);
                    return res.status(200).json({ message: 'Subscription re-activated!' });
                }
            }

            await Subscriber.create(email);
            res.status(201).json({ message: 'Successfully subscribed to the newsletter!' });
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            res.status(500).json({ message: 'An error occurred while subscribing. Please try again.' });
        }
    },

    getSubscribers: async (req, res) => {
        try {
            const subscribers = await Subscriber.getAll();
            res.status(200).json(subscribers);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching subscribers', error: error.message });
        }
    },

    unsubscribe: async (req, res) => {
        try {
            const { email } = req.body;
            await Subscriber.unsubscribe(email);
            res.status(200).json({ message: 'Unsubscribed successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error unsubscribing', error: error.message });
        }
    },

    remove: async (req, res) => {
        try {
            const { id } = req.params;
            await Subscriber.deleteById(id);
            res.status(200).json({ message: 'Subscriber removed successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error removing subscriber', error: error.message });
        }
    }
};

module.exports = newsletterController;
