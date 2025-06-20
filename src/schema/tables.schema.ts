import { pgTable, uuid, text, pgEnum, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['applicant', 'company']);

export const applicationStatusEnum = pgEnum('application_status', [
  'Applied',
  'Reviewed',
  'Interview',
  'Rejected',
  'Hired',
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(), // UUID primary key with default random generation
  name: text('name').notNull(),                 // Required string for name
  email: text('email').unique().notNull(),      // Required, unique string for email
  password: text('password').notNull(),         // Required string for hashed password
  role: userRoleEnum('role').notNull(),         // Required enum for user role
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), // Timestamp with default to current time
});

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),    // UUID primary key with default random generation
  title: text('title').notNull(),                 // Required string for job title
  description: text('description').notNull(),     // Required string for job description
  location: text('location'),                     // Optional string for job location
  // Foreign key to users table, restricted to 'company' role (logic handled at application level)
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // Foreign key to User.Id, CASCADE on delete
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), // Timestamp with default to current time
});

export const applications = pgTable('applications', {
  id: uuid('id').defaultRandom().primaryKey(),    // UUID primary key with default random generation
  // Foreign key to users table, restricted to 'applicant' role (logic handled at application level)
  applicantId: uuid('applicant_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // Foreign key to User.Id, CASCADE on delete
  // Foreign key to jobs table
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }), // Foreign key to Job.Id, CASCADE on delete
  resumeLink: text('resume_link').notNull(),      // Required string (URL to Cloudinary file)
  coverLetter: text('cover_letter'),              // Optional string for cover letter
  status: applicationStatusEnum('status').default('Applied').notNull(), // Required enum with default 'Applied'
  appliedAt: timestamp('applied_at', { withTimezone: true }).defaultNow().notNull(), // Timestamp with default to current time
});


export const usersRelations = relations(users, ({ many }) => ({
  jobs: many(jobs),
  applications: many(applications),
}));

// Job relations: A job is created by one user and can have many applications
export const jobsRelations = relations(jobs, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [jobs.createdBy],
    references: [users.id],
  }),
  applications: many(applications),
}));

// Application relations: An application belongs to one applicant and one job
export const applicationsRelations = relations(applications, ({ one }) => ({
  applicant: one(users, {
    fields: [applications.applicantId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
}));
