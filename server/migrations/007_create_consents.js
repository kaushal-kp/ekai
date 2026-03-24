/**
 * Migration: Create Consents and Consent Audit Log Tables
 * These tables manage APAAR data sharing consents and maintain audit trails.
 */

exports.up = function (knex) {
  return knex.schema
    .createTable('consents', (table) => {
      // Primary key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      // Student and grantor
      table.string('student_apaar_id', 100).references('apaar_id').inTable('students').onDelete('CASCADE');
      table.uuid('granted_by').references('id').inTable('users').onDelete('SET NULL');

      // Recipient information
      table.string('granted_to_entity', 255).notNullable();
      table.enum('granted_to_type', ['school', 'employer', 'government']).notNullable();

      // Scope of consent
      table.enum('scope', [
        'basic_identity',
        'academic_summary',
        'detailed_academic',
        'attendance',
        'certificates',
        'full_profile',
      ]).notNullable();

      // Status
      table.enum('status', ['active', 'revoked', 'expired']).defaultTo('active');

      // Dates
      table.timestamp('granted_at').defaultTo(knex.fn.now());
      table.timestamp('revoked_at').nullable();
      table.timestamp('expires_at').nullable();

      // Audit information
      table.string('ip_address', 45).nullable();
      table.string('user_agent', 500).nullable();

      // Timestamps
      table.timestamps(true, true);

      // Indexes
      table.index('student_apaar_id');
      table.index('status');
      table.index('granted_to_entity');
    })
    .createTable('consent_audit_log', (table) => {
      // Primary key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      // Foreign key
      table.uuid('consent_id').references('id').inTable('consents').onDelete('CASCADE');

      // Performer
      table.uuid('performed_by').references('id').inTable('users').onDelete('SET NULL');

      // Action
      table.enum('action', ['granted', 'revoked', 'expired', 'accessed']).notNullable();

      // Audit details
      table.string('ip_address', 45).nullable();
      table.jsonb('details').nullable();

      // Timestamp
      table.timestamp('created_at').defaultTo(knex.fn.now());

      // Indexes
      table.index('consent_id');
      table.index('created_at');
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('consent_audit_log')
    .then(() => knex.schema.dropTableIfExists('consents'));
};
