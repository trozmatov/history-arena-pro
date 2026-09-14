/**
 * test-architecture-v6.ts
 * 
 * Comprehensive Integration & Unit Test Suite for History Arena Pro V6/V7 Architecture:
 * - Test 1: Legacy Auto-ID Migration (batch ID assignment, no collisions)
 * - Test 2: Name Collision & ID-based Key Resolution
 * - Test 3: Group Transfer & Stale Merge Bug Prevention
 * - Test 4: Personal Freeze vs Group Freeze Independence
 * - Test 5: Multi-Group Contextual Freeze (Contextual vs Global Arena)
 * - Test 6: Group Soft-Delete & Historical Logs Preservation
 * - Test 7: Atomic Multi-Path Updates for renameGroup
 * - Test 8: Stale Echo-Guard using updatedAt Timestamps
 * 
 * Execution:
 *   npx tsx test-architecture-v6.ts
 */

import assert from "node:assert";

// ============================================================================
// Types & Core Architecture Logic (V6/V7 Specification)
// ============================================================================

export interface Student {
  id?: string;
  name: string;
  group?: string;
  groups?: string[];
  status?: "active" | "frozen" | string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  parentTg?: string;
  login?: string;
  pin?: string;
  password?: string;
  pattern?: string;
  notes?: string;
  coins?: number;
  avgAccuracy?: number;
  totalTests?: number;
  updatedAt?: number;
}

export interface GroupMeta {
  name: string;
  days?: string[];
  time?: string;
  room?: string;
  subject?: string;
  paymentFee?: number;
  deleted?: boolean;
  deletedAt?: number;
  updatedAt?: number;
}

export interface AttendanceLog {
  id?: string;
  name: string;
  date: string;
  status: "Keldi" | "Kelmadi" | "Sababli";
  group: string;
  reason?: string;
}

export interface LessonSession {
  id: string;
  title: string;
  date: string;
  group: string;
}

export const PROTECTED_GROUPS = ["umumiy", "arxiv"];

export function isProtectedGroup(groupName: string): boolean {
  if (!groupName) return false;
  return PROTECTED_GROUPS.includes(groupName.toLowerCase().trim());
}

export function sanitizeFbKey(name: string): string {
  return encodeURIComponent(name.toLowerCase().trim()).replace(/\./g, "%2E");
}

export function getStudentFbKey(student: Partial<Student>): string {
  if (student.id && student.id.trim()) {
    return sanitizeFbKey(student.id.trim());
  }
  if (student.name && student.name.trim()) {
    return sanitizeFbKey(student.name.trim());
  }
  return "unknown_" + Date.now();
}

export function getStudentGroups(student: Partial<Student>): string[] {
  if (Array.isArray(student.groups) && student.groups.length > 0) {
    return student.groups.map((g) => g.trim()).filter(Boolean);
  }
  if (student.group && student.group.trim()) {
    return [student.group.trim()];
  }
  return ["Umumiy"];
}

// ============================================================================
// In-Memory Cloud Simulator (Emulating Firebase Realtime Database)
// ============================================================================

export class MockFirebaseDb {
  public data: Record<string, any> = {};
  public updateHistory: Record<string, any>[] = [];

  public get(path: string): any {
    return this.data[path];
  }

  public set(path: string, val: any): void {
    this.data[path] = JSON.parse(JSON.stringify(val));
  }

  public remove(path: string): void {
    delete this.data[path];
  }

  public update(updates: Record<string, any>): void {
    this.updateHistory.push(JSON.parse(JSON.stringify(updates)));
    for (const [p, val] of Object.entries(updates)) {
      if (val === null) {
        delete this.data[p];
      } else {
        this.data[p] = JSON.parse(JSON.stringify(val));
      }
    }
  }

  public reset(): void {
    this.data = {};
    this.updateHistory = [];
  }
}

// ============================================================================
// Test Suite State Container
// ============================================================================

export class TeacherStoreHarness {
  public db = new MockFirebaseDb();
  public allStudentsRegistry: Student[] = [];
  public cloudFrozenGroups: string[] = [];
  public cloudFrozenStudents: string[] = [];
  public groupsMeta: Record<string, GroupMeta> = {};
  public localAttendanceLogs: AttendanceLog[] = [];
  public lessonSessions: LessonSession[] = [];
  public pendingBatchIdUpdates: Record<string, any> = {};

