const lawnMowingWeedWhackingService = {
  name: "Lawn Mowing/Weed Whacking",
  description: "Provide the details below so I can quote and schedule your yard service.",
  needsHouseType: true
};

const SERVICES = {
  "lawn-mowing-weed-whacking": lawnMowingWeedWhackingService,
  // Keep legacy misspelling so older shared links still resolve.
  "lawn-mowing-weed-wacking": lawnMowingWeedWhackingService,
  "lawn-cleanup": {
    name: "Lawn Cleanup",
    description: "Share what kind of cleanup you need and any timing details."
  },
  "flower-watering": {
    name: "Flower Watering",
    description: "Let me know the schedule and any instructions for your flowers."
  },
  "snow-shoveling": {
    name: "Snow Shoveling",
    description: "Provide your home details and service needs so I can plan your snow service.",
    needsHouseType: true
  },
  "power-washing": {
    name: "Power Washing",
    description: "Share your home type and any specific surfaces you want cleaned.",
    needsHouseType: true
  },
  "window-cleaning": {
    name: "Window Cleaning",
    description: "Tell me about your home and window count to estimate scope.",
    needsHouseType: true,
    needsWindowCount: true
  },
  "moving-help": {
    name: "Moving Help",
    description: "Provide your home type and any moving details so I can estimate support.",
    needsHouseType: true
  },
  "babysitting": {
    name: "Babysitting",
    description: "Add child count and ages so I can plan appropriate support.",
    needsBabysittingSetup: true
  },
  "pet-sitting": {
    name: "Pet Sitting",
    description: "Add pet count and types so I can prepare for care needs.",
    needsPetSetup: true
  }
};

const HOUSE_OPTIONS = [
  "Single Family Home",
  "Town House",
  "Condo",
  "Other"
];

const PET_OPTIONS = [
  "Dog",
  "Cat",
  "Bird",
  "Fish",
  "Rabbit",
  "Hamster",
  "Guinea Pig",
  "Reptile",
  "Amphibian",
  "Other"
];

function buildSubmissionMetadata(prefix) {
  const now = new Date();
  const timestampIso = now.toISOString();

  // Deterministic local timestamp format with explicit timezone offset
  // Example: 2026-02-15T13:45:30.123-05:00
  const pad = (n, width = 2) => String(n).padStart(width, "0");
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const milliseconds = pad(now.getMilliseconds(), 3);
  const tzOffsetMinutes = -now.getTimezoneOffset();
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

function appendRequiredStar(labelElement) {
  const star = document.createElement("span");
  star.className = "required-star";
  star.setAttribute("aria-hidden", "true");
  star.textContent = " *";
  labelElement.appendChild(star);
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

function createDynamicGroup(title, description) {
  const group = document.createElement("div");
  group.className = "dynamic-group";

  const heading = document.createElement("h3");
  heading.textContent = title;
  group.appendChild(heading);

  if (description) {
    const detail = document.createElement("p");
    detail.textContent = description;
    group.appendChild(detail);
  }

  return group;
}

function createSliderControl(config) {
  const wrapper = document.createElement("label");
  wrapper.className = "field slider-field";

  const label = document.createElement("span");
  label.textContent = config.label;
  if (config.required) {
    appendRequiredStar(label);
  }
  wrapper.appendChild(label);

  const numberInput = document.createElement("input");
  numberInput.type = "number";
  numberInput.min = String(config.min);
  numberInput.max = String(config.max);
  numberInput.step = String(config.step || 1);
  numberInput.value = String(config.value);
  numberInput.name = `${config.name}_input`;
  wrapper.appendChild(numberInput);

  const rangeInput = document.createElement("input");
  rangeInput.type = "range";
  rangeInput.min = String(config.min);
  rangeInput.max = String(config.max);
  rangeInput.step = String(config.step || 1);
  rangeInput.value = String(config.value);
  rangeInput.name = config.name;
  wrapper.appendChild(rangeInput);

  const syncFromNumber = () => {
    const normalized = clamp(parseInt(numberInput.value, 10), config.min, config.max);
    numberInput.value = String(normalized);
    rangeInput.value = String(normalized);
  };

  const syncFromRange = () => {
    numberInput.value = rangeInput.value;
  };

  rangeInput.addEventListener("input", syncFromRange);
  numberInput.addEventListener("change", syncFromNumber);
  numberInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      syncFromNumber();
      numberInput.blur();
    }
  });

  return {
    wrapper,
    numberInput,
    rangeInput,
    getValue: () => parseInt(rangeInput.value, 10)
  };
}

