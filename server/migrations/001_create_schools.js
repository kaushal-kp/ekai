/**
 * Migration: Create Schools Table
 * This table stores school information including UDISE code, contact details,
 * and subscription tier information.
 */

exports.up = function (knex) {
  return knex.schema.createTable('schools', (table) => {
    // Primary key
    table.string('udise_code', 50).primary().comment('Unique UDISE code');

    // School information
    table.string('name', 255).notNullable();
    table.string('board', 100).notNullable();
    table.string('state', 100).notNullable();
    table.string('district', 100).notNullable();
    table.string('city', 100).notNullable();
    table.string('pin_code', 10);

    // Contact information
    table.string('principal_name', 255);
    table.string('contact_phone', 20);
    table.string('contact_email', 255);

    // Subscription and status
    table.enum('subscription_tier', ['free', 'premium', 'enterprise']).defaultTo('free');
    table.boolean('is_active').defaultTo(true);

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('state');
    table.index('district');
    table.index('is_active');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('schools');
};
