"use client";

import { useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createEntityType } from "@/lib/actions/entity-types";

type FieldDraft = {
  id: string;
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "date";
  required: boolean;
  placeholder: string;
  options: string;
};

const ROLE_OPTIONS = ["MEMBER", "ADMIN"] as const;

export default function EntityTypeForm() {
  const [fields, setFields] = useState<FieldDraft[]>([
    {
      id: crypto.randomUUID(),
      key: "title",
      label: "Title",
      type: "text",
      required: true,
      placeholder: "Short summary",
      options: "",
    },
  ]);
  const [createRoles, setCreateRoles] = useState<string[]>(ROLE_OPTIONS.slice());
  const [titleField, setTitleField] = useState("title");
  const [descriptionField, setDescriptionField] = useState("description");
  const [state, formAction] = useFormState(createEntityType, {});

  const fieldPayload = useMemo(
    () =>
      JSON.stringify(
        fields.map((field) => ({
          key: field.key.trim(),
          label: field.label.trim(),
          type: field.type,
          required: field.required,
          placeholder: field.placeholder.trim() || undefined,
          options:
            field.type === "select"
              ? field.options
                  .split(",")
                  .map((option) => option.trim())
                  .filter(Boolean)
              : undefined,
        }))
      ),
    [fields]
  );

  const updateField = (id: string, partial: Partial<FieldDraft>) => {
    setFields((prev) => prev.map((field) => (field.id === id ? { ...field, ...partial } : field)));
  };

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        key: "",
        label: "",
        type: "text",
        required: false,
        placeholder: "",
        options: "",
      },
    ]);
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const toggleRole = (role: string) => {
    setCreateRoles((prev) =>
      prev.includes(role) ? prev.filter((item) => item !== role) : [...prev, role]
    );
  };

  const keyOptions = fields
    .map((field) => field.key.trim())
    .filter(Boolean);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="fields" value={fieldPayload} />
      <input type="hidden" name="createRoles" value={createRoles.join(",")} />

      <Card className="border-white/10 bg-black/40">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Entity type name</Label>
            <input
              id="name"
              name="name"
              className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Purchase Request"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title-field">Title field</Label>
              <select
                id="title-field"
                name="titleField"
                value={titleField}
                onChange={(event) => setTitleField(event.target.value)}
                className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a field</option>
                {keyOptions.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description-field">Description field</Label>
              <select
                id="description-field"
                name="descriptionField"
                value={descriptionField}
                onChange={(event) => setDescriptionField(event.target.value)}
                className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a field</option>
                {keyOptions.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Create permissions</Label>
            <div className="flex flex-wrap gap-3 text-sm">
              {ROLE_OPTIONS.map((role) => (
                <label key={role} className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={createRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="h-4 w-4 rounded border-white/20 bg-black"
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Fields</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addField}>
            Add field
          </Button>
        </div>
        <div className="space-y-4">
          {fields.map((field) => (
            <Card key={field.id} className="border-white/10 bg-black/40">
              <CardContent className="grid gap-4 p-4 md:grid-cols-6">
                <div className="space-y-1 md:col-span-2">
                  <Label>Key</Label>
                  <input
                    className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white"
                    value={field.key}
                    onChange={(event) => updateField(field.id, { key: event.target.value })}
                    placeholder="title"
                    required
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Label</Label>
                  <input
                    className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white"
                    value={field.label}
                    onChange={(event) => updateField(field.id, { label: event.target.value })}
                    placeholder="Title"
                    required
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <Label>Type</Label>
                  <select
                    className="h-10 w-full rounded-md border border-white/10 bg-black px-2 text-sm text-white"
                    value={field.type}
                    onChange={(event) =>
                      updateField(field.id, { type: event.target.value as FieldDraft["type"] })
                    }
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 md:col-span-1">
                  <label className="flex items-center gap-2 text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(event) => updateField(field.id, { required: event.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-black"
                    />
                    Required
                  </label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeField(field.id)}
                    disabled={fields.length === 1}
                  >
                    Remove
                  </Button>
                </div>
                <div className="space-y-1 md:col-span-3">
                  <Label>Placeholder</Label>
                  <input
                    className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white"
                    value={field.placeholder}
                    onChange={(event) => updateField(field.id, { placeholder: event.target.value })}
                    placeholder="Short summary"
                  />
                </div>
                {field.type === "select" ? (
                  <div className="space-y-1 md:col-span-3">
                    <Label>Options (comma separated)</Label>
                    <input
                      className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white"
                      value={field.options}
                      onChange={(event) => updateField(field.id, { options: event.target.value })}
                      placeholder="Hardware, Software"
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">Create entity type</Button>
        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state?.success ? <p className="text-sm text-emerald-300">Entity type created.</p> : null}
      </div>
    </form>
  );
}
