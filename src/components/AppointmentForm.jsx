import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Mail,
  MessageSquare,
  Phone,
  Stethoscope,
  UserRound,
} from "lucide-react";

const FORM_ID = import.meta.env.PUBLIC_FORMSPREE_FORM_ID;

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  department: "",
  preferredDate: "",
  preferredTime: "",
  message: "",
};

const departments = [
  { value: "general-medicine", label: "General Medicine" },
  { value: "cardiology", label: "Cardiology" },
  { value: "diagnostics", label: "Diagnostics" },
  { value: "emergency-care", label: "Emergency Care" },
  { value: "womens-health", label: "Women's Health" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "eye-care", label: "Eye Care" },
];

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AppointmentForm() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  const today = getToday();

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      preferredDate:
        current.preferredDate && current.preferredDate < today
          ? ""
          : current.preferredDate,
    }));
  }, [today]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }

    if (serverError) {
      setServerError("");
    }
  };

  const validate = () => {
    const newErrors = {};

    const name = formData.fullName.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name) {
      newErrors.fullName = "Please enter your full name.";
    } else if (name.length < 2) {
      newErrors.fullName = "Please enter a valid name.";
    } else if (name.length > 100) {
      newErrors.fullName = "Name must be less than 100 characters.";
    }

    if (!phone) {
      newErrors.phone = "Please enter your phone number.";
    } else if (!/^[+]?[0-9\s()-]{7,20}$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (!email) {
      newErrors.email = "Please enter your email address.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.department) {
      newErrors.department = "Please select a department.";
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = "Please select a preferred date.";
    } else if (formData.preferredDate < today) {
      newErrors.preferredDate = "Please select today or a future date.";
    }

    if (!formData.preferredTime) {
      newErrors.preferredTime = "Please select a preferred time.";
    }

    if (message.length > 2000) {
      newErrors.message = "Message must be less than 2000 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === "submitting") {
      return;
    }

    setServerError("");

    if (!FORM_ID) {
      setServerError(
        "The appointment form is not configured correctly. Please contact the hospital directly."
      );
      return;
    }

    if (!validate()) {
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch(
        `https://formspree.io/f/${FORM_ID}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            subject:
              "New Appointment Request - Health Vision Hospital",
            department: formData.department,
            preferredDate: formData.preferredDate,
            preferredTime: formData.preferredTime,
            message: formData.message.trim(),
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result?.errors?.length) {
          throw new Error(
            result.errors
              .map((error) => error.message)
              .join(" ")
          );
        }

        throw new Error(
          "Unable to send your appointment request."
        );
      }

      setStatus("success");
      setFormData(initialForm);
      setErrors({});
    } catch (error) {
      console.error("Appointment submission error:", error);

      setStatus("error");
      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  if (status === "success") {
    return (
      <div
        className="schedule-form"
        role="status"
        aria-live="polite"
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
            padding: "24px",
            borderRadius: "20px",
            border: "1px solid rgba(7, 87, 166, 0.10)",
            background:
              "linear-gradient(145deg, rgba(234,248,255,0.96), rgba(255,255,255,0.94))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 44px",
              width: "44px",
              height: "44px",
              borderRadius: "13px",
              color: "#0757a6",
              background: "#eaf8ff",
            }}
          >
            <CheckCircle2 size={23} strokeWidth={1.9} />
          </div>

          <div>
            <h3
              style={{
                margin: 0,
                color: "#102a43",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Appointment request sent
            </h3>

            <p
              style={{
                margin: "7px 0 0",
                color: "#60758b",
                fontSize: "13px",
                lineHeight: 1.7,
              }}
            >
              Thank you for contacting Health Vision Hospital.
              Our team will review your request and contact you
              to confirm the appointment.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="schedule-submit"
          onClick={() => setStatus("idle")}
          style={{ marginTop: "20px" }}
        >
          <span className="schedule-submit-text">
            Submit another request
          </span>

          <span className="schedule-submit-icon">
            <ArrowUpRight size={18} strokeWidth={1.9} />
          </span>
        </button>
      </div>
    );
  }

  return (
    <form
      className="schedule-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {/* NAME */}
      <div className="schedule-field">
        <label htmlFor="schedule-full-name">
          <UserRound size={16} strokeWidth={1.8} />
          Full Name
        </label>

        <div className="schedule-input-shell">
          <input
            id="schedule-full-name"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            maxLength={100}
            disabled={status === "submitting"}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={
              errors.fullName
                ? "schedule-full-name-error"
                : undefined
            }
            required
          />
        </div>

        {errors.fullName && (
          <p
            id="schedule-full-name-error"
            className="appointment-validation-error"
            role="alert"
          >
            {errors.fullName}
          </p>
        )}
      </div>

      {/* PHONE + EMAIL */}
      <div className="schedule-grid">
        <div className="schedule-field">
          <label htmlFor="schedule-phone">
            <Phone size={16} strokeWidth={1.8} />
            Phone Number
          </label>

          <div className="schedule-input-shell">
            <input
              id="schedule-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              maxLength={20}
              disabled={status === "submitting"}
              aria-invalid={Boolean(errors.phone)}
              required
            />
          </div>

          {errors.phone && (
            <p className="appointment-validation-error" role="alert">
              {errors.phone}
            </p>
          )}
        </div>

        <div className="schedule-field">
          <label htmlFor="schedule-email">
            <Mail size={16} strokeWidth={1.8} />
            Email Address
          </label>

          <div className="schedule-input-shell">
            <input
              id="schedule-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              maxLength={150}
              disabled={status === "submitting"}
              aria-invalid={Boolean(errors.email)}
              required
            />
          </div>

          {errors.email && (
            <p className="appointment-validation-error" role="alert">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* DEPARTMENT */}
      <div className="schedule-field">
        <label htmlFor="schedule-department">
          <Stethoscope size={16} strokeWidth={1.8} />
          Department
        </label>

        <div className="schedule-input-shell schedule-select-shell">
          <select
            id="schedule-department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            disabled={status === "submitting"}
            aria-invalid={Boolean(errors.department)}
            required
          >
            <option value="" disabled>
              Select department
            </option>

            {departments.map((department) => (
              <option
                key={department.value}
                value={department.value}
              >
                {department.label}
              </option>
            ))}
          </select>

          <span
            className="schedule-select-arrow"
            aria-hidden="true"
          >
            <ChevronDown size={16} strokeWidth={1.8} />
          </span>
        </div>

        {errors.department && (
          <p className="appointment-validation-error" role="alert">
            {errors.department}
          </p>
        )}
      </div>

      {/* DATE + TIME */}
      <div className="schedule-grid">
        <div className="schedule-field">
          <label htmlFor="schedule-date">
            <CalendarDays size={16} strokeWidth={1.8} />
            Preferred Date
          </label>

          <div className="schedule-input-shell">
            <input
              id="schedule-date"
              name="preferredDate"
              type="date"
              min={today}
              value={formData.preferredDate}
              onChange={handleChange}
              disabled={status === "submitting"}
              aria-invalid={Boolean(errors.preferredDate)}
              required
            />
          </div>

          {errors.preferredDate && (
            <p className="appointment-validation-error" role="alert">
              {errors.preferredDate}
            </p>
          )}
        </div>

        <div className="schedule-field">
          <label htmlFor="schedule-time">
            <Clock3 size={16} strokeWidth={1.8} />
            Preferred Time
          </label>

          <div className="schedule-input-shell">
            <input
              id="schedule-time"
              name="preferredTime"
              type="time"
              value={formData.preferredTime}
              onChange={handleChange}
              disabled={status === "submitting"}
              aria-invalid={Boolean(errors.preferredTime)}
              required
            />
          </div>

          {errors.preferredTime && (
            <p className="appointment-validation-error" role="alert">
              {errors.preferredTime}
            </p>
          )}
        </div>
      </div>

      {/* MESSAGE */}
      <div className="schedule-field">
        <label htmlFor="schedule-message">
          <MessageSquare size={16} strokeWidth={1.8} />
          Message
        </label>

        <div className="schedule-input-shell">
          <textarea
            id="schedule-message"
            name="message"
            rows="5"
            maxLength={2000}
            placeholder="Tell us anything we should know..."
            value={formData.message}
            onChange={handleChange}
            disabled={status === "submitting"}
            aria-invalid={Boolean(errors.message)}
          />
        </div>

        {errors.message && (
          <p className="appointment-validation-error" role="alert">
            {errors.message}
          </p>
        )}
      </div>

      {/* SERVER ERROR */}
      {status === "error" && serverError && (
        <div
          className="appointment-submit-error"
          role="alert"
          aria-live="assertive"
        >
          {serverError}
        </div>
      )}

      {/* SUBMIT */}
      <div className="schedule-submit-row">
        <button
          type="submit"
          className="schedule-submit"
          disabled={status === "submitting"}
          aria-busy={status === "submitting"}
        >
          <span className="schedule-submit-text">
            {status === "submitting"
              ? "Sending request..."
              : "Request Appointment"}
          </span>

          <span className="schedule-submit-icon">
            {status === "submitting" ? (
              <span
                className="appointment-spinner"
                aria-hidden="true"
              />
            ) : (
              <ArrowUpRight size={18} strokeWidth={1.9} />
            )}
          </span>
        </button>
      </div>

      <p className="schedule-form-note">
        <CheckCircle2 size={15} strokeWidth={2} />

        <span>
          Your appointment request will be reviewed by our hospital
          team.
        </span>
      </p>
    </form>
  );
}