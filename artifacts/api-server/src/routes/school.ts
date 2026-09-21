import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import {
  aiInsightsTable,
  auditLogsTable,
  attendanceRecordsTable,
  assessmentsTable,
  classesTable,
  db,
  marksTable,
  studentsTable,
  schoolsTable,
  subjectsTable,
  teacherProfilesTable,
  teacherUpdatesTable,
  usersTable,
} from "@workspace/db";
import {
  AnswerPrincipalQuestionBody,
  AnswerPrincipalQuestionResponse,
  ConfirmAttendanceBody,
  ConfirmAttendanceResponse,
  ConfirmMarksBody,
  ConfirmMarksResponse,
  ConfirmTeacherUpdateBody,
  ConfirmTeacherUpdateResponse,
  ExtractAttendanceBody,
  ExtractAttendanceResponse,
  ExtractMarksBody,
  ExtractMarksResponse,
  ExtractTeacherUpdateBody,
  ExtractTeacherUpdateResponse,
  GetAttendanceOverviewQueryParams,
  GetAttendanceOverviewResponse,
  GetChangesQueryParams,
  GetChangesResponse,
  GetClassesResponse,
  GetDashboardResponse,
  GetIssueParams,
  GetIssueResponse,
  GetInsightsResponse,
  GetMarksOverviewQueryParams,
  GetMarksOverviewResponse,
  GetSchoolResponse,
  GetStudentsResponse,
  GetTeachersResponse,
  GetTeacherUpdatesResponse,
  CreateStudentBody,
  CreateStudentResponse,
} from "@workspace/api-zod";
import {
  demoAttendance,
  demoChanges,
  demoClasses,
  demoDashboard,
  demoInsights,
  demoIssueDetail,
  demoMarks,
  demoSchool,
  demoStudents,
  demoTeachers,
  demoTeacherUpdates,
} from "../lib/demo-data";
import { getSchoolContext } from "../middlewares/schoolContext";

const router: IRouter = Router();

function classLabel(grade: string, section: string): string {
  return `${grade}-${section}`;
}

async function schoolForRequest(req: Parameters<Parameters<IRouter["get"]>[1]>[0]) {
  const context = getSchoolContext(req);
  const [school] = await db.select().from(schoolsTable).where(eq(schoolsTable.id, context.schoolId)).limit(1);
  const [principal] = await db.select({ name: usersTable.name }).from(usersTable).where(and(eq(usersTable.schoolId, context.schoolId), eq(usersTable.role, "principal"))).limit(1);
  if (!school) return null;
  return {
    id: school.id,
    name: school.name,
    city: school.city,
    demo: school.isDemo,
    principalName: principal?.name ?? "Principal",
  };
}

router.get("/school", async (req, res): Promise<void> => {
  const school = await schoolForRequest(req);
  if (!school) {
    res.status(404).json({ error: "School not found" });
    return;
  }
  res.json(GetSchoolResponse.parse(school));
});

router.get("/dashboard", (_req, res): void => {
  const context = getSchoolContext(_req);
  if (context.isDemo) {
    res.json(GetDashboardResponse.parse(demoDashboard));
    return;
  }
  void schoolForRequest(_req).then((school) => {
    if (!school) {
      res.status(404).json({ error: "School not found" });
      return;
    }
    res.json(GetDashboardResponse.parse({
      school,
      health: "normal",
      issueCounts: { urgent: 0, attention: 0, normal: 0 },
      issues: [],
      academicSnapshot: { average: 0, assessmentsTracked: 0, belowThreshold: 0 },
      attendanceSnapshot: { todayPercent: 0, averagePercent: 0, absentToday: 0, classesTracked: 0 },
    }));
  });
});

router.get("/attendance", (req, res): void => {
  const parsed = GetAttendanceOverviewQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!getSchoolContext(req).isDemo) {
    res.json(GetAttendanceOverviewResponse.parse({ daily: [], classes: [], students: [] }));
    return;
  }
  res.json(GetAttendanceOverviewResponse.parse(demoAttendance));
});

