// Demonstrationswerte: Eine echte Organisation müsste Geschäftsstellen-PLZ
// und aktive Krisengebiete aus einer verantworteten, aktuellen Quelle pflegen.
const OFFICE_POSTAL_PREFIX = "10";

const form = document.querySelector("#donation-form");
const pickupFields = document.querySelector("#pickup-fields");
const errorSummary = document.querySelector("#error-summary");
const errorList = document.querySelector("#error-list");
const confirmation = document.querySelector("#confirmation");
const details = document.querySelector("#confirmation-details");
const handoverInputs = [...document.querySelectorAll('input[name="handover"]')];

const fieldErrors = {
  clothing: document.querySelector("#clothing-error"),
  crisisArea: document.querySelector("#crisis-error"),
  street: document.querySelector("#street-error"),
  houseNumber: document.querySelector("#house-number-error"),
  postalCode: document.querySelector("#postal-code-error"),
  city: document.querySelector("#city-error"),
  pickupDate: document.querySelector("#pickup-date-error"),
  pickupTime: document.querySelector("#pickup-time-error"),
};

const fields = {
  clothing: document.querySelector("#clothing"),
  crisisArea: document.querySelector("#crisis-area"),
  street: document.querySelector("#street"),
  houseNumber: document.querySelector("#house-number"),
  postalCode: document.querySelector("#postal-code"),
  city: document.querySelector("#city"),
  pickupDate: document.querySelector("#pickup-date"),
  pickupTime: document.querySelector("#pickup-time"),
};

function selectedHandover() {
  return form.elements.handover.value;
}

function setPickupMode() {
  const isPickup = selectedHandover() === "pickup";
  pickupFields.hidden = !isPickup;
  for (const input of pickupFields.querySelectorAll("input")) {
    input.required = isPickup;
    input.disabled = !isPickup;
    if (!isPickup) {
      input.value = "";
      clearFieldError(input, fieldErrors[input.name]);
    }
  }
  clearErrors();
}

function clearFieldError(input, errorNode) {
  input.removeAttribute("aria-invalid");
  errorNode.textContent = "";
}

function clearErrors() {
  for (const [name, input] of Object.entries(fields)) {
    clearFieldError(input, fieldErrors[name]);
  }
  errorSummary.hidden = true;
  errorList.replaceChildren();
}

function setFieldError(input, errorNode, message, messages) {
  input.setAttribute("aria-invalid", "true");
  errorNode.textContent = message;
  messages.push({ input, message });
}

function validateForm() {
  clearErrors();
  const messages = [];
  const pickup = selectedHandover() === "pickup";

  if (!fields.clothing.value) {
    setFieldError(fields.clothing, fieldErrors.clothing, "Bitte wähle die Art der Kleidung aus.", messages);
  }
  if (!fields.crisisArea.value) {
    setFieldError(fields.crisisArea, fieldErrors.crisisArea, "Bitte wähle ein Krisengebiet aus.", messages);
  }

  if (pickup) {
    for (const [name, label] of [["street", "Bitte gib die Straße ein."], ["houseNumber", "Bitte gib die Hausnummer ein."], ["city", "Bitte gib den Ort ein."], ["pickupDate", "Bitte wähle einen Abholtermin."], ["pickupTime", "Bitte wähle eine Uhrzeit."]]) {
      if (!fields[name].value.trim()) setFieldError(fields[name], fieldErrors[name], label, messages);
    }

    const postalCode = fields.postalCode.value.trim();
    if (!/^[0-9]{5}$/.test(postalCode)) {
      setFieldError(fields.postalCode, fieldErrors.postalCode, "Die Postleitzahl muss aus genau fünf Ziffern bestehen.", messages);
    } else if (postalCode.slice(0, 2) !== OFFICE_POSTAL_PREFIX) {
      setFieldError(fields.postalCode, fieldErrors.postalCode, `Abholung ist nur im Bereich mit den Anfangsziffern ${OFFICE_POSTAL_PREFIX} möglich.`, messages);
    }
  }

  if (messages.length) {
    for (const { input, message } of messages) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${input.id}`;
      link.textContent = message;
      item.append(link);
      errorList.append(item);
    }
    errorSummary.hidden = false;
    errorSummary.focus();
    return false;
  }
  return true;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(year, month - 1, day));
}

function addDetail(label, value) {
  const row = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value;
  row.append(term, description);
  details.append(row);
}

function showConfirmation() {
  const pickup = selectedHandover() === "pickup";
  const submittedAt = new Date();
  details.replaceChildren();
  addDetail("Übergabeart", pickup ? "Abholung" : "Übergabe an der Geschäftsstelle");
  addDetail("Art der Kleidung", fields.clothing.value);
  addDetail("Krisengebiet", fields.crisisArea.value);
  addDetail("Datum", pickup ? formatDate(fields.pickupDate.value) : new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(submittedAt));
  addDetail("Uhrzeit", pickup ? fields.pickupTime.value : new Intl.DateTimeFormat("de-DE", { timeStyle: "short" }).format(submittedAt));
  addDetail("Ort", pickup ? `${fields.street.value.trim()} ${fields.houseNumber.value.trim()}, ${fields.postalCode.value.trim()} ${fields.city.value.trim()}` : "Geschäftsstelle (Beispielstandort: 10115)");
  form.closest(".form-section").hidden = true;
  document.querySelector("#ablauf").hidden = true;
  confirmation.hidden = false;
  confirmation.focus({ preventScroll: true });
  confirmation.scrollIntoView({ behavior: "smooth", block: "start" });
}

for (const input of handoverInputs) input.addEventListener("change", setPickupMode);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (validateForm()) showConfirmation();
});

document.querySelector("#new-registration").addEventListener("click", () => {
  form.reset();
  form.closest(".form-section").hidden = false;
  document.querySelector("#ablauf").hidden = false;
  confirmation.hidden = true;
  setPickupMode();
  document.querySelector("#form-title").scrollIntoView({ behavior: "smooth", block: "start" });
});

setPickupMode();
