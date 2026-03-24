/**
 * Migration: Create Users Table
 * This table stores user account information including authentication details,
 * roles, and school association.
 */

exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // APAAR integration
    table.string('apaar_id', 100).unique().nullable();

    // Authentication
    table.string('email', 255).unique().nullable();
    table.string('phone', 20).notNullable().unique();
    table.string('password_hash', 255).nullable();

    // User information
    table.string('name', 255).notNullable();
    table.enum('role', ['student', 'teacher', 'school_admin', 'parent', 'platform_admin']).notNullable();

    // School association
    table.string('school_udise', 50).references('udise_code').inTable('schools').onDelete('SET NULL');

    // Status
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login_at').nullable();

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('phone');
    table.index('role');
    table.index('school_udise');
    table.index('is_active');
    table.index('apaar_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