router.post("/attendance/extract", (req, res): void => {
  const parsed = ExtractAttendanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!getSchoolContext(req).isDemo) {
    res.status(503).json({ error: "Document extraction is not configured for this school yet" });
    return;
  }
  res.json(ExtractAttendanceResponse.parse({
    id: "attendance-extraction-demo",
    sourceFile: parsed.data.fileName,
    confidence: 0.91,
    requiresReview: true,
    warnings: ["Two register marks were below the confidence threshold and should be checked."],
    rows: [
      { studentName: "Rhea Kulkarni", date: "2026-09-20", status: "absent", confidence: 0.96 },
      { studentName: "Arjun Patil", date: "2026-09-20", status: "present", confidence: 0.88 },
      { studentName: "Sana Shaikh", date: "2026-09-20", status: "present", confidence: 0.94 },
    ],
  }));
});

router.post("/attendance/confirm", async (req, res): Promise<void> => {
  const parsed = ConfirmAttendanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = getSchoolContext(req);
  const students = await db.select({ id: studentsTable.id, name: studentsTable.name }).from(studentsTable).where(eq(studentsTable.schoolId, context.schoolId));
  const studentsByName = new Map(students.map((student) => [student.name.trim().toLowerCase(), student.id]));
  const missing = parsed.data.rows.filter((row) => !studentsByName.has(row.studentName.trim().toLowerCase())).map((row) => row.studentName);
  if (missing.length > 0) {
    res.status(400).json({ error: `These students are not in this school's register: ${missing.join(", ")}` });
    return;
  }

  const auditLogId = await db.transaction(async (tx) => {
    for (const row of parsed.data.rows) {
      await tx.insert(attendanceRecordsTable).values({
        schoolId: context.schoolId,
        studentId: studentsByName.get(row.studentName.trim().toLowerCase())!,
        recordedByUserId: context.userId,
        attendanceDate: row.date,
        status: row.status,
        confidence: String(row.confidence),
        source: "reviewed_extraction",
      }).onConflictDoUpdate({
        target: [attendanceRecordsTable.schoolId, attendanceRecordsTable.studentId, attendanceRecordsTable.attendanceDate],
        set: {
          status: row.status,
          confidence: String(row.confidence),
          source: "reviewed_extraction",
          recordedByUserId: context.userId,
        },
      });
    }
    const [audit] = await tx.insert(auditLogsTable).values({
      schoolId: context.schoolId,
      actorUserId: context.userId,
      action: "confirm_extraction",
      entityType: "attendance",
      entityId: parsed.data.extractionId,
      metadata: { rowCount: parsed.data.rows.length, source: "reviewed_extraction" },
    }).returning({ id: auditLogsTable.id });
    return audit.id;
  });
  res.status(201).json(ConfirmAttendanceResponse.parse({ savedCount: parsed.data.rows.length, auditLogId }));
});

router.get("/marks", (req, res): void => {
  const parsed = GetMarksOverviewQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!getSchoolContext(req).isDemo) {
    res.json(GetMarksOverviewResponse.parse({ average: 0, highest: 0, lowest: 0, subjects: [], students: [] }));
    return;
  }
  res.json(GetMarksOverviewResponse.parse(demoMarks));
});

router.post("/marks/extract", (req, res): void => {
  const parsed = ExtractMarksBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!getSchoolContext(req).isDemo) {
    res.status(503).json({ error: "Document extraction is not configured for this school yet" });
    return;
  }
  res.json(ExtractMarksResponse.parse({
    id: "marks-extraction-demo",
    sourceFile: parsed.data.fileName,
    confidence: 0.89,
    requiresReview: true,
    warnings: ["Check the maximum marks column before saving."],
    rows: [
      { studentName: "Sana Shaikh", subject: "Mathematics", test: "Unit Test 2", marks: 31, maximumMarks: 50, date: "2026-09-18", confidence: 0.93 },
      { studentName: "Anaya Joshi", subject: "Mathematics", test: "Unit Test 2", marks: 46, maximumMarks: 50, date: "2026-09-18", confidence: 0.95 },
    ],
  }));
});

