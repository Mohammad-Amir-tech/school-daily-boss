import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const schoolsTable = pgTable("schools", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
    clerkUserId: text("clerk_user_id").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("teacher"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    clerkUserSchoolIndex: uniqueIndex("users_clerk_user_school_idx").on(
      table.clerkUserId,
      table.schoolId,
    ),
  }),
);

export const classesTable = pgTable(
  "classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
    grade: text("grade").notNull(),
    section: text("section").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    schoolClassIndex: uniqueIndex("classes_school_grade_section_idx").on(
      table.schoolId,
      table.grade,
      table.section,
    ),
  }),
);

export const studentsTable = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
    classId: uuid("class_id").notNull().references(() => classesTable.id),
    name: text("name").notNull(),
    rollNumber: text("roll_number").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    studentRollIndex: uniqueIndex("students_school_class_roll_idx").on(
      table.schoolId,
      table.classId,
      table.rollNumber,
    ),
  }),
);

export const teacherProfilesTable = pgTable("teacher_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
  userId: uuid("user_id").notNull().references(() => usersTable.id),
  employeeCode: text("employee_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subjectsTable = pgTable(
  "subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    subjectNameIndex: uniqueIndex("subjects_school_name_idx").on(table.schoolId, table.name),
  }),
);

export const teacherAssignmentsTable = pgTable("teacher_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
  teacherProfileId: uuid("teacher_profile_id").notNull().references(() => teacherProfilesTable.id),
  classId: uuid("class_id").notNull().references(() => classesTable.id),
  subjectId: uuid("subject_id").notNull().references(() => subjectsTable.id),
});

export const attendanceRecordsTable = pgTable(
  "attendance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
    studentId: uuid("student_id").notNull().references(() => studentsTable.id),
    recordedByUserId: uuid("recorded_by_user_id").notNull().references(() => usersTable.id),
    attendanceDate: date("attendance_date", { mode: "string" }).notNull(),
    status: text("status").notNull(),
    confidence: numeric("confidence", { precision: 5, scale: 4 }),
    source: text("source").notNull().default("manual"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    attendanceStudentDateIndex: uniqueIndex("attendance_school_student_date_idx").on(
      table.schoolId,
      table.studentId,
      table.attendanceDate,
    ),
  }),
);

export const assessmentsTable = pgTable("assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
  classId: uuid("class_id").notNull().references(() => classesTable.id),
  subjectId: uuid("subject_id").notNull().references(() => subjectsTable.id),
  name: text("name").notNull(),
  assessedOn: date("assessed_on", { mode: "string" }).notNull(),
  maximumMarks: numeric("maximum_marks", { precision: 8, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const marksTable = pgTable(
  "marks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
    assessmentId: uuid("assessment_id").notNull().references(() => assessmentsTable.id),
    studentId: uuid("student_id").notNull().references(() => studentsTable.id),
    marks: numeric("marks", { precision: 8, scale: 2 }).notNull(),
    confidence: numeric("confidence", { precision: 5, scale: 4 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    markStudentAssessmentIndex: uniqueIndex("marks_school_assessment_student_idx").on(
      table.schoolId,
      table.assessmentId,
      table.studentId,
    ),
  }),
);

export const teacherUpdatesTable = pgTable("teacher_updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
  teacherProfileId: uuid("teacher_profile_id").notNull().references(() => teacherProfilesTable.id),
  classId: uuid("class_id").references(() => classesTable.id),
  subjectId: uuid("subject_id").references(() => subjectsTable.id),
  sourceObjectPath: text("source_object_path"),
  transcript: text("transcript"),
  absentCount: integer("absent_count"),
  homeworkPending: integer("homework_pending"),
  topic: text("topic"),
  observation: text("observation"),
  confidence: numeric("confidence", { precision: 5, scale: 4 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiInsightsTable = pgTable("ai_insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
  category: text("category").notNull(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  evidence: text("evidence").notNull(),
  whyItMatters: text("why_it_matters").notNull(),
  suggestedAction: text("suggested_action").notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
  evidenceData: jsonb("evidence_data").$type<Record<string, unknown>>().notNull().default({}),
  observedOn: date("observed_on", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const issuesTable = pgTable("issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
  insightId: uuid("insight_id").notNull().references(() => aiInsightsTable.id),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").notNull().references(() => schoolsTable.id),
  actorUserId: uuid("actor_user_id").references(() => usersTable.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSchoolSchema = createInsertSchema(schoolsTable).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export const insertClassSchema = createInsertSchema(classesTable).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, createdAt: true });
export const insertSubjectSchema = createInsertSchema(subjectsTable).omit({ id: true, createdAt: true });
export const insertAttendanceSchema = createInsertSchema(attendanceRecordsTable).omit({ id: true, createdAt: true });
export const insertAssessmentSchema = createInsertSchema(assessmentsTable).omit({ id: true, createdAt: true });
export const insertMarkSchema = createInsertSchema(marksTable).omit({ id: true, createdAt: true });
export const insertTeacherUpdateSchema = createInsertSchema(teacherUpdatesTable).omit({ id: true, createdAt: true });
export const insertInsightSchema = createInsertSchema(aiInsightsTable).omit({ id: true, createdAt: true });
export const insertIssueSchema = createInsertSchema(issuesTable).omit({ id: true, createdAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({ id: true, createdAt: true });

export type School = z.infer<typeof insertSchoolSchema>;
export type User = z.infer<typeof insertUserSchema>;
export type Classroom = z.infer<typeof insertClassSchema>;
export type Student = z.infer<typeof insertStudentSchema>;
export type Subject = z.infer<typeof insertSubjectSchema>;
export type AttendanceRecord = z.infer<typeof insertAttendanceSchema>;
export type Assessment = z.infer<typeof insertAssessmentSchema>;
export type Mark = z.infer<typeof insertMarkSchema>;
export type TeacherUpdate = z.infer<typeof insertTeacherUpdateSchema>;
export type AiInsight = z.infer<typeof insertInsightSchema>;
export type Issue = z.infer<typeof insertIssueSchema>;
export type AuditLog = z.infer<typeof insertAuditLogSchema>;