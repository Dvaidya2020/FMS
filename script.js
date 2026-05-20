const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const enquiryForm = document.querySelector("#enquiryForm");
const formStatus = document.querySelector("#formStatus");

navToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

enquiryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!enquiryForm.reportValidity()) {
    return;
  }

  const formData = new FormData(enquiryForm);
  const payload = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    service: formData.get("service"),
    message: formData.get("message"),
  };

  const submitButton = enquiryForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  formStatus.textContent = "Sending your enquiry...";
  formStatus.className = "form-note";

  try {
    const response = await fetch("/api/enquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to send enquiry.");
    }

    enquiryForm.reset();
    formStatus.textContent = "Thank you. Your enquiry has been sent successfully.";
    formStatus.className = "form-note success";
  } catch (error) {
    formStatus.textContent = "Sorry, the enquiry could not be sent. Please try again or call us directly.";
    formStatus.className = "form-note error";
  } finally {
    submitButton.disabled = false;
  }
});
