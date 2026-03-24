/**
 * Migration: Create Students Table
 * This table stores student-specific information linked to users.
 * APAAR ID is the primary key as per APAAR standard.
 */

exports.up = function (knex) {
  return knex.schema.createTable('students', (table) => {
    // Primary key - APAAR ID
    table.string('apaar_id', 100).primary().comment('APAAR unique identifier');

    // Foreign keys
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('school_udise', 50).references('udise_code').inTable('schools').onDelete('CASCADE');

    // Personal information
    table.string('name', 255).notNullable();
    table.date('dob').notNullable();
    table.enum('gender', ['M', 'F', 'Other']).notNullable();

    // Academic information
    table.integer('class').notNullable();
    table.string('section', 10).notNullable();

    // Guardian information
    table.string('guardian_name', 255);
    table.string('guardian_phone', 20);
    table.string('guardian_relation', 50);

    // Status
    table.date('enrollment_date').notNullable();
    table.boolean('is_active').defaultTo(true);

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index(['school_udise', 'class', 'section']);
    table.index('user_id');
    table.index('is_active');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('students');
};
