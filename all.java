  
<script>
(() => {
  const openBtn = document.getElementById('openFormBtn');
  const popup = document.getElementById('popupOverlay');
  const form = document.getElementById('feedbackForm');
  const closeBtn = document.getElementById('popupCloseBtn');
  const messageBox = document.getElementById('formMessage');

  const STORAGE_KEY = 'feedbackFormData';

  function saveToStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  
  function loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch(e) {
      return null;
    }
  }

  function fillFormFromStorage() {
    const data = loadFromStorage();
    if (!data) return;

    for (const [key, value] of Object.entries(data)) {
      const el = form.elements[key];
      if (!el) continue;

      if (el.type === 'checkbox') {
        el.checked = value === true || value === 'true';
      } else {
        el.value = value || '';
      }
    }
  }

  function collectFormData() {
    const data = {};
    
    Array.from(form.elements).forEach(el => {
      if (!el.name) return;

      if (el.type === 'checkbox') {
        data[el.name] = el.checked;
      } else if (el.type !== 'submit' && el.type !== 'button') {
        data[el.name] = el.value.trim();
      }
    });

    return data;
  }

  function checkValidity() {
    return form.checkValidity();
  }

  function openPopup() {
    popup.classList.add('active');
    
    fillFormFromStorage();

 const newUrl = new URL(window.location);
 if (!newUrl.searchParams.has('feedback')) {
  newUrl.searchParams.set('feedback', '1');
  history.pushState({popupOpen:true}, '', newUrl);
 }

 document.body.style.overflow = 'hidden';

 form.elements['fio'].focus();

 updateSubmitButton();

 messageBox.textContent = '';
 messageBox.className = '';

 form.addEventListener('input', onInputChange);
 form.addEventListener('change', onInputChange);
 document.addEventListener('keydown', onKeyDown);
 popup.addEventListener('click', onOutsideClick);
 form.addEventListener('submit', onSubmit);
 form.elements['consent'].addEventListener('change', updateSubmitButton);
 Array.from(form.elements).forEach(el => {
  if(el.type !== 'submit' && el.type !== 'button' && el.type !== 'checkbox') {
   el.addEventListener('input', updateSubmitButton);
  }
 });
 window.addEventListener('popstate', onPopState);
}

function updateSubmitButton() {
 const submitBtn = form.querySelector('button[type=submit]');
 submitBtn.disabled = !checkValidity();
}

function closePopup() {
 popup.classList.remove('active');
 document.body.style.overflow = '';
 messageBox.textContent = '';
 messageBox.className = '';

 form.removeEventListener('input', onInputChange);
 form.removeEventListener('change', onInputChange);
 document.removeEventListener('keydown', onKeyDown);
 popup.removeEventListener('click', onOutsideClick);
 form.removeEventListener('submit', onSubmit);
 form.elements['consent'].removeEventListener('change', updateSubmitButton);
 Array.from(form.elements).forEach(el => {
  if(el.type !== 'submit' && el.type !== 'button' && el.type !== 'checkbox') {
   el.removeEventListener('input', updateSubmitButton);
  }
 });
 window.removeEventListener('popstate', onPopState);

 const currentUrl = new URL(window.location);
 if(currentUrl.searchParams.has('feedback')) {
  currentUrl.searchParams.delete('feedback');
  history.pushState({}, '', currentUrl.pathname + currentUrl.search + currentUrl.hash);
 }

 form.reset();

 localStorage.removeItem(STORAGE_KEY);
}

openBtn.addEventListener('click', () => {
 openPopup();
});

closeBtn.addEventListener('click', () => {
 closePopup();
});

function onOutsideClick(e) {
 if(e.target === popup) { 
  closePopup();
 }
}

function onKeyDown(e) {
 if(e.key === 'Escape') {
  closePopup();
 }
}

function onInputChange() {
 const data = collectFormData();
 saveToStorage(data);

 updateSubmitButton();
}

function onSubmit(e) {
 e.preventDefault();

 if (!checkValidity()) return;
 const submitBtn = form.querySelector('button[type=submit]');
 submitBtn.disabled = true;

 messageBox.textContent = 'Отправка...';
 messageBox.className = '';

 // задержка
 setTimeout(() => {
  messageBox.textContent = 'Спасибо! Ваше сообщение отправлено.';
  messageBox.className = 'success';
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  submitBtn.disabled = false;

  // Можно закрыть форму через некоторое время
  // setTimeout(closePopup,3000);

 },1000);
}

function onPopState(event) {
 const urlParams = new URLSearchParams(window.location.search);
 if(!urlParams.has('feedback')) {
  if(popup.classList.contains('active')) closePopup();
 }
}

window.addEventListener('load', () => {
 const urlParams = new URLSearchParams(window.location.search);
 if(urlParams.has('feedback')) {
  openPopup();
 }
});
})();
</script>

</body>
</html>
