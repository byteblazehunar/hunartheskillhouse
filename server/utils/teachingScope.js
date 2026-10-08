function normalizeAssignment(value) {
  if (typeof value === "string") return value.trim().toLowerCase();
  if (value && typeof value === "object") {
    return String(value.name || value.batch || value._id || value.id || "").trim().toLowerCase();
  }
  return "";
}

export function resolveTeacherBatches(batches, staff, user) {
  const staffIdentity = new Set(
    [staff?.name, staff?.staffId, user?.name, user?.assignedId]
      .map(normalizeAssignment)
      .filter(Boolean)
  );
  const explicitBatches = new Set(
    (Array.isArray(staff?.assignedBatches) ? staff.assignedBatches : [])
      .map(normalizeAssignment)
      .filter(Boolean)
  );

  return batches.filter((batch) => {
    const batchKeys = [batch.name, batch._id, batch.id].map(normalizeAssignment).filter(Boolean);
    return batchKeys.some((key) => explicitBatches.has(key)) ||
      staffIdentity.has(normalizeAssignment(batch.assignedTeacher));
  });
}
