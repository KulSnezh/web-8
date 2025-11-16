(() => {
  const openBtn = document.getElementById("openFormBtn");
  const popup = document.getElementById("popupOverlay");
  const form = document.getElementById("feedbackForm");
  const closeBtn = document.getElementById("popupCloseBtn");
  const messageBox = document.getElementById("formMessage");

  // Ключ для localStorage
  const STORAGE_KEY = "feedbackFormData";

  // Backend URL formcarry.com
  const FORM_ENDPOINT = "https://formcarry.com/s/smxHlaHYgKN";

  // Функция сохранения данных в localStorage
  function saveToStorage() {
    const formData = {
      fio: document.getElementById("fio").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      organization: document.getElementById("organization").value,
      message: document.getElementById("message").value,
      consent: document.getElementById("consent").checked,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }

  // Функция загрузки данных из localStorage
  function loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  // Заполнение формы из localStorage
  function fillFormFromStorage() {
    const data = loadFromStorage();
    if (!data) return;

    document.getElementById("fio").value = data.fio || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("phone").value = data.phone || "";
    document.getElementById("organization").value = data.organization || "";
    document.getElementById("message").value = data.message || "";
    document.getElementById("consent").checked = data.consent || false;
  }

  // Очистка данных формы
  function clearFormData() {
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
  }

  // Показать сообщение
  function showMessage(message, isSuccess) {
    messageBox.textContent = message;
    messageBox.className = isSuccess ? "success" : "error";
    
    setTimeout(() => {
      messageBox.textContent = "";
      messageBox.className = "";
    }, 5000);
  }

  // Проверка валидности формы
  function checkValidity() {
    return form.checkValidity();
  }

  // Обновление состояния кнопки отправки
  function updateSubmitButton() {
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = !checkValidity();
  }

  // Закрытие попапа
  function closePopup() {
    popup.classList.remove("active");
    document.body.style.overflow = "";
    messageBox.textContent = "";
    messageBox.className = "";

    // Удаляем обработчики
    form.removeEventListener("input", onInputChange);
    form.removeEventListener("change", onInputChange);
    document.removeEventListener("keydown", onKeyDown);
    popup.removeEventListener("click", onOutsideClick);
    form.removeEventListener("submit", onSubmit);
    document.getElementById("consent").removeEventListener("change", updateSubmitButton);
    
    Array.from(form.elements).forEach((el) => {
      if (el.type !== "submit" && el.type !== "button" && el.type !== "checkbox") {
        el.removeEventListener("input", updateSubmitButton);
      }
    });
    
    window.removeEventListener("popstate", onPopState);

    // Убираем параметр из URL
    if (window.location.hash === "#feedback") {
      history.back();
    }
  }

  // Обработчики событий
  function onOutsideClick(e) {
    if (e.target === popup) {
      closePopup();
    }
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      closePopup();
    }
  }

  function onInputChange() {
    saveToStorage();
    updateSubmitButton();
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!checkValidity()) {
      showMessage("Пожалуйста, заполните все обязательные поля правильно", false);
      return;
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    showMessage("Отправка...", true);

    const formData = new FormData(form);
    const data = {
      fio: formData.get("fio"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      organization: formData.get("organization"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.code === 200) {
        showMessage("Сообщение успешно отправлено!", true);
        clearFormData();
        
        setTimeout(() => {
          closePopup();
        }, 2000);
      } else {
        showMessage("Ошибка при отправке сообщения. Попробуйте еще раз.", false);
        submitBtn.disabled = false;
      }
    } catch (error) {
      console.error("Ошибка:", error);
      showMessage("Произошла ошибка при отправке. Проверьте подключение к интернету.", false);
      submitBtn.disabled = false;
    }
  }

  function onPopState(event) {
    if (!event.state || !event.state.modalOpen) {
      closePopup();
    }
  }

  // Открытие попапа
  function openPopup() {
    popup.classList.add("active");
    
    // Заполняем форму сохраненными данными
    fillFormFromStorage();

    // Меняем URL
    history.pushState({ modalOpen: true }, "", "#feedback");

    // Блокируем скролл body
    document.body.style.overflow = "hidden";

    // Фокусируем первое поле
    document.getElementById("fio").focus();

    // Обновляем состояние кнопки отправки
    updateSubmitButton();

    // Подписка на события
    form.addEventListener("input", onInputChange);
    form.addEventListener("change", onInputChange);
    document.addEventListener("keydown", onKeyDown);
    popup.addEventListener("click", onOutsideClick);
    form.addEventListener("submit", onSubmit);
    document.getElementById("consent").addEventListener("change", updateSubmitButton);
    
    Array.from(form.elements).forEach((el) => {
      if (el.type !== "submit" && el.type !== "button" && el.type !== "checkbox") {
        el.addEventListener("input", updateSubmitButton);
      }
    });

    window.addEventListener("popstate", onPopState);
  }

  // Назначение обработчиков событий
  openBtn.addEventListener("click", openPopup);
  closeBtn.addEventListener("click", closePopup);

  // Автооткрытие попапа при загрузке страницы с хэшем
  window.addEventListener("load", () => {
    if (window.location.hash === "#feedback") {
      openPopup();
    }
  });
})();