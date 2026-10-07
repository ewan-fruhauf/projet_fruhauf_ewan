document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');
    const errorMsg = document.getElementById('error-message');
    const formSection = document.getElementById('form-section');
    const recapSection = document.getElementById('recap-section');
    const rebootBtn = document.getElementById('reboot-btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Gather data
        const data = {
            login: document.getElementById('login').value.trim(),
            email: document.getElementById('email').value.trim(),
            pass: document.getElementById('password').value,
            confirm: document.getElementById('confirm-password').value,
            nom: document.getElementById('nom').value.trim(),
            prenom: document.getElementById('prenom').value.trim(),
            adresse: document.getElementById('adresse').value.trim(),
            telephone: document.getElementById('telephone').value.trim(),
            naissance: document.getElementById('naissance').value
        };

        // Validation
        let errors = [];

        // Check empty fields (already handled by HTML 'required', but good for fallback)
        for (const [key, value] of Object.entries(data)) {
            if (!value) {
                errors.push(`Veuillez remplir le champ ${key}.`);
                break; // Just one generic message is enough if bypassed
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            errors.push("Le format de l'adresse email est invalide.");
        }

        // Password matching
        if (data.pass !== data.confirm) {
            errors.push("Les mots de passe ne correspondent pas.");
        }

        if (errors.length > 0) {
            showError("Erreur : " + errors[0]);
        } else {
            showSuccess(data);
        }
    });

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.classList.add('show');
        
        // Add a slight glitch effect to the form panel
        formSection.style.transform = 'translate(2px, 2px)';
        setTimeout(() => formSection.style.transform = 'translate(-2px, -2px)', 50);
        setTimeout(() => formSection.style.transform = 'translate(0, 0)', 100);
    }

    function showSuccess(data) {
        errorMsg.classList.remove('show');
        
        // Populate recap
        document.getElementById('recap-login').textContent = data.login;
        document.getElementById('recap-nom').textContent = data.nom;
        document.getElementById('recap-prenom').textContent = data.prenom;
        document.getElementById('recap-email').textContent = data.email;
        document.getElementById('recap-adresse').textContent = data.adresse;
        document.getElementById('recap-telephone').textContent = data.telephone;
        document.getElementById('recap-naissance').textContent = data.naissance;

        // Transition
        formSection.classList.add('hidden');
        recapSection.classList.remove('hidden');
    }

    rebootBtn.addEventListener('click', () => {
        form.reset();
        recapSection.classList.add('hidden');
        formSection.classList.remove('hidden');
    });
});
