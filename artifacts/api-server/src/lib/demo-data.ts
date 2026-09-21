import type {
  AcademicSnapshot,
  AttendanceOverview,
  AttendanceSnapshot,
  ChangeSummary,
  Dashboard,
  Insight,
  IssueDetail,
  MarksOverview,
  School,
  Student,
  Teacher,
  TeacherUpdate,
} from "@workspace/api-zod";

export const demoSchool: School = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Saraswati Vidya Mandir",
  city: "Pune",
  demo: true,
  principalName: "Meera Sharma",
};

export const demoInsights: Insight[] = [
  {
    id: "attendance-7b-drop",
    severity: "urgent",
    category: "attendance",
    title: "Class 7-B attendance dropped today",
    evidence: "76% present today versus a 91% seven-day average (15 percentage points lower).",
    whyItMatters: "A sudden class-level change is worth checking while the context is still fresh.",
    suggestedAction: "Ask the 7-B class teacher to confirm whether the register is complete and follow up on absent students.",
    confidence: 0.98,
    classLabel: "7-B",
    studentCount: 8,
  },
  {
    id: "attendance-rhea-repeat",
    severity: "attention",
    category: "attendance",
    title: "Repeated absences in 6-A",
    evidence: "Rhea Kulkarni has been marked absent on 3 of the last 5 recorded school days.",
    whyItMatters: "Repeated absence can affect continuity of learning and needs a factual follow-up.",
    suggestedAction: "Review the attendance history with the class teacher and contact the family through the school's normal process.",
    confidence: 0.94,
    classLabel: "6-A",
    studentCount: 1,
  },
  {
    id: "academic-math-8a",
    severity: "attention",
    category: "academic",
    title: "Mathematics marks are below the school threshold in 8-A",
    evidence: "Class average is 57% on the latest recorded test; 9 students are below 50%.",
    whyItMatters: "The recorded results suggest the class may need an instructional review.",
    suggestedAction: "Ask the mathematics teacher to share the topic breakdown and plan a short reteach for the lowest-scoring areas.",
    confidence: 0.91,
    classLabel: "8-A",
    studentCount: 9,
  },
  {
    id: "positive-7a",
    severity: "positive",
    category: "academic",
    title: "Class 7-A is trending up in Science",
    evidence: "The latest Science average is 8 percentage points higher than the previous recorded test.",
    whyItMatters: "This is an observable improvement worth understanding and repeating where useful.",
    suggestedAction: "Invite the teacher to share the activity or approach used in the next staff huddle.",
    confidence: 0.88,
    classLabel: "7-A",
    studentCount: 24,
  },
];

const academicSnapshot: AcademicSnapshot = {
  average: 68,
  assessmentsTracked: 12,
  belowThreshold: 17,
};

const attendanceSnapshot: AttendanceSnapshot = {
  todayPercent: 86,
  averagePercent: 90,
  absentToday: 42,
  classesTracked: 12,
};

export const demoDashboard: Dashboard = {
  school: demoSchool,
  health: "attention",
  issueCounts: { urgent: 1, attention: 2, normal: 0 },
  issues: demoInsights,
  academicSnapshot,
  attendanceSnapshot,
};

export const demoAttendance: AttendanceOverview = {
  daily: [
    { label: "14 Sep", value: 91 },
    { label: "15 Sep", value: 89 },
    { label: "16 Sep", value: 92 },
    { label: "17 Sep", value: 90 },
    { label: "18 Sep", value: 88 },
    { label: "19 Sep", value: 91 },
    { label: "Today", value: 86 },
  ],
  classes: [
    { classLabel: "6-A", percentage: 92, change: -1 },
    { classLabel: "6-B", percentage: 89, change: -2 },
    { classLabel: "7-A", percentage: 94, change: 1 },
    { classLabel: "7-B", percentage: 76, change: -15 },
    { classLabel: "8-A", percentage: 83, change: -4 },
    { classLabel: "8-B", percentage: 88, change: -3 },
  ],
  students: [
    { studentId: "student-rhea", studentName: "Rhea Kulkarni", classLabel: "6-A", percentage: 72, consecutiveAbsences: 2, repeatedAbsence: true },
    { studentId: "student-arjun", studentName: "Arjun Patil", classLabel: "7-B", percentage: 78, consecutiveAbsences: 1, repeatedAbsence: true },
    { studentId: "student-sana", studentName: "Sana Shaikh", classLabel: "8-A", percentage: 84, consecutiveAbsences: 0, repeatedAbsence: false },
    { studentId: "student-kabir", studentName: "Kabir Deshmukh", classLabel: "6-B", percentage: 86, consecutiveAbsences: 1, repeatedAbsence: false },
  ],
};

