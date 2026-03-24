/**
 * Migration: Create Notifications Table
 * This table stores user notifications for various system events.
 */

exports.up = function (knex) {
  return knex.schema.createTable('notifications', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign key
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');

    // Notification content
    table.string('title', 255).notNullable();
    table.text('message').notNullable();

    table.enum('type', ['attendance', 'grade', 'consent', 'announcement', 'system']).notNullable();

    // Reference to related resource
    table.string('reference_type', 100).nullable();
    table.uuid('reference_id').nullable();

    // Read status
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at').nullable();

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index(['user_id', 'is_read', 'created_at']);
    table.index('type');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('notifications');
};