router.post("/marks/confirm", async (req, res): Promise<void> => {
  const parsed = ConfirmMarksBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = getSchoolContext(req);
  const students = await db.select({ id: studentsTable.id, name: studentsTable.name, classId: studentsTable.classId }).from(studentsTable).where(eq(studentsTable.schoolId, context.schoolId));
  const studentsByName = new Map(students.map((student) => [student.name.trim().toLowerCase(), student]));
  const missing = parsed.data.rows.filter((row) => !studentsByName.has(row.studentName.trim().toLowerCase())).map((row) => row.studentName);
  if (missing.length > 0) {
    res.status(400).json({ error: `These students are not in this school's register: ${missing.join(", ")}` });
    return;
  }

  const auditLogId = await db.transaction(async (tx) => {
    for (const row of parsed.data.rows) {
      const student = studentsByName.get(row.studentName.trim().toLowerCase())!;
      let [subject] = await tx.select().from(subjectsTable).where(and(eq(subjectsTable.schoolId, context.schoolId), eq(subjectsTable.name, row.subject))).limit(1);
      if (!subject) {
        [subject] = await tx.insert(subjectsTable).values({ schoolId: context.schoolId, name: row.subject }).returning();
      }
      let [assessment] = await tx.select().from(assessmentsTable).where(and(
        eq(assessmentsTable.schoolId, context.schoolId),
        eq(assessmentsTable.classId, student.classId),
        eq(assessmentsTable.subjectId, subject.id),
        eq(assessmentsTable.name, row.test),
        eq(assessmentsTable.assessedOn, row.date),
      )).limit(1);
      if (!assessment) {
        [assessment] = await tx.insert(assessmentsTable).values({
          schoolId: context.schoolId,
          classId: student.classId,
          subjectId: subject.id,
          name: row.test,
          assessedOn: row.date,
          maximumMarks: String(row.maximumMarks),
        }).returning();
      }
      await tx.insert(marksTable).values({
        schoolId: context.schoolId,
        assessmentId: assessment.id,
        studentId: student.id,
        marks: String(row.marks),
        confidence: String(row.confidence),
      }).onConflictDoUpdate({
        target: [marksTable.schoolId, marksTable.assessmentId, marksTable.studentId],
        set: { marks: String(row.marks), confidence: String(row.confidence) },
      });
    }
    const [audit] = await tx.insert(auditLogsTable).values({
      schoolId: context.schoolId,
      actorUserId: context.userId,
      action: "confirm_extraction",
      entityType: "marks",
      entityId: parsed.data.extractionId,
      metadata: { rowCount: parsed.data.rows.length, source: "reviewed_extraction" },
    }).returning({ id: auditLogsTable.id });
    return audit.id;
  });
  res.status(201).json(ConfirmMarksResponse.parse({ savedCount: parsed.data.rows.length, auditLogId }));
});

router.get("/teacher-updates", async (req, res): Promise<void> => {
  const context = getSchoolContext(req);
  const updates = await db.select({
    id: teacherUpdatesTable.id,
    createdAt: teacherUpdatesTable.createdAt,
    teacherName: usersTable.name,
    observation: teacherUpdatesTable.observation,
    transcript: teacherUpdatesTable.transcript,
    grade: classesTable.grade,
    section: classesTable.section,
  }).from(teacherUpdatesTable)
    .innerJoin(teacherProfilesTable, eq(teacherUpdatesTable.teacherProfileId, teacherProfilesTable.id))
    .innerJoin(usersTable, eq(teacherProfilesTable.userId, usersTable.id))
    .leftJoin(classesTable, eq(teacherUpdatesTable.classId, classesTable.id))
    .where(eq(teacherUpdatesTable.schoolId, context.schoolId));
  if (updates.length === 0 && context.isDemo) {
    res.json(GetTeacherUpdatesResponse.parse(demoTeacherUpdates));
    return;
  }
  res.json(GetTeacherUpdatesResponse.parse(updates.map((update) => ({
    id: update.id,
    teacherName: update.teacherName,
    createdAt: update.createdAt.toISOString(),
    summary: update.observation ?? update.transcript ?? "Teacher update recorded.",
    classLabel: update.grade && update.section ? classLabel(update.grade, update.section) : undefined,
  }))));
});