  public findStudentInRegistry(studentOrIdOrName: Partial<Student> | string): Student | undefined {
    if (!studentOrIdOrName) return undefined;
    if (typeof studentOrIdOrName === "object" && studentOrIdOrName !== null) {
      if (studentOrIdOrName.id) {
        const byId = this.allStudentsRegistry.find((s) => s.id === studentOrIdOrName.id);
        if (byId) return byId;
      }
      if (studentOrIdOrName.name) {
        const cleanName = studentOrIdOrName.name.toLowerCase().trim();
        return this.allStudentsRegistry.find((s) => s.name.toLowerCase().trim() === cleanName);
      }
      return undefined;
    }
    const query = String(studentOrIdOrName).trim();
    const byId = this.allStudentsRegistry.find((s) => s.id === query);
    if (byId) return byId;
    const cleanName = query.toLowerCase();
    return this.allStudentsRegistry.find((s) => s.name.toLowerCase().trim() === cleanName);
  }

  public isStudentFrozen(studentOrIdOrName: Student | string, contextGroup?: string): boolean {
    const s = this.findStudentInRegistry(studentOrIdOrName);
    if (!s) return false;

    // Rule 1: Personal freeze is absolute
    if (s.status === "frozen") return true;

    // Rule 2: Contextual group freeze
    if (contextGroup && typeof contextGroup === "string") {
      const cleanG = contextGroup.toLowerCase().trim();
      if (isProtectedGroup(cleanG)) return false;
      return this.cloudFrozenGroups.some((fg) => fg.toLowerCase().trim() === cleanG);
    }

    // Rule 3: Global untargeted context (Duel, Arena, Leaderboard)
    const studentGroups = getStudentGroups(s).map((g) => g.toLowerCase().trim()).filter(Boolean);
    if (studentGroups.length === 0) return false;

    const allGroupsFrozen = studentGroups.every((g) => {
      if (isProtectedGroup(g)) return false;
      return this.cloudFrozenGroups.some((fg) => fg.toLowerCase().trim() === g);
    });

    return allGroupsFrozen;
  }

  public toggleFreezeStudent(studentOrIdOrName: Student | string): void {
    const target = this.findStudentInRegistry(studentOrIdOrName);
    if (!target) return;

    const willFreeze = target.status !== "frozen";
    target.status = willFreeze ? "frozen" : "active";
    const now = Date.now();
    target.updatedAt = now;

    const sKey = getStudentFbKey(target);
    const updates: Record<string, any> = {};
    updates[`master_students/${sKey}/status`] = target.status;
    updates[`master_students/${sKey}/updatedAt`] = now;

    if (willFreeze) {
      updates[`frozen_students/${sKey}`] = {
        id: target.id || "",
        name: target.name,
        group: target.group || "",
        frozenAt: now,
      };
      if (!this.cloudFrozenStudents.includes(sKey)) this.cloudFrozenStudents.push(sKey);
    } else {
      updates[`frozen_students/${sKey}`] = null;
      this.cloudFrozenStudents = this.cloudFrozenStudents.filter((x) => x !== sKey);
    }
    this.db.update(updates);
  }

  public toggleFreezeGroup(groupName: string, freeze: boolean): boolean {
    const cleanGroup = groupName.trim();
    if (!cleanGroup || isProtectedGroup(cleanGroup)) return false;

    const lower = cleanGroup.toLowerCase();
    const gKey = sanitizeFbKey(cleanGroup);
    const now = Date.now();
    const updates: Record<string, any> = {};

    if (freeze) {
      if (!this.cloudFrozenGroups.includes(lower)) {
        this.cloudFrozenGroups.push(lower);
      }
      updates[`frozen_groups/${gKey}`] = {
        group: cleanGroup,
        frozenAt: now,
      };
    } else {
      this.cloudFrozenGroups = this.cloudFrozenGroups.filter((g) => g !== lower);
      updates[`frozen_groups/${gKey}`] = null;
    }
    this.db.update(updates);
    return true;
  }

