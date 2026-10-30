const UPI_ID = "ananyapreet@fam";
const chips = document.querySelectorAll("#chips button");
const customWrap = document.getElementById("custom-wrap");
const custom = document.getElementById("custom");
const payLink = document.getElementById("pay-link");
const hint = document.getElementById("hint");
const alertEl = document.getElementById("alert");
const copyBtn = document.getElementById("copy");
const clearBtn = document.getElementById("clear");

let preset = null;

function rupees(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

function currentAmount() {
  if (preset === "other") {
    const n = Number.parseInt(custom.value.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return preset;
}

function upiLink(amount) {
  const parts = [
    "pa=" + UPI_ID,
    "pn=Ananya",
    "cu=INR",
    "tn=Amplifier%20for%20Ananya",
  ];
  if (amount && amount > 0) parts.push("am=" + amount.toFixed(2));
  return "upi://pay?" + parts.join("&");
}

const defaultHint =
  "On a phone this opens your UPI app with Ananya filled in. On a computer, scan the QR.";

function render() {
  const amount = currentAmount();
  const tooHigh = amount !== null && amount > 100000;
  const payAmount = amount !== null && !tooHigh ? amount : null;
  chips.forEach((button) => {
    const value = button.dataset.amount;
    const on = value === "other" ? preset === "other" : Number(value) === preset;
    button.setAttribute("aria-pressed", on ? "true" : "false");
  });
  customWrap.hidden = preset !== "other";
  alertEl.hidden = !tooHigh;
  payLink.textContent = "";
  payLink.append(payAmount ? "Pay " + rupees(payAmount) : "Open UPI payment");
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML =
    '<path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  payLink.append(icon);
  if (tooHigh) {
    payLink.setAttribute("href", "#pay");
  } else {
    payLink.setAttribute("href", upiLink(payAmount));
  }
}

chips.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.amount;
    preset = value === "other" ? "other" : Number(value);
    hint.textContent = defaultHint;
    render();
  });
});

custom.addEventListener("input", () => {
  custom.value = custom.value.replace(/[^\d]/g, "").slice(0, 6);
  hint.textContent = defaultHint;
  render();
});

clearBtn.addEventListener("click", () => {
  preset = null;
  custom.value = "";
  hint.textContent = defaultHint;
  render();
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(UPI_ID);
  } catch {
    const field = document.createElement("textarea");
    field.value = UPI_ID;
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
  copyBtn.textContent = "Copied";
  copyBtn.setAttribute("aria-label", "UPI ID copied");
  window.setTimeout(() => {
    copyBtn.textContent = "Copy";
    copyBtn.setAttribute("aria-label", "Copy UPI ID");
  }, 2000);
});

payLink.addEventListener("click", () => {
  if (payLink.getAttribute("href") === "#pay") return;
  window.setTimeout(() => {
    if (document.hasFocus()) {
      hint.textContent =
        "If a UPI app didn’t open, scan the QR or copy her UPI ID into GPay, PhonePe, Paytm, or BHIM.";
    }
  }, 1200);
});

render();
