import { pgTable, text, timestamp, uuid, date, boolean, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { folders } from "./folders.js";

export const labReports = pgTable('lab_reports', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  folderId: text('folder_id').references(() => folders.id),
  fileUrl: text('file_url').notNull(),
  testName: text('test_name'),
  labName: text('lab_name'),
  reportDate: date('report_date'),
  resultSummary: text('result_summary'),
  biomarkers: jsonb('biomarkers'),
  isCritical: boolean('is_critical').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