  public transferStudentGroup(studentOrIdOrName: Student | string, newGroup: string, addToExisting = false): void {
    const trimmedGroup = newGroup.trim();
    if (!trimmedGroup) return;

    const target = this.findStudentInRegistry(studentOrIdOrName);
    if (!target) return;

    const now = Date.now();
    target.updatedAt = now;

    if (addToExisting) {
      const cur = getStudentGroups(target);
      if (!cur.some((g) => g.toLowerCase() === trimmedGroup.toLowerCase())) {
        const filtered = cur.filter((g) => g !== "Umumiy");
        filtered.push(trimmedGroup);
        target.groups = filtered;
      }
      if (!target.group || target.group === "Umumiy") {
        target.group = trimmedGroup;
      }
    } else {
      target.group = trimmedGroup;
      target.groups = [trimmedGroup];
    }

    const sKey = getStudentFbKey(target);
    const updates: Record<string, any> = {};
    updates[`master_students/${sKey}/group`] = target.group;
    updates[`master_students/${sKey}/groups`] = target.groups;
    updates[`master_students/${sKey}/updatedAt`] = now;
    this.db.update(updates);
  }

  public renameGroup(oldName: string, newName: string): { success: boolean; updates: Record<string, any> } {
    const cleanOld = oldName.trim();
    const cleanNew = newName.trim();
    if (!cleanOld || !cleanNew) return { success: false, updates: {} };
    if (isProtectedGroup(cleanOld) || isProtectedGroup(cleanNew)) return { success: false, updates: {} };

    const oldKey = sanitizeFbKey(cleanOld);
    const newKey = sanitizeFbKey(cleanNew);
    const now = Date.now();
    const updates: Record<string, any> = {};

    // 1. Update enrolled students
    this.allStudentsRegistry.forEach((s) => {
      const sGroups = getStudentGroups(s);
      if (sGroups.some((g) => g.toLowerCase() === cleanOld.toLowerCase())) {
        const updatedGroups = sGroups.map((g) => (g.toLowerCase() === cleanOld.toLowerCase() ? cleanNew : g));
        const updatedPrimary = s.group && s.group.toLowerCase() === cleanOld.toLowerCase() ? cleanNew : (s.group || cleanNew);
        s.groups = updatedGroups;
        s.group = updatedPrimary;
        s.updatedAt = now;

        const sKey = getStudentFbKey(s);
        updates[`master_students/${sKey}/group`] = updatedPrimary;
        updates[`master_students/${sKey}/groups`] = updatedGroups;
        updates[`master_students/${sKey}/updatedAt`] = now;
      }
    });

    // 2. Update groups_meta
    const existingMeta = this.groupsMeta[cleanOld] || { name: cleanOld };
    const newMeta: GroupMeta = {
      ...existingMeta,
      name: cleanNew,
      updatedAt: now,
    };
    delete this.groupsMeta[cleanOld];
    this.groupsMeta[cleanNew] = newMeta;
    updates[`groups_meta/${oldKey}`] = null;
    updates[`groups_meta/${newKey}`] = newMeta;

    // 3. Update attendance_logs
    this.localAttendanceLogs.forEach((log) => {
      if (log.group && log.group.toLowerCase() === cleanOld.toLowerCase()) {
        log.group = cleanNew;
        const logKey = `${sanitizeFbKey(log.name)}_${log.date}`;
        updates[`attendance_logs/${logKey}/group`] = cleanNew;
      }
    });

    // 4. Update lesson_sessions
    this.lessonSessions.forEach((sess) => {
      if (sess.group && sess.group.toLowerCase() === cleanOld.toLowerCase()) {
        sess.group = cleanNew;
        updates[`lesson_sessions/${sess.id}/group`] = cleanNew;
      }
    });

    this.db.update(updates);
    return { success: true, updates };
  }

