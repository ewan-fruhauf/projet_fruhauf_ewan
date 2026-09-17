// Sélection des éléments du DOM
const signupForm = document.getElementById('signup-form');
const errorMessage = document.getElementById('error-message');
const recapContainer = document.getElementById('recap-container');
const recapContent = document.getElementById('recap-content');

// Gestion de la soumission du formulaire
signupForm.addEventListener('submit', function (event) {
  event.preventDefault();

  // Extraction des valeurs
  const formData = {
    login: document.getElementById('login').value.trim(),
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirm-password').value,
    lastname: document.getElementById('lastname').value.trim(),
    firstname: document.getElementById('firstname').value.trim(),
    address: document.getElementById('address').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    birthdate: document.getElementById('birthdate').value
  };

  // 1. Contrôle des champs obligatoires
  const hasEmptyFields = Object.values(formData).some(value => value === '');
  if (hasEmptyFields) {
    displayError('Tous les champs sont obligatoires.');
    return;
  }

  // 2. Contrôle du format de l'adresse email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(formData.email)) {
    displayError('Veuillez saisir une adresse email valide.');
    return;
  }

  const phonePattern = /^0[1-9][0-9]{8}$/;
  if (!phonePattern.test(formData.phone.replace(/\s+/g, ''))) {
    displayError('Veuillez saisir un numéro de téléphone valide (10 chiffres).');
    return;
}

  // 3. Contrôle de correspondance des mots de passe
  if (formData.password !== formData.confirmPassword) {
    displayError('Les mots de passe ne correspondent pas.');
    return;
  }

  // Masquage de l'erreur et bascule d'affichage
  clearError();
  signupForm.classList.add('hidden');
  renderRecap(formData);
});

// Affiche un message d'erreur dans l'encart prévu
function displayError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

// Réinitialise l'encart d'erreur
function clearError() {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}

// Construit et affiche la section récapitulative
function renderRecap(data) {
  const fields = [
    { label: 'Login', value: data.login },
    { label: 'Nom', value: data.lastname },
    { label: 'Prénom', value: data.firstname },
    { label: 'Adresse', value: data.address },
    { label: 'Email', value: data.email },
    { label: 'Téléphone', value: data.phone },
    { label: 'Date de naissance', value: data.birthdate }
  ];

  recapContent.innerHTML = fields
    .map(field => `
      <div class="recap-item">
        <span class="recap-label">${field.label} :</span>
        <span class="recap-value">${escapeText(field.value)}</span>
      </div>
    `)
    .join('');

  recapContainer.classList.remove('hidden');
}

// Échappe le contenu texte pour sécuriser le rendu HTML
function escapeText(text) {
  const span = document.createElement('span');
  span.textContent = text;
  return span.innerHTML;
}