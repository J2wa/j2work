const labels: Record<string, string> = {
  "Full-Time": "Full-time",
  "Part-Time": "Part-time",
  "Project-Basis": "Project-based",
  "Project-Based": "Project-based",
};

export function formatRoleLabel(label: string) {
  return Object.hasOwn(labels, label)
    ? labels[label]
    : label.replace(/\b[A-Z][a-z]+\b/g, (word, index) =>
        index === 0 ? word : word.toLowerCase(),
      );
}

export function formatLocation(location: string, remote: boolean) {
  return remote && !/\bremote\b/i.test(location)
    ? `${location} (Remote)`
    : location;
}
