export type EntityFieldType = "text" | "textarea" | "select" | "number" | "date";

export type EntityFieldSchema = {
  key: string;
  label: string;
  type: EntityFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

export type EntityTypeSchema = {
  titleField?: string;
  descriptionField?: string;
  fields: EntityFieldSchema[];
  permissions?: {
    createRoles?: string[];
  };
};

export type WorkflowStepDefinition = {
  step: number;
  role: string;
  approverIds?: string[];
};

export function getEntitySchema(raw: unknown): EntityTypeSchema {
  if (!raw || typeof raw !== "object") {
    return { fields: [] };
  }

  const schema = raw as EntityTypeSchema;
  if (!Array.isArray(schema.fields)) {
    return { fields: [] };
  }

  return schema;
}

export function getWorkflowSteps(raw: unknown): WorkflowStepDefinition[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((step) => ({
      step: Number((step as WorkflowStepDefinition).step),
      role: String((step as WorkflowStepDefinition).role || "")
        .toUpperCase()
        .replace("APPROVER", "MEMBER"),
      approverIds: Array.isArray((step as WorkflowStepDefinition).approverIds)
        ? (step as WorkflowStepDefinition).approverIds!.map((id) => String(id)).filter(Boolean)
        : [],
    }))
    .filter((step) => Number.isFinite(step.step) && step.step > 0 && step.role.length > 0)
    .sort((a, b) => a.step - b.step);
}

export function getRecordFieldValue(data: Record<string, unknown>, key?: string) {
  if (!key) {
    return undefined;
  }
  return data[key];
}

export function getRecordTitle(data: Record<string, unknown>, schema: EntityTypeSchema) {
  const value = getRecordFieldValue(data, schema.titleField || "title");
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return "Untitled record";
}

export function getRecordDescription(data: Record<string, unknown>, schema: EntityTypeSchema) {
  const value = getRecordFieldValue(data, schema.descriptionField || "description");
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return "";
}

export function getCreateRoles(schema: EntityTypeSchema) {
  const roles = schema.permissions?.createRoles;
  if (!Array.isArray(roles)) {
    return [];
  }
  return roles.map((role) => String(role || "").toUpperCase()).filter(Boolean);
}
