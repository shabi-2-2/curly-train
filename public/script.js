function showForm(formId){
  document.querySelectorAll(".form-box").forEach(form => form.classList.remove("active"));
  document.getElementById(formId).classList.add("active");
}

document.getElementById("register-form-element").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const message = document.getElementById("register-message");
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  message.textContent = "Saving registration…";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new URLSearchParams(new FormData(form))
    });
    const result = await response.text();
    message.textContent = result;
    message.style.color = response.ok ? "#18794e" : "#c62828";

    if (response.ok) form.reset();
  } catch (error) {
    message.textContent = "Could not reach the server. Check that it is running and try again.";
    message.style.color = "#c62828";
  } finally {
    button.disabled = false;
  }
});
