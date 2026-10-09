// Validation for contact form submissions. Pure functions so they are easy to test.

export const LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  subject: { min: 2, max: 150 },
  message: { min: 10, max: 5000 },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Header fields must not contain line breaks (prevents email header injection).
const LINE_BREAK_RE = /[\r\n]/;

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Returns { data, errors }. `errors` maps field name to a message and is empty
 * when the submission is valid. `isSpam` is true when the honeypot was filled.
 */
export function validateContact(body = {}) {
  const data = {
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    subject: clean(body.subject),
    message: clean(body.message),
  };
  const errors = {};

  for (const field of ["name", "subject", "message"]) {
    const { min, max } = LIMITS[field];
    const label = field[0].toUpperCase() + field.slice(1);
    if (!data[field]) errors[field] = `${label} is required.`;
    else if (data[field].length < min)
      errors[field] = `${label} must be at least ${min} characters.`;
    else if (data[field].length > max)
      errors[field] = `${label} must be at most ${max} characters.`;
  }

  if (!data.email) errors.email = "Email is required.";
  else if (data.email.length > LIMITS.email.max || !EMAIL_RE.test(data.email))
    errors.email = "Please enter a valid email address.";

  for (const field of ["name", "email", "subject"]) {
    if (!errors[field] && LINE_BREAK_RE.test(data[field]))
      errors[field] = "Line breaks are not allowed here.";
  }

  // Hidden field real users never see; bots tend to fill every input.
  const isSpam = clean(body.website) !== "";

  return { data, errors, isSpam };
}
