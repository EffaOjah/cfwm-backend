const Joi = require('joi');

const apaproSchema = Joi.object({
    id: Joi.string().allow('', null), // Allow ID if sent in body
    date: Joi.string().isoDate().required(),
    title: Joi.string().required(),
    slug: Joi.string().allow('', null),
    subtitle: Joi.string().allow('', null),
    quote: Joi.string().required(),
    scripture: Joi.string().required(),
    scripture_ref: Joi.string().required(),
    content: Joi.array().items(Joi.string()).min(1).required(),
    prophetic: Joi.string().required(),
    confession: Joi.string().required(),
    further_study: Joi.array().items(Joi.string()).allow(null),
    bible_plan: Joi.string().allow('', null),
    declaration: Joi.string().allow('', null),
    declaration_ref: Joi.string().allow('', null),
    status: Joi.string().valid('draft', 'published').default('draft'),
    created_at: Joi.any().optional() // Allow timestamp if sent
});

module.exports = {
    apaproSchema
};