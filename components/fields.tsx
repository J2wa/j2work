"use client";
import { useId, useState } from "react";
import { Eye, EyeOff, UploadCloud, FileText, X } from "lucide-react";
import { resumeError } from "@/lib/validation";
export function Field({
  label,
  error,
  optional,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  optional?: boolean;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {optional ? <span>Optional</span> : null}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? id + "-error" : undefined}
        {...props}
      />
      {error ? (
        <p className="field-error" id={id + "-error"}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
export function PasswordField({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const [shown, setShown] = useState(false);
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>Password</label>
      <div className="password-wrap">
        <input
          id={id}
          type={shown ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={id + "-help"}
          {...props}
        />
        <button
          type="button"
          aria-label={shown ? "Hide password" : "Show password"}
          onClick={() => setShown(!shown)}
        >
          {shown ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <p id={id + "-help"} className={error ? "field-error" : "field-help"}>
        {error || "At least 12 characters. A memorable phrase works well."}
      </p>
    </div>
  );
}
export function ResumePicker({
  file,
  onChange,
  error,
  disabled = false,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const [drag, setDrag] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  function choose(f: File | null) {
    const e = resumeError(f);
    setLocalError(e);
    onChange(e ? null : f);
  }
  return (
    <div className="field">
      <label htmlFor={id}>
        Your resume <span>Required</span>
      </label>
      <div
        className={`upload-zone ${drag ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (!disabled) choose(e.dataTransfer.files[0] || null);
        }}
      >
        {file ? (
          <div className="selected-file">
            <FileText size={26} />
            <div>
              <strong>{file.name}</strong>
              <small>
                {(file.size / 1024 / 1024).toFixed(2)} MB · Ready to upload
              </small>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(null)}
              aria-label="Remove selected resume"
            >
              <X size={17} />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud size={28} strokeWidth={1.5} />
            <p>
              <strong>Choose a file</strong> or drag it here
            </p>
            <small>PDF or DOCX · Up to 5 MB</small>
          </>
        )}
        <input
          id={id}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          disabled={disabled}
          aria-invalid={Boolean(error || localError)}
          aria-describedby={id + "-help"}
          onChange={(e) => choose(e.target.files?.[0] || null)}
        />
      </div>
      <p
        id={id + "-help"}
        className={error || localError ? "field-error" : "field-help"}
      >
        {error ||
          localError ||
          "Stored privately and used for your applications."}
      </p>
    </div>
  );
}