function addHouseTypeFields(container) {
  const group = createDynamicGroup(
    "Property Type",
    "What type of house is it?"
  );

  const field = document.createElement("label");
  field.className = "field";

  const fieldLabel = document.createElement("span");
  fieldLabel.textContent = "House Type";
  appendRequiredStar(fieldLabel);
  field.appendChild(fieldLabel);

  const select = document.createElement("select");
  select.name = "houseType";
  select.required = true;

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select house type";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  HOUSE_OPTIONS.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText;
    option.textContent = optionText;
    select.appendChild(option);
  });

  field.appendChild(select);

  const otherInput = document.createElement("input");
  otherInput.className = "other-input";
  otherInput.type = "text";
  otherInput.name = "houseTypeOther";
  otherInput.placeholder = "Please enter your house type";
  otherInput.hidden = true;
  field.appendChild(otherInput);

  select.addEventListener("change", () => {
    const showOther = select.value === "Other";
    otherInput.hidden = !showOther;
    otherInput.required = showOther;
    if (!showOther) {
      otherInput.value = "";
    }
  });

  group.appendChild(field);
  container.appendChild(group);
}

function addWindowFields(container) {
  const group = createDynamicGroup(
    "Window Details",
    "How many windows?"
  );

  const windowsControl = createSliderControl({
    label: "How many windows?",
    min: 1,
    max: 80,
    value: 10,
    name: "windowCount",
    required: true
  });

  group.appendChild(windowsControl.wrapper);
  container.appendChild(group);
}

function addPetFields(container) {
  const group = createDynamicGroup(
    "Pet Details",
    "Select number of pets and the type for each one."
  );

  const petCountControl = createSliderControl({
    label: "How many pets?",
    min: 1,
    max: 12,
    value: 1,
    name: "petCount",
    required: true
  });

  group.appendChild(petCountControl.wrapper);

  const petTypesContainer = document.createElement("div");
  group.appendChild(petTypesContainer);

  const renderPetTypeFields = () => {
    const petCount = petCountControl.getValue();
    petTypesContainer.innerHTML = "";

    for (let index = 1; index <= petCount; index += 1) {
      const petTypeField = document.createElement("label");
      petTypeField.className = "field";

      const petLabel = document.createElement("span");
      petLabel.textContent = `Pet ${index} Type`;
      appendRequiredStar(petLabel);
      petTypeField.appendChild(petLabel);

      const select = document.createElement("select");
      select.name = `petType${index}`;
      select.required = true;

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Select pet type";
      placeholder.disabled = true;
      placeholder.selected = true;
      select.appendChild(placeholder);

      PET_OPTIONS.forEach((petOption) => {
        const option = document.createElement("option");
        option.value = petOption;
        option.textContent = petOption;
        select.appendChild(option);
      });

      petTypeField.appendChild(select);

      const otherInput = document.createElement("input");
      otherInput.className = "other-input";
      otherInput.type = "text";
      otherInput.name = `petTypeOther${index}`;
      otherInput.placeholder = "Please enter your pet type";
      otherInput.hidden = true;
      petTypeField.appendChild(otherInput);

      select.addEventListener("change", () => {
        const showOther = select.value === "Other";
        otherInput.hidden = !showOther;
        otherInput.required = showOther;
        if (!showOther) {
          otherInput.value = "";
        }
      });

      petTypesContainer.appendChild(petTypeField);
    }
  };

  petCountControl.rangeInput.addEventListener("input", renderPetTypeFields);
  petCountControl.numberInput.addEventListener("change", renderPetTypeFields);

  renderPetTypeFields();
  container.appendChild(group);
}

function addBabysittingFields(container) {
  const group = createDynamicGroup(
    "Babysitting Details",
    "Set child count, then provide ages for each child."
  );

  const childCountControl = createSliderControl({
    label: "How many kids?",
    min: 1,
    max: 10,
    value: 1,
    name: "kidCount",
    required: true
  });

  group.appendChild(childCountControl.wrapper);

  const agesContainer = document.createElement("div");
  group.appendChild(agesContainer);

  const renderAgeFields = () => {
    const childCount = childCountControl.getValue();
    agesContainer.innerHTML = "";

    for (let index = 1; index <= childCount; index += 1) {
      const ageControl = createSliderControl({
        label: `How old is child ${index}?`,
        min: 0,
        max: 17,
        value: 8,
        name: `child${index}Age`,
        required: true
      });
      agesContainer.appendChild(ageControl.wrapper);
    }
  };

  childCountControl.rangeInput.addEventListener("input", renderAgeFields);
  childCountControl.numberInput.addEventListener("change", renderAgeFields);

  renderAgeFields();
  container.appendChild(group);
}

