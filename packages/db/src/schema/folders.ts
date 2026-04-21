import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const folders = pgTable('folders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  parentId: uuid('parent_id'),
  folderType: text('folder_type'), // 'specialization'|'clinic'|'reports'|'prescriptions'
  createdAt: timestamp('created_at').defaultNow(),
});
