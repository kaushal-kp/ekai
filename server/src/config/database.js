const knex = require('knex');
const config = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';

/**
 * Database connection instance
 * Uses environment-specific configuration from knexfile.js
 */
const db = knex(config[environment]);

module.exports = db;