export const demoMarks: MarksOverview = {
  average: 68,
  highest: 96,
  lowest: 31,
  subjects: [
    { subject: "English", average: 74, change: 3 },
    { subject: "Science", average: 71, change: 8 },
    { subject: "Hindi", average: 69, change: 1 },
    { subject: "Mathematics", average: 61, change: -6 },
  ],
  students: [
    { studentId: "student-anaya", studentName: "Anaya Joshi", classLabel: "7-A", percentage: 91, status: "strong" },
    { studentId: "student-vihaan", studentName: "Vihaan Shah", classLabel: "8-B", percentage: 78, status: "strong" },
    { studentId: "student-sana", studentName: "Sana Shaikh", classLabel: "8-A", percentage: 49, status: "below_threshold" },
    { studentId: "student-om", studentName: "Om Jadhav", classLabel: "6-B", percentage: 56, status: "watch" },
  ],
};

export const demoTeacherUpdates: TeacherUpdate[] = [
  { id: "update-1", teacherName: "Anita Desai", createdAt: "2026-09-20T08:42:00.000Z", summary: "8-A: 7 students have not submitted the fractions worksheet.", classLabel: "8-A" },
  { id: "update-2", teacherName: "Rajesh Nair", createdAt: "2026-09-20T08:18:00.000Z", summary: "7-B: 6 students absent; revision of decimals completed.", classLabel: "7-B" },
  { id: "update-3", teacherName: "Nisha Verma", createdAt: "2026-09-19T15:30:00.000Z", summary: "6-A: Most students completed the reading activity.", classLabel: "6-A" },
];

export const demoChanges: ChangeSummary = {
  range: "last7",
  attendance: { current: 86, previous: 90, delta: -4, status: "down", note: "Today's attendance is below the previous seven-day average." },
  academics: { current: 68, previous: 65, delta: 3, status: "up", note: "Recorded class averages improved across the latest tests." },
  homework: { current: 17, previous: 12, delta: 5, status: "down", note: "Five more pending homework items were recorded." },
  teacherUpdates: { current: 14, previous: 11, delta: 3, status: "up", note: "Three more teacher updates were recorded this period." },
  studentIssues: { current: 4, previous: 4, delta: 0, status: "stable", note: "No change in the number of recorded student issues." },
};

export const demoStudents: Student[] = [
  { id: "student-rhea", name: "Rhea Kulkarni", classLabel: "6-A", rollNumber: "06", attendancePercent: 72 },
  { id: "student-arjun", name: "Arjun Patil", classLabel: "7-B", rollNumber: "14", attendancePercent: 78 },
  { id: "student-sana", name: "Sana Shaikh", classLabel: "8-A", rollNumber: "09", attendancePercent: 84 },
  { id: "student-kabir", name: "Kabir Deshmukh", classLabel: "6-B", rollNumber: "11", attendancePercent: 86 },
  { id: "student-anaya", name: "Anaya Joshi", classLabel: "7-A", rollNumber: "03", attendancePercent: 96 },
  { id: "student-vihaan", name: "Vihaan Shah", classLabel: "8-B", rollNumber: "18", attendancePercent: 93 },
];

export const demoTeachers: Teacher[] = [
  { id: "teacher-anita", name: "Anita Desai", email: "anita.desai@svm-demo.school", assignments: ["8-A · English", "8-B · English"] },
  { id: "teacher-rajesh", name: "Rajesh Nair", email: "rajesh.nair@svm-demo.school", assignments: ["7-A · Mathematics", "7-B · Mathematics"] },
  { id: "teacher-nisha", name: "Nisha Verma", email: "nisha.verma@svm-demo.school", assignments: ["6-A · Hindi", "6-B · Hindi"] },
];

export const demoClasses = ["6-A", "6-B", "7-A", "7-B", "8-A", "8-B"].map((label, index) => ({
  id: `class-${index + 1}`,
  label,
  studentCount: 24 + (index % 3),
  teacherCount: 2,
}));

export const demoIssueDetail: IssueDetail = {
  issue: demoInsights[0],
  timeline: [
    { date: "2026-09-14", label: "Seven-day baseline", detail: "Class 7-B attendance averaged 91% across the recorded days." },
    { date: "2026-09-19", label: "Previous school day", detail: "Class 7-B attendance was 89%." },
    { date: "2026-09-20", label: "Today", detail: "Class 7-B attendance is 76% based on the recorded register." },
  ],
  relatedStudents: demoStudents.filter((student) => student.classLabel === "7-B"),
};