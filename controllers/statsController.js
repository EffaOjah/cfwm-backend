const Testimony = require('../models/testimony.js');
const Event = require('../models/event.js');
const Sermon = require('../models/sermon.js');
const PrayerRequest = require('../models/prayerRequest.js');
const FirstTimer = require('../models/firstTimer.js');

const statsController = {
    getDashboardOverview: async (req, res) => {
        try {
            const now = new Date();
            const thisYear = now.getFullYear();
            const thisMonth = now.getMonth() + 1;

            const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastYear = lastMonthDate.getFullYear();
            const lastMonth = lastMonthDate.getMonth() + 1;

            const [
                testimonyCount, eventCount, sermonCount,
                prayerRequestCount, firstTimerCount,
                recentTestimonies,
                thisMonthCount, lastMonthCount,
                recentEvents, recentSermons,
                recentPrayerRequests, recentFirstTimers
            ] = await Promise.all([
                Testimony.getCount(),
                Event.getCount(),
                Sermon.getCount(),
                PrayerRequest.getCount(),
                FirstTimer.getCount(),
                Testimony.getRecent(5),
                Testimony.getCountByMonth(thisYear, thisMonth),
                Testimony.getCountByMonth(lastYear, lastMonth),
                Event.getRecent(3),
                Sermon.getRecent(3),
                PrayerRequest.getRecent(3),
                FirstTimer.getRecent(3)
            ]);

            // Calculate testimony percentage change
            let testimonyTrend = null;
            if (lastMonthCount > 0) {
                const change = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
                testimonyTrend = `${change >= 0 ? '+' : ''}${change.toFixed(0)}% this month`;
            } else if (thisMonthCount > 0) {
                testimonyTrend = 'New this month';
            } else {
                testimonyTrend = 'No change';
            }

            // Build unified activity feed
            const activityItems = [
                ...recentTestimonies.map(t => ({
                    type: 'testimony',
                    title: 'New Testimony',
                    desc: `${t.name} shared a testimony.`,
                    date: t.created_at
                })),
                ...recentEvents.map(e => ({
                    type: 'event',
                    title: 'New Event',
                    desc: `"${e.title}" was added.`,
                    date: e.created_at
                })),
                ...recentSermons.map(s => ({
                    type: 'sermon',
                    title: 'New Sermon',
                    desc: `"${s.title}" by ${s.speaker}.`,
                    date: s.created_at
                })),
                ...recentPrayerRequests.map(p => ({
                    type: 'prayer',
                    title: 'New Prayer Request',
                    desc: `${p.name || 'Someone'} requested prayer for ${p.topic}.`,
                    date: p.created_at
                })),
                ...recentFirstTimers.map(f => ({
                    type: 'firstTimer',
                    title: 'New First Timer',
                    desc: `${f.full_name} joined the family!`,
                    date: f.created_at
                }))
            ];

            // Sort by most recent and take top 8
            activityItems.sort((a, b) => new Date(b.date) - new Date(a.date));
            const recentActivity = activityItems.slice(0, 8);

            res.status(200).json({
                counts: {
                    testimonies: testimonyCount,
                    events: eventCount,
                    sermons: sermonCount,
                    prayerRequests: prayerRequestCount,
                    firstTimers: firstTimerCount
                },
                trends: {
                    testimonies: testimonyTrend
                },
                recentTestimonies,
                recentActivity
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
        }
    }
};

module.exports = statsController;
