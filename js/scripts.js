document.addEventListener('DOMContentLoaded', function() {
    // --- Lógica de Animación de "Fade-in" ---
    const fadeInSections = document.querySelectorAll('.fade-in-section');
    if (window.IntersectionObserver) {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        fadeInSections.forEach(section => {
            sectionObserver.observe(section);
        });
    }

    // --- Lógica del Simulador Referencial ---
    const calcularBtn = document.getElementById('calcular-btn');
    if (calcularBtn) {
        calcularBtn.addEventListener('click', function() {
            const monto = parseFloat(document.getElementById('monto').value);
            const plazo = parseInt(document.getElementById('plazo').value);
            const resultadoCuotaSpan = document.getElementById('resultado-cuota');

            if (isNaN(monto) || monto <= 0 || isNaN(plazo) || plazo <= 0) {
                resultadoCuotaSpan.textContent = 'Por favor, ingrese valores válidos.';
                return;
            }

            // Tasa de interés mensual referencial (ej. 35% TCEA -> ~2.9% mensual).
            // ¡IMPORTANTE! Esta tasa es solo para el cálculo y no se muestra al usuario.
            const tasaMensualReferencial = 0.029;

            // Fórmula de amortización francesa para calcular la cuota fija
            const cuota = monto * (tasaMensualReferencial * Math.pow(1 + tasaMensualReferencial, plazo)) / (Math.pow(1 + tasaMensualReferencial, plazo) - 1);

            if (isFinite(cuota)) {
                resultadoCuotaSpan.textContent = `S/ ${cuota.toFixed(2)}`;
            } else {
                resultadoCuotaSpan.textContent = 'No se pudo calcular. Verifique los datos.';
            }
        });
    }

    // --- Lógica del Formulario Multi-Pasos ---
    const multiStepForm = document.getElementById('multi-step-form');
    if (multiStepForm) {
        const steps = Array.from(multiStepForm.querySelectorAll('.form-step'));
        const nextBtns = multiStepForm.querySelectorAll('.next-btn');
        const prevBtns = multiStepForm.querySelectorAll('.prev-btn');
        let currentStep = 0;

        nextBtns.forEach(button => {
            button.addEventListener('click', () => {
                if (validateStep(currentStep)) {
                    steps[currentStep].style.display = 'none';
                    currentStep++;
                    if (steps[currentStep]) {
                        steps[currentStep].style.display = 'block';
                    }
                }
            });
        });

        prevBtns.forEach(button => {
            button.addEventListener('click', () => {
                steps[currentStep].style.display = 'none';
                currentStep--;
                if (steps[currentStep]) {
                    steps[currentStep].style.display = 'block';
                }
            });
        });

        multiStepForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateStep(currentStep)) {
                // Aquí se enviaría el formulario a un backend.
                // Por ahora, solo mostramos una confirmación.
                this.innerHTML = `<h2>¡Gracias!</h2><p>Tu solicitud de evaluación ha sido enviada. Nos pondremos en contacto contigo a la brevedad.</p>`;
            }
        });

        function validateStep(stepIndex) {
            let isValid = true;
            const currentStepFields = steps[stepIndex].querySelectorAll('input[required], select[required]');

            currentStepFields.forEach(field => {
                if (field.type === 'checkbox') {
                    if (!field.checked) {
                        isValid = false;
                        alert('Debes aceptar los términos y condiciones.');
                    }
                } else {
                    if (field.value.trim() === '') {
                        isValid = false;
                        field.style.borderColor = 'red';
                    } else {
                        field.style.borderColor = '#ccc';
                    }
                }
            });
            if (!isValid && currentStepFields.length > 0 && currentStepFields[0].type !== 'checkbox') {
                alert('Por favor, completa todos los campos requeridos.');
            }
            return isValid;
        }
    }
});
