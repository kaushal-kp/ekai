/**
 * Migration: Create Academic Calendar Events Table
 * This table stores school calendar events including holidays, exams, and activities.
 */

exports.up = function (knex) {
  return knex.schema.createTable('academic_events', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign keys
    table.string('school_udise', 50).references('udise_code').inTable('schools').onDelete('CASCADE');
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');

    // Event details
    table.string('title', 255).notNullable();
    table.text('description').nullable();

    table.enum('event_type', ['holiday', 'exam', 'meeting', 'activity', 'deadline']).notNullable();

    // Dates
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();

    // Applicability
    table.boolean('is_school_wide').defaultTo(false);
    table.jsonb('applicable_classes').nullable();

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('school_udise');
    table.index('start_date');
    table.index('event_type');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('academic_events');
};
