"use client";

import { useMemo, useState } from "react";
import type { ArchiveItem } from "@/lib/content";
import { ArchiveCard } from "@/components/archive/ArchiveCard";

type ArchiveIndexProps = {
  items: ArchiveItem[];
};

type FilterKey = "type" | "status" | "confidence" | "year" | "tag" | "tool";
type Filters = Record<FilterKey, string>;

const emptyFilters: Filters = {
  type: "",
  status: "",
  confidence: "",
  year: "",
  tag: "",
  tool: "",
};

const filterLabels: Record<FilterKey, string> = {
  type: "type",
  status: "status",
  confidence: "confidence",
  year: "year",
  tag: "tag",
  tool: "tool",
};

export function ArchiveIndex({ items }: ArchiveIndexProps) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const activeFilters = (Object.keys(filterLabels) as FilterKey[])
    .filter((key) => filters[key])
    .map((key) => ({ key, label: filterLabels[key], value: filters[key] }));
  const hasActiveFilters = activeFilters.length > 0;

  const options = useMemo(
    () => ({
      type: uniqueSorted(items.map((item) => item.type)),
      status: uniqueSorted(items.map((item) => item.status)),
      confidence: uniqueSorted(items.map((item) => item.confidence)),
      year: uniqueSorted(items.map((item) => item.created.slice(0, 4))).sort((a, b) => b.localeCompare(a)),
      tag: uniqueSorted(items.flatMap((item) => item.tags)),
      tool: uniqueSorted(items.flatMap((item) => item.tools)),
    }),
    [items],
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        return (
          matches(filters.type, item.type) &&
          matches(filters.status, item.status) &&
          matches(filters.confidence, item.confidence) &&
          matches(filters.year, item.created.slice(0, 4)) &&
          matchesInList(filters.tag, item.tags) &&
          matchesInList(filters.tool, item.tools)
        );
      }),
    [filters, items],
  );

  function updateFilter(key: FilterKey, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilter(key: FilterKey) {
    setFilters((current) => ({ ...current, [key]: "" }));
  }

  return (
    <section className="archive-index" aria-labelledby="archive-index-title">
      <div className="archive-index-header">
        <div>
          <p className="section-label">full archive</p>
          <h1 id="archive-index-title">index</h1>
        </div>
        <p className="result-count" aria-live="polite">
          {filteredItems.length} of {items.length} records
        </p>
      </div>

      <form className="archive-filters">
        <fieldset>
          <legend>filter records</legend>
          {(Object.keys(filterLabels) as FilterKey[]).map((key) => (
            <label key={key}>
              <span>{filterLabels[key]}</span>
              <select value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)}>
                <option value="">all</option>
                {options[key].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button disabled={!hasActiveFilters} type="button" onClick={() => setFilters(emptyFilters)}>
            reset filters
          </button>
        </fieldset>
        {hasActiveFilters ? (
          <div aria-label="active filters" className="active-filters">
            {activeFilters.map((filter) => (
              <button key={filter.key} type="button" onClick={() => clearFilter(filter.key)}>
                <span>{filter.label}</span>
                <strong>{filter.value}</strong>
                <span aria-hidden="true">x</span>
              </button>
            ))}
          </div>
        ) : null}
      </form>

      {items.length === 0 ? (
        <p className="empty-state">no records have been published yet.</p>
      ) : filteredItems.length === 0 ? (
        <p className="empty-state" role="status">
          no matching records.
        </p>
      ) : (
        <ol className="record-list archive-index-list">
          {filteredItems.map((item) => (
            <li key={item.slug}>
              <ArchiveCard item={item} variant="row" />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function matches(filterValue: string, itemValue: string): boolean {
  return filterValue === "" || filterValue === itemValue;
}

function matchesInList(filterValue: string, itemValues: string[]): boolean {
  return filterValue === "" || itemValues.includes(filterValue);
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}
