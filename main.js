// URL развёрнутого Google Apps Script Web App
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw4DR1Y1zDckHOAiU0t7a1_gfW0aTNyORflUcC8yxFDI3OqB0o_FPslGye33J5_UyQ1/exec";

document.addEventListener("DOMContentLoaded", () => {
  const quickForm = document.getElementById("quickForm");
  const requestForm = document.getElementById("requestForm");
  const configInput = document.getElementById("configInput");

  document.querySelectorAll("[data-config]").forEach((link) => {
    link.addEventListener("click", () => {
      const config = link.getAttribute("data-config");
      if (configInput && config) {
        configInput.value = config;
      }
    });
  });

  if (quickForm) {
    quickForm.addEventListener("submit", (event) => handleSubmit(event, quickForm));
  }

  if (requestForm) {
    requestForm.addEventListener("submit", (event) => handleSubmit(event, requestForm));
  }
});

async function handleSubmit(event, form) {
  event.preventDefault();

  const statusEl = form.querySelector(".form-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!form.checkValidity()) {
    form.reportValidity();
    setStatus(statusEl, "Пожалуйста, заполните обязательные поля корректно.", "error");
    return;
  }

  if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes("PASTE_YOUR")) {
    setStatus(statusEl, "Не настроен URL Apps Script. Укажите GAS_WEB_APP_URL в main.js.", "error");
    return;
  }

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.pageUrl = window.location.href;
  payload.submittedAt = new Date().toISOString();

  try {
    setLoading(submitBtn, true);
    setStatus(statusEl, "Отправляем заявку...", "");

    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let result = {};
    try {
      result = JSON.parse(text);
    } catch (_) {
      // Apps Script иногда возвращает текстовый ответ
    }

    if (!response.ok || result.ok === false) {
      throw new Error(result.error || "Не удалось отправить заявку");
    }

    form.reset();
    setStatus(statusEl, "Заявка отправлена! Мы свяжемся с вами в ближайшее время.", "success");
  } catch (error) {
    console.error("Ошибка отправки формы:", error);
    setStatus(statusEl, "Ошибка отправки. Попробуйте ещё раз или свяжитесь по телефону.", "error");
  } finally {
    setLoading(submitBtn, false);
  }
}

function setStatus(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove("success", "error");
  if (type) {
    element.classList.add(type);
  }
}

function setLoading(button, isLoading) {
  if (!button) return;
  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }
  button.disabled = isLoading;
  button.textContent = isLoading ? "Отправка..." : button.dataset.originalText;
}
