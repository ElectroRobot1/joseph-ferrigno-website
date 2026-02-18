const lawnServices = {
  name: "Lawn Services",
  description: "Provide details below to request lawn mowing, weed whacking, and lawn cleanup support.",
  needsHouseType: true
};

const SERVICES = {
  "lawn-services": lawnServices,
  "flower-watering": {
    name: "Flower Watering",
    description: "Share schedule preferences and any instructions for flower care.",
    supportsMultiDayDateRange: true
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
    description: "Provide home type and moving details so I can estimate support.",
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
    needsPetSetup: true,
    supportsMultiDayDateRange: true
  },
  "website-editing": {
    name: "Website Editing",
    description: "Describe website updates needed and preferred timeline."
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
  const wrapper = document.createElement("div");
  wrapper.className = "field slider-field";

  // Create a separate <label> associated with the range control via htmlFor
  const label = document.createElement("label");
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
  // generate a unique id to associate the label with the range input
  const uid = `${config.name}_${Math.random().toString(36).slice(2, 8)}`;
  rangeInput.id = uid;
  label.htmlFor = uid;
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

    // Build a map of existing values keyed by index to preserve user input
    const existing = {};
    petTypesContainer.querySelectorAll('select[name^="petType"]').forEach((s) => {
      const m = s.name.match(/^petType(\d+)$/);
      if (m) {
        const idx = Number(m[1]);
        existing[idx] = existing[idx] || {};
        existing[idx].type = s.value;
        const other = petTypesContainer.querySelector(`input[name="petTypeOther${idx}"]`);
        if (other) {
          existing[idx].other = other.value;
        }
      }
    });

    // Remove extra fields if petCount decreased
    const existingIndices = Array.from(petTypesContainer.querySelectorAll('select[name^="petType"]')).map((s) => {
      const m = s.name.match(/^petType(\d+)$/);
      return m ? Number(m[1]) : null;
    }).filter(Boolean);
    const maxExisting = existingIndices.length ? Math.max(...existingIndices) : 0;
    for (let i = maxExisting; i > petCount; i -= 1) {
      const node = petTypesContainer.querySelector(`select[name="petType${i}"]`);
      if (node && node.parentElement) {
        petTypesContainer.removeChild(node.parentElement);
      }
    }

    // Create or restore fields up to petCount
    for (let index = 1; index <= petCount; index += 1) {
      // If field already exists, ensure option list and otherInput state are correct
      let existingSelect = petTypesContainer.querySelector(`select[name="petType${index}"]`);
      if (!existingSelect) {
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
        existingSelect = select;
      }

      // Restore existing values if present
      const existingVal = existing[index] && existing[index].type;
      const otherVal = existing[index] && existing[index].other;
      if (existingVal) {
        // If option exists, set it; otherwise, set to Other and populate other input
        const optionExists = Array.from(existingSelect.options).some(o => o.value === existingVal);
        if (optionExists) {
          existingSelect.value = existingVal;
          const otherInput = petTypesContainer.querySelector(`input[name="petTypeOther${index}"]`);
          if (otherInput) {
            otherInput.hidden = true;
            otherInput.required = false;
            otherInput.value = "";
          }
        } else {
          existingSelect.value = "Other";
          const otherInput = petTypesContainer.querySelector(`input[name="petTypeOther${index}"]`);
          if (otherInput) {
            otherInput.hidden = false;
            otherInput.required = true;
            otherInput.value = otherVal || existingVal;
          }
        }
      }
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

    // Preserve existing age values keyed by index
    const existing = {};
    agesContainer.querySelectorAll('input[name^="child"]').forEach((inp) => {
      const m = inp.name.match(/^child(\d+)Age(?:_input)?$/);
      if (m) {
        const idx = Number(m[1]);
        // prefer numeric value if parseable
        const v = parseInt(inp.value, 10);
        if (!Number.isNaN(v)) {
          existing[idx] = v;
        }
      }
    });

    // Remove extra fields if childCount decreased
    const existingIndices = Array.from(agesContainer.querySelectorAll('input[name^="child"]')).map(i => {
      const m = i.name.match(/^child(\d+)Age(?:_input)?$/);
      return m ? Number(m[1]) : null;
    }).filter(Boolean);
    const maxExisting = existingIndices.length ? Math.max(...existingIndices) : 0;
    for (let i = maxExisting; i > childCount; i -= 1) {
      const node = agesContainer.querySelector(`input[name="child${i}Age"]`);
      if (node && node.parentElement) {
        agesContainer.removeChild(node.parentElement);
      }
    }

    // Create or restore fields up to childCount
    for (let index = 1; index <= childCount; index += 1) {
      const preserved = existing[index] !== undefined ? existing[index] : 8;
      const existingWrapper = agesContainer.querySelector(`input[name="child${index}Age"]`);
      if (existingWrapper) {
        // already present, ensure value preserved
        const numberInput = agesContainer.querySelector(`input[name="child${index}Age_input"]`);
        const rangeInput = agesContainer.querySelector(`input[name="child${index}Age"]`);
        if (numberInput) numberInput.value = String(preserved);
        if (rangeInput) rangeInput.value = String(preserved);
        continue;
      }

      const ageControl = createSliderControl({
        label: `How old is child ${index}?`,
        min: 0,
        max: 17,
        value: preserved,
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

function initializeDateFields(selectedService) {
  const primaryDateLabel = document.getElementById("primaryDateLabel");
  const primaryDateInput = document.getElementById("primaryDateInput");
  const multiDayToggleField = document.getElementById("multiDayToggleField");
  const multiDayToggle = document.getElementById("multiDayToggle");
  const endDateField = document.getElementById("endDateField");
  const endDateInput = document.getElementById("endDateInput");

  if (
    !primaryDateLabel ||
    !primaryDateInput ||
    !multiDayToggleField ||
    !multiDayToggle ||
    !endDateField ||
    !endDateInput
  ) {
    return;
  }

  const applyMultiDayState = () => {
    const isMultiDay = multiDayToggle.checked;
    primaryDateLabel.textContent = isMultiDay ? "Start Date" : "Preferred Date";
    primaryDateInput.name = isMultiDay ? "startDate" : "preferredDate";
    endDateField.hidden = !isMultiDay;
    endDateInput.required = isMultiDay;

    if (!isMultiDay) {
      endDateInput.value = "";
    }
  };

  if (selectedService.supportsMultiDayDateRange) {
    multiDayToggleField.hidden = false;
    multiDayToggle.checked = false;
    multiDayToggle.disabled = false;
    applyMultiDayState();
    multiDayToggle.onchange = applyMultiDayState;
    return;
  }

  multiDayToggle.onchange = null;
  multiDayToggle.checked = false;
  multiDayToggle.disabled = true;
  multiDayToggleField.hidden = true;
  primaryDateLabel.textContent = "Preferred Date";
  primaryDateInput.name = "preferredDate";
  endDateField.hidden = true;
  endDateInput.required = false;
  endDateInput.value = "";
}

function initializeOrderPage() {
  const params = new URLSearchParams(window.location.search);
  const serviceKey = params.get("service");
  const selectedService = SERVICES[serviceKey] || SERVICES["lawn-services"];

  const serviceTitle = document.getElementById("serviceTitle");
  const serviceDescription = document.getElementById("serviceDescription");
  const serviceNameField = document.getElementById("serviceNameField");
  const dynamicFields = document.getElementById("dynamicFields");
  const form = document.getElementById("orderForm");
  const orderFormStatus = document.getElementById("orderFormStatus");
  const orderThankYouOverlay = document.getElementById("orderThankYouOverlay");
  const orderThankYouText = document.getElementById("orderThankYouText");
  const closeOrderThanks = document.getElementById("closeOrderThanks");
  const orderSubmissionTimestampIso = document.getElementById("orderSubmissionTimestampIso");
  const orderSubmissionTimestampLocal = document.getElementById("orderSubmissionTimestampLocal");
  const orderSubmissionId = document.getElementById("orderSubmissionId");

  // Validate required DOM elements to avoid runtime exceptions later
  if (!form || !dynamicFields || !serviceTitle || !orderFormStatus) {
    console.error("Order page initialization failed: missing required DOM elements (form, dynamicFields, serviceTitle, or orderFormStatus). Aborting initialization.");
    return;
  }

  if (!form.elements || !form.elements.customerEmail || !form.elements.customerPhone) {
    console.error("Order form is missing expected contact fields: customerEmail and/or customerPhone. Aborting initialization.");
    return;
  }

  const emailField = form.elements.customerEmail;
  const phoneField = form.elements.customerPhone;

  serviceTitle.textContent = `${selectedService.name} Request`;
  if (serviceDescription) {
    serviceDescription.textContent = selectedService.description;
  }
  if (serviceNameField) {
    serviceNameField.value = selectedService.name;
  }

  const showOrderSuccessScreen = () => {
    if (!orderThankYouOverlay) {
      return;
    }
    if (orderThankYouText) {
      orderThankYouText.textContent = `Your ${selectedService.name} request was delivered successfully.`;
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

  initializeDateFields(selectedService);

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
        initializeDateFields(selectedService);
        orderFormStatus.textContent = "";
        showOrderSuccessScreen();
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