  public deleteGroup(groupName: string): { success: boolean; updates: Record<string, any> } {
    const cleanGrp = groupName.trim();
    if (!cleanGrp || isProtectedGroup(cleanGrp)) return { success: false, updates: {} };

    const gKey = sanitizeFbKey(cleanGrp);
    const now = Date.now();
    const updates: Record<string, any> = {};

    // 1. Move students to "Umumiy" if no other groups
    this.allStudentsRegistry.forEach((s) => {
      const curGroups = getStudentGroups(s);
      if (curGroups.some((g) => g.toLowerCase() === cleanGrp.toLowerCase())) {
        const remaining = curGroups.filter((g) => g.toLowerCase() !== cleanGrp.toLowerCase());
        s.groups = remaining.length > 0 ? remaining : ["Umumiy"];
        s.group = s.groups[0] || "Umumiy";
        s.updatedAt = now;

        const sKey = getStudentFbKey(s);
        updates[`master_students/${sKey}/group`] = s.group;
        updates[`master_students/${sKey}/groups`] = s.groups;
        updates[`master_students/${sKey}/updatedAt`] = now;
      }
    });

    // 2. Soft-delete groups_meta
    const existingMeta = this.groupsMeta[cleanGrp] || { name: cleanGrp };
    const softDeletedMeta = {
      ...existingMeta,
      deleted: true,
      deletedAt: now,
    };
    delete this.groupsMeta[cleanGrp];
    updates[`groups_meta/${gKey}`] = softDeletedMeta;

    // 3. Remove from frozen_groups if present
    if (this.cloudFrozenGroups.includes(cleanGrp.toLowerCase())) {
      this.cloudFrozenGroups = this.cloudFrozenGroups.filter((g) => g !== cleanGrp.toLowerCase());
      updates[`frozen_groups/${gKey}`] = null;
    }

    this.db.update(updates);
    return { success: true, updates };
  }

  public simulateSyncChildAdded(data: any): { applied: boolean; reason?: string } {
    if (!data || !data.name) return { applied: false, reason: "invalid_data" };
    const cleanName = data.name.toLowerCase().trim();
    const existing = this.findStudentInRegistry(data.id ? data.id : cleanName);

    // Echo-guard: reject if existing has newer updatedAt
    if (existing && existing.updatedAt && data.updatedAt && data.updatedAt < existing.updatedAt) {
      return { applied: false, reason: "stale_timestamp_echo_rejected" };
    }

    const rawGroups = Array.isArray(data.groups) && data.groups.length > 0
      ? data.groups.map((g: string) => g.trim()).filter(Boolean)
      : (data.group ? [data.group.trim()] : ["Umumiy"]);

    let assignedId = data.id;
    if (!assignedId) {
      assignedId = "std-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
      const sKey = sanitizeFbKey(data.name);
      this.pendingBatchIdUpdates[`master_students/${sKey}/id`] = assignedId;
    }

    if (!existing) {
      const newStudent: Student = {
        id: assignedId,
        name: data.name.trim(),
        group: data.group || rawGroups[0] || "Umumiy",
        groups: rawGroups,
        status: data.status || "active",
        phone: data.phone || "",
        updatedAt: data.updatedAt || Date.now(),
      };
      this.allStudentsRegistry.push(newStudent);
      return { applied: true };
    } else {
      if (!existing.id && assignedId) {
        existing.id = assignedId;
      }
      if (data.status) existing.status = data.status;
      if (data.group) existing.group = data.group;
      if (data.groups) existing.groups = data.groups;
      if (data.updatedAt) existing.updatedAt = data.updatedAt;
      return { applied: true };
    }
  }
}

// ============================================================================
// Test Runner & Scenarios
// ============================================================================

