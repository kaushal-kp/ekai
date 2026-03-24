/**
 * Migration: Create Teachers Table
 * This table stores teacher-specific information and their assignments.
 */

exports.up = function (knex) {
  return knex.schema.createTable('teachers', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign keys
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('school_udise', 50).references('udise_code').inTable('schools').onDelete('CASCADE');

    // Personal information
    table.string('name', 255).notNullable();
    table.string('employee_id', 100).unique();
    table.string('designation', 100);

    // Assignment information
    table.jsonb('subjects').defaultTo(JSON.stringify([]));
    table.jsonb('assigned_classes').defaultTo(JSON.stringify([]));

    // Class teacher information
    table.boolean('is_class_teacher').defaultTo(false);
    table.integer('class_teacher_of_class').nullable();
    table.string('class_teacher_of_section', 10).nullable();

    // Status
    table.boolean('is_active').defaultTo(true);

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('user_id');
    table.index('school_udise');
    table.index('is_class_teacher');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('teachers');
};