router.post("/teacher-updates/extract", (req, res): void => {
  const parsed = ExtractTeacherUpdateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!getSchoolContext(req).isDemo) {
    res.status(503).json({ error: "Voice transcription is not configured for this school yet" });
    return;
  }
  res.json(ExtractTeacherUpdateResponse.parse({
    id: "teacher-update-extraction-demo",
    sourceFile: parsed.data.fileName,
    transcript: "Class 8-A. Seven students have not submitted the fractions worksheet. We completed practice questions three and four.",
    confidence: 0.86,
    requiresReview: true,
    fields: {
      classLabel: "8-A",
      absentCount: 2,
      homeworkPending: 7,
      subject: "Mathematics",
      topic: "Fractions",
      observation: "Seven students have not submitted the fractions worksheet.",
      confidence: 0.84,
    },
  }));
});

router.post("/teacher-updates/confirm", async (req, res): Promise<void> => {
  const parsed = ConfirmTeacherUpdateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = getSchoolContext(req);
  const fields = parsed.data.fields;
  const [classRecord] = await db.select().from(classesTable).where(and(
    eq(classesTable.schoolId, context.schoolId),
    eq(classesTable.grade, fields.classLabel.split("-")[0] ?? ""),
    eq(classesTable.section, fields.classLabel.split("-")[1] ?? ""),
  )).limit(1);
  if (!classRecord) {
    res.status(400).json({ error: "That class does not belong to this school" });
    return;
  }

  const auditLogId = await db.transaction(async (tx) => {
    let [profile] = await tx.select().from(teacherProfilesTable).where(and(
      eq(teacherProfilesTable.schoolId, context.schoolId),
      eq(teacherProfilesTable.userId, context.userId),
    )).limit(1);
    if (!profile) {
      [profile] = await tx.insert(teacherProfilesTable).values({
        schoolId: context.schoolId,
        userId: context.userId,
      }).returning();
    }
    let [subject] = await tx.select().from(subjectsTable).where(and(eq(subjectsTable.schoolId, context.schoolId), eq(subjectsTable.name, fields.subject))).limit(1);
    if (!subject) {
      [subject] = await tx.insert(subjectsTable).values({ schoolId: context.schoolId, name: fields.subject }).returning();
    }
    const [update] = await tx.insert(teacherUpdatesTable).values({
      schoolId: context.schoolId,
      teacherProfileId: profile.id,
      classId: classRecord.id,
      subjectId: subject.id,
      transcript: fields.observation,
      absentCount: fields.absentCount,
      homeworkPending: fields.homeworkPending,
      topic: fields.topic,
      observation: fields.observation,
      confidence: String(fields.confidence),
    }).returning({ id: teacherUpdatesTable.id });
    const [audit] = await tx.insert(auditLogsTable).values({
      schoolId: context.schoolId,
      actorUserId: context.userId,
      action: "confirm_extraction",
      entityType: "teacher_update",
      entityId: parsed.data.extractionId,
      metadata: { savedId: update.id, source: "reviewed_extraction" },
    }).returning({ id: auditLogsTable.id });
    return audit.id;
  });
  res.status(201).json(ConfirmTeacherUpdateResponse.parse({ savedCount: 1, auditLogId }));
});

router.get("/changes", (req, res): void => {
  const parsed = GetChangesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!getSchoolContext(req).isDemo) {
    res.json(GetChangesResponse.parse({
      range: parsed.data.range,
      attendance: { current: 0, previous: 0, delta: 0, status: "stable", note: "No attendance records have been confirmed for this period." },
      academics: { current: 0, previous: 0, delta: 0, status: "stable", note: "No marks have been confirmed for this period." },
      homework: { current: 0, previous: 0, delta: 0, status: "stable", note: "No teacher updates have been confirmed for this period." },
      teacherUpdates: { current: 0, previous: 0, delta: 0, status: "stable", note: "No teacher updates have been confirmed for this period." },
      studentIssues: { current: 0, previous: 0, delta: 0, status: "stable", note: "No student issues have been recorded for this period." },
    }));
    return;
  }
  res.json(GetChangesResponse.parse({ ...demoChanges, range: parsed.data.range }));
});

router.get("/insights", (req, res): void => {
  if (!getSchoolContext(req).isDemo) {
    res.json(GetInsightsResponse.parse([]));
    return;
  }
  res.json(GetInsightsResponse.parse(demoInsights));
});

router.get("/issues/:issueId", (req, res): void => {
  const parsed = GetIssueParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!getSchoolContext(req).isDemo) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }
  if (parsed.data.issueId !== demoIssueDetail.issue.id) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }
  res.json(GetIssueResponse.parse(demoIssueDetail));
});

