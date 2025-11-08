import { boolean, json, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  subscriptionId: varchar({ length: 255 }),
});

export const coursesTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1024 }),
  numberOfChapters: integer().notNull(),
  includeVideo: boolean().notNull().default(false),
  level: varchar({ length: 500 }).notNull(),
  category: varchar({ length: 500 }),
  courseJson: json(),
  bannerImageURL: varchar({ length: 2048 }).default(""),
  coursesContent: json().default({}),
  userEmail: varchar("userEmail").references(() => usersTable.email),
});



// ✅ Fixed enrollCourseTable
export const enrollCourseTable = pgTable("enrollCourse", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  // ✅ Correct reference to course cid
  cid: varchar("cid").references(() => coursesTable.cid).notNull(),

  // ✅ Reference user email from usersTable
  userEmail: varchar("userEmail").references(() => usersTable.email).notNull(),

  completedChapters: json("completedChapters").default({}),
});
