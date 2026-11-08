export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export function recruitmentEmail(input: {
  name: string;
  email: string;
  title: string;
  submittedAt: Date;
  reviewUrl: string;
}) {
  const date = input.submittedAt.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  });
  const lines = [
    "Hello ACES Intelligence Recruitment Team,",
    "A new job application has been submitted through the ACES Intelligence Careers Portal.",
    `Applicant Name: ${input.name}`,
    `Email: ${input.email}`,
    `Position: ${input.title}`,
    `Application Date: ${date} (Asia/Manila)`,
    "Status: Submitted",
    "Review the submitted resume and application details in the Admin Dashboard.",
  ];
  return {
    subject: `New Job Application — ${input.title} — ${input.name}`.replace(
      /[\r\n]/g,
      " ",
    ),
    text: `${lines.join("\n\n")}\n\nReview Application: ${input.reviewUrl}\n\nACES Intelligence Careers Portal`,
    html: `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:560px;margin:24px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px"><h1 style="font-size:22px;color:#2563eb">ACES Intelligence</h1>${lines.map((line) => `<p style="line-height:1.6;overflow-wrap:anywhere">${escapeHtml(line)}</p>`).join("")}<p><a href="${escapeHtml(input.reviewUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;border-radius:8px;padding:14px 20px;text-decoration:none">Review Application</a></p><p style="color:#64748b">Best regards,<br>ACES Intelligence Careers Portal</p></div></body></html>`,
  };
}
