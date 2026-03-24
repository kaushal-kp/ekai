/**
 * Migration: Create Attendance Table
 * This table stores attendance records with support for offline sync
 * and detailed period-level tracking.
 */

exports.up = function (knex) {
  return knex.schema.createTable('attendance', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign keys
    table.string('student_apaar_id', 100).references('apaar_id').inTable('students').onDelete('CASCADE');
    table.string('school_udise', 50).references('udise_code').inTable('schools').onDelete('CASCADE');
    table.uuid('marked_by').references('id').inTable('users').onDelete('SET NULL');

    // Attendance details
    table.date('date').notNullable();
    table.enum('status', ['present', 'absent', 'late', 'half_day', 'holiday']).notNullable();
    table.integer('period').nullable().comment('Period number for period-level tracking');
    table.text('remarks').nullable();

    // Offline sync
    table.string('device_id', 255).nullable();
    table.boolean('is_offline_entry').defaultTo(false);
    table.timestamp('synced_at').nullable();

    // Timestamps
    table.timestamps(true, true);

    // Unique constraint on (student, date, period)
    table.unique(['student_apaar_id', 'date', 'period']);

    // Indexes
    table.index(['school_udise', 'date']);
    table.index('student_apaar_id');
    table.index('marked_by');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('attendance');
};
