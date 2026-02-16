// Contact form submission via Formspree.
// This keeps users on the page and shows status text inline.
const contactForm = document.getElementById("contactForm");
const contactFormStatus = document.getElementById("contactFormStatus");

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
        contactFormStatus.textContent = "Thanks. Your message was sent successfully.";
        contactFormStatus.className = "contact-form-status success";
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
