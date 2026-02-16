// Contact form submission via Formspree.
// This keeps users on the page and shows status text inline.
const contactForm = document.getElementById("contactForm");
const contactFormStatus = document.getElementById("contactFormStatus");
const contactThankYouOverlay = document.getElementById("contactThankYouOverlay");
const closeContactThanks = document.getElementById("closeContactThanks");

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

    // Honeypot check: if this field is filled, treat it like spam.
    const formData = new FormData(contactForm);
    if (formData.get("_gotcha")) {
      contactFormStatus.textContent = "Thanks for your message.";
      contactFormStatus.className = "contact-form-status success";
      return;
    }

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