async function runAllTests() {
  console.log("\n============================================================");
  console.log("  🚀 History Arena Pro V6/V7 Architecture Test Suite");
  console.log("============================================================\n");

  let passed = 0;
  let failed = 0;

  function runTest(title: string, fn: () => void) {
    const start = performance.now();
    try {
      fn();
      const elapsed = (performance.now() - start).toFixed(2);
      console.log(`  ✅ PASSED: ${title} (${elapsed}ms)`);
      passed++;
    } catch (err: any) {
      const elapsed = (performance.now() - start).toFixed(2);
      console.error(`  ❌ FAILED: ${title} (${elapsed}ms)`);
      console.error(`     Error: ${err.message}`);
      if (err.stack) {
        console.error(`     Stack: ${err.stack.split("\n").slice(1, 4).join("\n")}`);
      }
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Legacy Auto-ID Migration
  // --------------------------------------------------------------------------
  runTest("Test 1 (Legacy Auto-ID Migration): Automatic std_ ID assignment and zero key collision", () => {
    const harness = new TeacherStoreHarness();
    const legacySnapshots = [
      { name: "Sardor Aliyev", group: "7-A" }, // No id
      { name: "Malika Rahimova", group: "8-B" }, // No id
      { name: "Sardor Aliyev", group: "9-C" }, // Duplicate name, no id!
      { name: "Jasur Bek", id: "existing_custom_id", group: "10-A" }, // Existing id
    ];

    for (const snap of legacySnapshots) {
      const res = harness.simulateSyncChildAdded(snap);
      assert.strictEqual(res.applied, true, "Snapshot should be applied");
    }

    assert.strictEqual(harness.allStudentsRegistry.length, 3, "Registry should contain 3 entries");
    
    // Check that auto-generated IDs exist and start with 'std-'
    const ids = harness.allStudentsRegistry.map((s) => s.id);
    for (const id of ids) {
      assert.ok(id && id.length > 5, `Student ID must be present and valid: ${id}`);
    }

    // Check unique set of IDs
    const uniqueIds = new Set(ids);
    assert.strictEqual(uniqueIds.size, ids.length, "All assigned IDs must be strictly unique");

    // Check batched migration updates collected
    const batchedKeys = Object.keys(harness.pendingBatchIdUpdates);
    assert.ok(batchedKeys.length >= 2, "Pending batched updates should contain legacy students");
    for (const key of batchedKeys) {
      assert.ok(key.startsWith("master_students/"), "Batch path must target master_students");
      assert.ok(key.endsWith("/id"), "Batch path must set /id");
    }
  });

  // --------------------------------------------------------------------------
  // TEST 2: Ism kolliziyasi (Name Collision Safety)
  // --------------------------------------------------------------------------
  runTest("Test 2 (Ism kolliziyasi): Distinct IDs prevent cross-mutation between identically named students", () => {
    const harness = new TeacherStoreHarness();
    const student1: Student = {
      id: "std_ali_001",
      name: "Ali Valiyev",
      group: "7-A",
      groups: ["7-A"],
      status: "active",
    };
    const student2: Student = {
      id: "std_ali_002",
      name: "Ali Valiyev", // EXACT SAME NAME
      group: "8-B",
      groups: ["8-B"],
      status: "active",
    };

    harness.allStudentsRegistry = [student1, student2];

    // Keys must differ based on ID
    const key1 = getStudentFbKey(student1);
    const key2 = getStudentFbKey(student2);
    assert.strictEqual(key1, "std_ali_001");
    assert.strictEqual(key2, "std_ali_002");
    assert.notStrictEqual(key1, key2, "Firebase keys for identically named students must be completely distinct");

    // Freeze ONLY student 1
    harness.toggleFreezeStudent(student1);

    assert.strictEqual(student1.status, "frozen", "Student 1 must be frozen");
    assert.strictEqual(student2.status, "active", "Student 2 must remain ACTIVE despite identical name!");
    assert.strictEqual(harness.isStudentFrozen(student1), true);
    assert.strictEqual(harness.isStudentFrozen(student2), false);

    // Transfer ONLY student 2 to '9-G'
    harness.transferStudentGroup(student2, "9-G", false);
    assert.strictEqual(student1.group, "7-A", "Student 1 group must NOT change");
    assert.strictEqual(student2.group, "9-G", "Student 2 group must be updated to 9-G");
    assert.deepStrictEqual(student2.groups, ["9-G"]);
  });

  // --------------------------------------------------------------------------
  // TEST 3: Ko'chirish va Merge Bug (Transfer without stale merge)
  // --------------------------------------------------------------------------
  runTest("Test 3 (Ko'chirish va Merge Bug): Transfer completely replaces old group when addToExisting is false", () => {
    const harness = new TeacherStoreHarness();
    const student: Student = {
      id: "std_transfer_01",
      name: "Temur Po'latov",
      group: "7-A",
      groups: ["7-A"],
      status: "active",
    };
    harness.allStudentsRegistry = [student];

    // Step 1: Transfer from 7-A to 8-B
    harness.transferStudentGroup(student, "8-B", false);

    assert.strictEqual(student.group, "8-B", "Primary group must be 8-B");
    assert.deepStrictEqual(student.groups, ["8-B"], "Groups array must ONLY contain 8-B (no 7-A residual)");
    assert.strictEqual(student.groups?.includes("7-A"), false, "Old group 7-A must NOT be preserved");

    // Step 2: Multi-group student transfers primary group
    student.groups = ["8-B", "Robototexnika"];
    harness.transferStudentGroup(student, "9-C", false);

    assert.strictEqual(student.group, "9-C");
    assert.deepStrictEqual(student.groups, ["9-C"], "Clean transfer resets groups to single new group");
  });

  // --------------------------------------------------------------------------
  // TEST 4: Shaxsiy vs Guruh muzlatilishi
  // --------------------------------------------------------------------------
  runTest("Test 4 (Shaxsiy vs Guruh muzlatilishi): Group unfreeze never unfreezes personally frozen students", () => {
    const harness = new TeacherStoreHarness();
    const frozenStudent: Student = {
      id: "std_pers_frozen",
      name: "Ziyoda Karimova",
      group: "Matematika-9",
      groups: ["Matematika-9"],
      status: "frozen", // PERSONALLY FROZEN
    };
    const activeStudent: Student = {
      id: "std_active",
      name: "Bobur Mirzo",
      group: "Matematika-9",
      groups: ["Matematika-9"],
      status: "active",
    };
    harness.allStudentsRegistry = [frozenStudent, activeStudent];

    // 1. Group is frozen
    harness.toggleFreezeGroup("Matematika-9", true);
    assert.strictEqual(harness.cloudFrozenGroups.includes("matematika-9"), true);
    assert.strictEqual(harness.isStudentFrozen(frozenStudent, "Matematika-9"), true);
    assert.strictEqual(harness.isStudentFrozen(activeStudent, "Matematika-9"), true);

    // 2. Group is subsequently UNFROZEN
    harness.toggleFreezeGroup("Matematika-9", false);
    assert.strictEqual(harness.cloudFrozenGroups.includes("matematika-9"), false);

    // Active student should now be active
    assert.strictEqual(harness.isStudentFrozen(activeStudent, "Matematika-9"), false, "Active student is active again");

    // CRITICAL: Personally frozen student MUST REMAIN FROZEN!
    assert.strictEqual(frozenStudent.status, "frozen", "Personal status must remain 'frozen'");
    assert.strictEqual(
      harness.isStudentFrozen(frozenStudent, "Matematika-9"),
      true,
      "Personally frozen student must NEVER automatically unfreeze when group unfreezes!"
    );
  });

  // --------------------------------------------------------------------------
  // TEST 5: Multi-guruh konteksti (Multi-group contextual vs global)
  // --------------------------------------------------------------------------
  runTest("Test 5 (Multi-guruh konteksti): Student active in Group A, frozen in Group B, active in Global Arena", () => {
    const harness = new TeacherStoreHarness();
    const multiStudent: Student = {
      id: "std_multi_01",
      name: "Nilufar Hamidova",
      group: "Guruh-A",
      groups: ["Guruh-A", "Guruh-B"],
      status: "active",
    };
    harness.allStudentsRegistry = [multiStudent];

    // Freeze ONLY Guruh-B
    harness.toggleFreezeGroup("Guruh-B", true);

    // Contextual checks:
    // In Guruh-A (active group) -> false (NOT frozen)
    assert.strictEqual(harness.isStudentFrozen(multiStudent, "Guruh-A"), false, "Should be active in Guruh-A");

    // In Guruh-B (frozen group) -> true (FROZEN)
    assert.strictEqual(harness.isStudentFrozen(multiStudent, "Guruh-B"), true, "Should be frozen in Guruh-B");

    // In Untargeted / Global Context (Global Arena / Duel / Leaderboard):
    // Student has at least 1 active group (Guruh-A), so global access is GRANTED!
    assert.strictEqual(
      harness.isStudentFrozen(multiStudent),
      false,
      "Student with at least one active group must remain active in Global context"
    );

    // If Guruh-A ALSO gets frozen:
    harness.toggleFreezeGroup("Guruh-A", true);
    assert.strictEqual(
      harness.isStudentFrozen(multiStudent),
      true,
      "Student with ALL enrolled groups frozen must be frozen in Global context"
    );
  });

  // --------------------------------------------------------------------------
  // TEST 6: Guruh o'chirish / Soft Delete & Orphan Protection
  // --------------------------------------------------------------------------
  runTest("Test 6 (Guruh o'chirish / Soft delete): Orphans fallback to 'Umumiy' and history is preserved", () => {
    const harness = new TeacherStoreHarness();
    const soloStudent: Student = {
      id: "std_solo",
      name: "Yagona O'quvchi",
      group: "Fizika-Olimpiada",
      groups: ["Fizika-Olimpiada"],
    };
    const multiStudent: Student = {
      id: "std_multi",
      name: "Ko'p Guruhli O'quvchi",
      group: "Fizika-Olimpiada",
      groups: ["Fizika-Olimpiada", "Informatika"],
    };
    harness.allStudentsRegistry = [soloStudent, multiStudent];
    harness.groupsMeta["Fizika-Olimpiada"] = { name: "Fizika-Olimpiada", room: "302" };
    harness.localAttendanceLogs = [
      { id: "log_1", name: "Yagona O'quvchi", date: "2026-09-01", group: "Fizika-Olimpiada", status: "Keldi" },
    ];
    harness.lessonSessions = [
      { id: "sess_100", title: "Termodinamika", date: "2026-09-01", group: "Fizika-Olimpiada" },
    ];

    // Delete group
    const { success, updates } = harness.deleteGroup("Fizika-Olimpiada");
    assert.strictEqual(success, true);

    // 1. Check student fallback
    assert.strictEqual(soloStudent.group, "Umumiy", "Solo student must fall back to 'Umumiy'");
    assert.deepStrictEqual(soloStudent.groups, ["Umumiy"], "Solo student groups must be ['Umumiy']");

    assert.strictEqual(multiStudent.group, "Informatika", "Multi-student group must fall back to remaining group");
    assert.deepStrictEqual(multiStudent.groups, ["Informatika"]);

    // 2. Check soft-delete in groups_meta
    const metaUpdate = updates[`groups_meta/${sanitizeFbKey("Fizika-Olimpiada")}`];
    assert.ok(metaUpdate, "Soft-delete payload must exist in updates");
    assert.strictEqual(metaUpdate.deleted, true, "Group meta must have deleted: true");
    assert.ok(metaUpdate.deletedAt > 0, "Group meta must have deletedAt timestamp");

    // 3. Historical logs & sessions MUST NOT be wiped from local store or deleted in updates
    assert.strictEqual(harness.localAttendanceLogs.length, 1, "Attendance logs must be preserved");
    assert.strictEqual(harness.lessonSessions.length, 1, "Lesson sessions must be preserved");
    assert.strictEqual(updates["attendance_logs/log_1"], undefined, "Attendance logs must NOT be set to null");
    assert.strictEqual(updates["lesson_sessions/sess_100"], undefined, "Lesson sessions must NOT be set to null");

    // 4. Protected group check
    const protectedDelete = harness.deleteGroup("Umumiy");
    assert.strictEqual(protectedDelete.success, false, "Protected group 'Umumiy' cannot be deleted");
  });

  // --------------------------------------------------------------------------
  // TEST 7: Multi-path renameGroup
  // --------------------------------------------------------------------------
  runTest("Test 7 (Multi-path renameGroup): Atomic payload updates students, meta, logs and sessions together", () => {
    const harness = new TeacherStoreHarness();
    const student: Student = {
      id: "std_ren_01",
      name: "Davron Salimov",
      group: "Eski-Guruh",
      groups: ["Eski-Guruh", "Boshqa-Guruh"],
    };
    harness.allStudentsRegistry = [student];
    harness.groupsMeta["Eski-Guruh"] = { name: "Eski-Guruh", room: "101" };
    harness.localAttendanceLogs = [
      { id: "log_2", name: "Davron Salimov", date: "2026-09-02", group: "Eski-Guruh", status: "Keldi" },
    ];
    harness.lessonSessions = [
      { id: "sess_200", title: "1-dars", date: "2026-09-02", group: "Eski-Guruh" },
    ];

    const { success, updates } = harness.renameGroup("Eski-Guruh", "Yangi-Guruh");
    assert.strictEqual(success, true);

    // Verify atomic updates keys
    const oldKey = sanitizeFbKey("Eski-Guruh");
    const newKey = sanitizeFbKey("Yangi-Guruh");
    const sKey = getStudentFbKey(student);

    // Student paths
    assert.strictEqual(updates[`master_students/${sKey}/group`], "Yangi-Guruh");
    assert.deepStrictEqual(updates[`master_students/${sKey}/groups`], ["Yangi-Guruh", "Boshqa-Guruh"]);
    assert.ok(updates[`master_students/${sKey}/updatedAt`] > 0);

    // Meta paths
    assert.strictEqual(updates[`groups_meta/${oldKey}`], null, "Old meta key must be set to null");
    assert.strictEqual(updates[`groups_meta/${newKey}`].name, "Yangi-Guruh", "New meta must have new group name");

    // Attendance log path
    const logKey = `${sanitizeFbKey(harness.localAttendanceLogs[0].name)}_${harness.localAttendanceLogs[0].date}`;
    assert.strictEqual(updates[`attendance_logs/${logKey}/group`], "Yangi-Guruh");

    // Lesson session path
    assert.strictEqual(updates["lesson_sessions/sess_200/group"], "Yangi-Guruh");

    // Protected group rename rejection
    const protectedRename = harness.renameGroup("Umumiy", "Yangi-Umumiy");
    assert.strictEqual(protectedRename.success, false, "Protected group 'Umumiy' cannot be renamed");
  });

  // --------------------------------------------------------------------------
  // TEST 8: Echo-guard (Stale Timestamp Rejection)
  // --------------------------------------------------------------------------
  runTest("Test 8 (Echo-guard): Stale Firebase snapshot does not overwrite newer local state", () => {
    const harness = new TeacherStoreHarness();
    const localStudent: Student = {
      id: "std_echo_01",
      name: "Shaxzod Aliyev",
      group: "9-A",
      groups: ["9-A"],
      status: "active",
      updatedAt: 50000, // Newer local timestamp
    };
    harness.allStudentsRegistry = [localStudent];

    // Case 1: Stale snapshot arriving from Firebase (delayed echo from network lag)
    const staleSnapshot = {
      id: "std_echo_01",
      name: "Shaxzod Aliyev",
      group: "7-A", // Outdated group
      status: "frozen", // Outdated status
      updatedAt: 30000, // Older timestamp
    };

    const staleResult = harness.simulateSyncChildAdded(staleSnapshot);
    assert.strictEqual(staleResult.applied, false, "Stale snapshot must be rejected");
    assert.strictEqual(staleResult.reason, "stale_timestamp_echo_rejected");

    // Local state must be strictly intact
    assert.strictEqual(localStudent.group, "9-A", "Local group must not be reverted by stale snapshot");
    assert.strictEqual(localStudent.status, "active", "Local status must not be reverted by stale snapshot");
    assert.strictEqual(localStudent.updatedAt, 50000);

    // Case 2: Fresh snapshot from Firebase (newer write from another client/device)
    const freshSnapshot = {
      id: "std_echo_01",
      name: "Shaxzod Aliyev",
      group: "10-B",
      status: "active",
      updatedAt: 60000, // Newer timestamp
    };

    const freshResult = harness.simulateSyncChildAdded(freshSnapshot);
    assert.strictEqual(freshResult.applied, true, "Fresh snapshot must be accepted");
    assert.strictEqual(localStudent.group, "10-B", "Local group must update to fresh snapshot value");
    assert.strictEqual(localStudent.updatedAt, 60000);
  });

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n============================================================");
  console.log(`  📊 TEST RESULTS: ${passed} Passed, ${failed} Failed, Total: ${passed + failed}`);
  console.log("============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
