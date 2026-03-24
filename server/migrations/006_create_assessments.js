/**
 * Migration: Create Assessments and Grades Tables
 * These tables manage assessment creation, grading, and performance tracking.
 */

exports.up = function (knex) {
  return knex.schema
    .createTable('assessments', (table) => {
      // Primary key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      // Foreign keys
      table.string('school_udise', 50).references('udise_code').inTable('schools').onDelete('CASCADE');
      table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');

      // Assessment details
      table.string('title', 255).notNullable();
      table.string('subject', 100).notNullable();
      table.integer('class').notNullable();
      table.string('section', 10).nullable();

      table.enum('assessment_type', [
        'unit_test',
        'midterm',
        'final',
        'assignment',
        'project',
        'practical',
      ]).notNullable();

      // Marks and weightage
      table.integer('max_marks').notNullable();
      table.decimal('weightage', 5, 2).defaultTo(0);

      // Assessment date
      table.date('date').notNullable();

      // Status
      table.boolean('is_published').defaultTo(false);

      // Timestamps
      table.timestamps(true, true);

      // Indexes
      table.index('school_udise');
      table.index('class');
      table.index('subject');
    })
    .createTable('grades', (table) => {
      // Primary key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      // Foreign keys
      table.uuid('assessment_id').references('id').inTable('assessments').onDelete('CASCADE');
      table.string('student_apaar_id', 100).references('apaar_id').inTable('students').onDelete('CASCADE');
      table.uuid('graded_by').references('id').inTable('users').onDelete('SET NULL');

      // Grade details
      table.decimal('marks_obtained', 6, 2).notNullable();
      table.string('grade_letter', 5);
      table.decimal('percentile', 5, 2).nullable();
      table.text('remarks').nullable();

      // Timestamps
      table.timestamps(true, true);

      // Unique constraint
      table.unique(['assessment_id', 'student_apaar_id']);

      // Indexes
      table.index('assessment_id');
      table.index('student_apaar_id');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('grades').then(() => knex.schema.dropTableIfExists('assessments'));
};