router.post("/chat", (req, res): void => {
  const parsed = AnswerPrincipalQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!getSchoolContext(req).isDemo) {
    res.json(AnswerPrincipalQuestionResponse.parse({
      answer: "There is not enough confirmed school data to answer that yet.",
      evidence: [],
      sufficientData: false,
    }));
    return;
  }
  const answer = parsed.data.question.toLowerCase().includes("7-b")
    ? "Class 7-B is flagged because its recorded attendance is 76% today, compared with a 91% seven-day average."
    : "The biggest recorded problem today is the Class 7-B attendance drop. Mathematics performance in 8-A also needs attention.";
  res.json(AnswerPrincipalQuestionResponse.parse({
    answer,
    evidence: ["Recorded attendance register for 20 Sep 2026", "Seven-day attendance summary", "Current school intelligence brief"],
    sufficientData: true,
  }));
});

router.get("/classes", async (req, res): Promise<void> => {
  const context = getSchoolContext(req);
  const classes = await db.select().from(classesTable).where(eq(classesTable.schoolId, context.schoolId));
  if (classes.length === 0) {
    res.json(GetClassesResponse.parse(demoClasses));
    return;
  }
  const students = await db.select({ classId: studentsTable.classId }).from(studentsTable).where(eq(studentsTable.schoolId, context.schoolId));
  const counts = new Map<string, number>();
  for (const student of students) counts.set(student.classId, (counts.get(student.classId) ?? 0) + 1);
  res.json(GetClassesResponse.parse(classes.map((item) => ({
    id: item.id,
    label: classLabel(item.grade, item.section),
    studentCount: counts.get(item.id) ?? 0,
    teacherCount: 0,
  }))));
});

router.get("/students", async (req, res): Promise<void> => {
  const context = getSchoolContext(req);
  const rows = await db.select({
    id: studentsTable.id,
    name: studentsTable.name,
    rollNumber: studentsTable.rollNumber,
    grade: classesTable.grade,
    section: classesTable.section,
  }).from(studentsTable).innerJoin(classesTable, and(eq(studentsTable.classId, classesTable.id), eq(studentsTable.schoolId, classesTable.schoolId))).where(eq(studentsTable.schoolId, context.schoolId));
  if (rows.length === 0) {
    res.json(GetStudentsResponse.parse(demoStudents));
    return;
  }
  res.json(GetStudentsResponse.parse(rows.map((student) => ({
    id: student.id,
    name: student.name,
    classLabel: classLabel(student.grade, student.section),
    rollNumber: student.rollNumber,
    attendancePercent: 0,
  }))));
});

router.post("/students", async (req, res): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = getSchoolContext(req);
  const [classRecord] = await db.select().from(classesTable).where(and(eq(classesTable.id, parsed.data.classId), eq(classesTable.schoolId, context.schoolId))).limit(1);
  if (!classRecord) {
    res.status(400).json({ error: "That class does not belong to this school" });
    return;
  }
  const [student] = await db.insert(studentsTable).values({
    schoolId: context.schoolId,
    classId: classRecord.id,
    name: parsed.data.name.trim(),
    rollNumber: parsed.data.rollNumber.trim(),
  }).returning();
  await db.insert(auditLogsTable).values({
    schoolId: context.schoolId,
    actorUserId: context.userId,
    action: "create",
    entityType: "student",
    entityId: student.id,
    metadata: { classId: classRecord.id },
  });
  res.status(201).json(CreateStudentResponse.parse({
    id: student.id,
    name: student.name,
    classLabel: classLabel(classRecord.grade, classRecord.section),
    rollNumber: student.rollNumber,
    attendancePercent: 0,
  }));
});

router.get("/teachers", async (req, res): Promise<void> => {
  const context = getSchoolContext(req);
  const teachers = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email }).from(usersTable).where(and(eq(usersTable.schoolId, context.schoolId), eq(usersTable.role, "teacher")));
  if (teachers.length === 0) {
    res.json(GetTeachersResponse.parse(demoTeachers));
    return;
  }
  res.json(GetTeachersResponse.parse(teachers.map((teacher) => ({ ...teacher, assignments: [] }))));
});

export default router;