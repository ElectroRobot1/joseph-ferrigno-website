// Contact form submission via Formspree.
// This keeps users on the page and shows status text inline.
const contactForm = document.getElementById("contactForm");
const contactFormStatus = document.getElementById("contactFormStatus");
const contactThankYouOverlay = document.getElementById("contactThankYouOverlay");
const closeContactThanks = document.getElementById("closeContactThanks");
const contactSubmissionTimestampIso = document.getElementById("contactSubmissionTimestampIso");
const contactSubmissionTimestampLocal = document.getElementById("contactSubmissionTimestampLocal");
const contactSubmissionId = document.getElementById("contactSubmissionId");

function buildSubmissionMetadata(prefix) {
  const now = new Date();
  const timestampIso = now.toISOString();

  // Produce a deterministic, timezone-explicit local timestamp in
  // ISO8601-like format with timezone offset (e.g. 2026-02-15T13:45:30.123-05:00).
  const pad = (n, width = 2) => String(n).padStart(width, "0");
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const milliseconds = pad(now.getMilliseconds(), 3);
  const tzOffsetMinutes = -now.getTimezoneOffset(); // minutes east of UTC
  const tzSign = tzOffsetMinutes >= 0 ? "+" : "-";
  const tzAbs = Math.abs(tzOffsetMinutes);
  const tzHours = pad(Math.floor(tzAbs / 60));
  const tzMinutes = pad(tzAbs % 60);
  const timestampLocal = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${tzSign}${tzHours}:${tzMinutes}`;

  const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  const submissionId = `${prefix}-${now.getTime()}-${randomSuffix}`;

  return {
    timestampIso,
    timestampLocal,
    submissionId
  };
}

function initializeStickyHero() {
  const heroHeader = document.querySelector(".home-page .hero-header");
  if (!heroHeader) {
    return;
  }

  const shrinkDistancePx = 260;
  let isTicking = false;

  const render = () => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const progress = Math.min(1, Math.max(0, scrollY / shrinkDistancePx));

    heroHeader.style.setProperty("--hero-progress", progress.toFixed(3));
    heroHeader.classList.toggle("is-condensed", progress > 0.08);
    isTicking = false;
  };

  const onViewportChange = () => {
    if (isTicking) {
      return;
    }

    isTicking = true;
    window.requestAnimationFrame(render);
  };

  render();
  window.addEventListener("scroll", onViewportChange, { passive: true });
  window.addEventListener("resize", onViewportChange);
}

initializeStickyHero();

function showContactSuccessScreen() {
  if (!contactThankYouOverlay) {
    return;
  }
  contactThankYouOverlay.hidden = false;
}

function hideContactSuccessScreen() {
  if (!contactThankYouOverlay) {
    return;
  }
  contactThankYouOverlay.hidden = true;
}

if (closeContactThanks) {
  closeContactThanks.addEventListener("click", hideContactSuccessScreen);
}

if (contactForm && contactFormStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Let browser validation run first for required fields.
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    // Build metadata so each submission has traceable timestamp and ID fields.
    const metadata = buildSubmissionMetadata("CONTACT");
    if (contactSubmissionTimestampIso) {
      contactSubmissionTimestampIso.value = metadata.timestampIso;
    }
    if (contactSubmissionTimestampLocal) {
      contactSubmissionTimestampLocal.value = metadata.timestampLocal;
    }
    if (contactSubmissionId) {
      contactSubmissionId.value = metadata.submissionId;
    }

    // Build FormData payload, including metadata fields.
    const formData = new FormData(contactForm);
    formData.set("submission_timestamp_iso", metadata.timestampIso);
    formData.set("submission_timestamp_local", metadata.timestampLocal);
    formData.set("submission_id", metadata.submissionId);

    contactFormStatus.textContent = "Sending...";
    contactFormStatus.className = "contact-form-status";

    // Guard against a missing Formspree endpoint URL.
    if (!contactForm.action.includes("formspree.io/f/")) {
      contactFormStatus.textContent =
        "Form endpoint is missing. Add your Formspree URL in index.html.";
      contactFormStatus.className = "contact-form-status error";
      return;
    }

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
        contactForm.reset();
        contactFormStatus.textContent = "";
        contactFormStatus.className = "contact-form-status";
        showContactSuccessScreen();
        return;
      }

      const errorPayload = await response.json().catch(() => null);
      const apiError =
        errorPayload &&
        Array.isArray(errorPayload.errors) &&
        errorPayload.errors.length > 0 &&
        errorPayload.errors[0].message;

      contactFormStatus.textContent =
        apiError || "Sorry, there was a problem sending your message. Please try again.";
      contactFormStatus.className = "contact-form-status error";
    } catch (error) {
      contactFormStatus.textContent =
        "Network error. Please check your connection and try again.";
      contactFormStatus.className = "contact-form-status error";
    }
  });
}
