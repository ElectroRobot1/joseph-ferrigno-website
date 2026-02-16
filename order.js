const SERVICES = {
  "lawn-mowing-weed-wacking": {
    name: "Lawn Mowing/Weed Wacking",
    description: "Provide the details below so I can quote and schedule your yard service.",
    needsHouseType: true
  },
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
  const selectedService = SERVICES[serviceKey] || SERVICES["lawn-mowing-weed-wacking"];

  const serviceTitle = document.getElementById("serviceTitle");
  const serviceDescription = document.getElementById("serviceDescription");
  const serviceNameField = document.getElementById("serviceNameField");
  const dynamicFields = document.getElementById("dynamicFields");
  const form = document.getElementById("orderForm");
  const submitMessage = document.getElementById("submitMessage");
  const emailField = form.elements.customerEmail;
  const phoneField = form.elements.customerPhone;

  serviceTitle.textContent = `${selectedService.name} Request`;
  serviceDescription.textContent = selectedService.description;
  serviceNameField.value = selectedService.name;

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

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const hasValidContactMethod = validateContactMethod();
    if (!hasValidContactMethod || !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitMessage.hidden = false;
    submitMessage.textContent = `Thanks. Your ${selectedService.name} request is ready to review.`;
  });
}

initializeOrderPage();