function initializeOrderPage() {
  const params = new URLSearchParams(window.location.search);
  const serviceKey = params.get("service");
  const selectedService = SERVICES[serviceKey] || SERVICES["lawn-mowing-weed-whacking"];

  const serviceTitle = document.getElementById("serviceTitle");
  const serviceDescription = document.getElementById("serviceDescription");
  const serviceNameField = document.getElementById("serviceNameField");
  const dynamicFields = document.getElementById("dynamicFields");
  const form = document.getElementById("orderForm");
  const orderFormStatus = document.getElementById("orderFormStatus");
  const orderThankYouOverlay = document.getElementById("orderThankYouOverlay");
  const orderThankYouText = document.getElementById("orderThankYouText");
  const orderEmailConfirmNote = document.getElementById("orderEmailConfirmNote");
  const closeOrderThanks = document.getElementById("closeOrderThanks");
  const orderSubmissionTimestampIso = document.getElementById("orderSubmissionTimestampIso");
  const orderSubmissionTimestampLocal = document.getElementById("orderSubmissionTimestampLocal");
  const orderSubmissionId = document.getElementById("orderSubmissionId");
  const orderEmailForFormspree = document.getElementById("orderEmailForFormspree");
  const emailField = form.elements.customerEmail;
  const phoneField = form.elements.customerPhone;

  serviceTitle.textContent = `${selectedService.name} Request`;
  serviceDescription.textContent = selectedService.description;
  serviceNameField.value = selectedService.name;

  const showOrderSuccessScreen = (hasEmail) => {
    if (!orderThankYouOverlay) {
      return;
    }
    if (orderThankYouText) {
      orderThankYouText.textContent = `Your ${selectedService.name} request was delivered successfully.`;
    }
    if (orderEmailConfirmNote) {
      orderEmailConfirmNote.textContent = hasEmail
        ? "A confirmation email was sent. Please check your inbox and spam folder."
        : "No email was provided, so no confirmation email was sent.";
    }
    orderThankYouOverlay.hidden = false;
  };

  const hideOrderSuccessScreen = () => {
    if (!orderThankYouOverlay) {
      return;
    }
    orderThankYouOverlay.hidden = true;
  };

  if (closeOrderThanks) {
    closeOrderThanks.addEventListener("click", hideOrderSuccessScreen);
  }

  const validateContactMethod = () => {
    const hasEmail = emailField.value.trim().length > 0;
    const hasPhone = phoneField.value.trim().length > 0;
    const isValid = hasEmail || hasPhone;
    const message = "Please provide at least one contact method: email or phone.";

    emailField.setCustomValidity(isValid ? "" : message);
    phoneField.setCustomValidity(isValid ? "" : message);
    return isValid;
  };

  emailField.addEventListener("input", validateContactMethod);
  phoneField.addEventListener("input", validateContactMethod);

  if (selectedService.needsHouseType) {
    addHouseTypeFields(dynamicFields);
  }

  if (selectedService.needsWindowCount) {
    addWindowFields(dynamicFields);
  }

  if (selectedService.needsPetSetup) {
    addPetFields(dynamicFields);
  }

  if (selectedService.needsBabysittingSetup) {
    addBabysittingFields(dynamicFields);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const hasValidContactMethod = validateContactMethod();
    if (!hasValidContactMethod || !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    orderFormStatus.textContent = "Sending request...";
    orderFormStatus.className = "contact-form-status";

    if (!form.action.includes("formspree.io/f/")) {
      orderFormStatus.textContent =
        "Form endpoint is missing. Add your Formspree URL in order.html.";
      orderFormStatus.className = "contact-form-status error";
      return;
    }

    const trimmedEmail = emailField.value.trim();
    if (orderEmailForFormspree) {
      orderEmailForFormspree.value = trimmedEmail;
    }

    const metadata = buildSubmissionMetadata("ORDER");
    if (orderSubmissionTimestampIso) {
      orderSubmissionTimestampIso.value = metadata.timestampIso;
    }
    if (orderSubmissionTimestampLocal) {
      orderSubmissionTimestampLocal.value = metadata.timestampLocal;
    }
    if (orderSubmissionId) {
      orderSubmissionId.value = metadata.submissionId;
    }

    const formData = new FormData(form);
    formData.set("submission_timestamp_iso", metadata.timestampIso);
    formData.set("submission_timestamp_local", metadata.timestampLocal);
    formData.set("submission_id", metadata.submissionId);
    formData.set("email", trimmedEmail);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
        form.reset();
        if (orderEmailForFormspree) {
          orderEmailForFormspree.value = "";
        }
        orderFormStatus.textContent = "";
        showOrderSuccessScreen(trimmedEmail.length > 0);
        return;
      }

      const errorPayload = await response.json().catch(() => null);
      const apiError =
        errorPayload &&
        Array.isArray(errorPayload.errors) &&
        errorPayload.errors.length > 0 &&
        errorPayload.errors[0].message;

      orderFormStatus.textContent =
        apiError || "Sorry, there was a problem sending your request. Please try again.";
      orderFormStatus.className = "contact-form-status error";
    } catch (error) {
      orderFormStatus.textContent =
        "Network error. Please check your connection and try again.";
      orderFormStatus.className = "contact-form-status error";
    }
  });
}

initializeOrderPage();
