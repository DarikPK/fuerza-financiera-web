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

    // --- Lógica del Formulario Multi-Pasos con API ---
    const multiStepForm = document.getElementById('multi-step-form');
    if (multiStepForm) {
        const steps = Array.from(multiStepForm.querySelectorAll('.form-step'));
        const nextBtns = multiStepForm.querySelectorAll('.next-btn:not(#api-next-btn)'); // Excluir el botón de la API
        const prevBtns = multiStepForm.querySelectorAll('.prev-btn');
        const apiNextBtn = document.getElementById('api-next-btn');
        let currentStep = 0;

        const tipoSolicitante = document.getElementById('tipo_solicitante');
        const documentoContainer = document.getElementById('documento-container');
        const documentoInput = document.getElementById('documento');
        const errorMessage = document.getElementById('error-message');

        tipoSolicitante.addEventListener('change', () => {
            const selection = tipoSolicitante.value;
            documentoInput.value = '';
            errorMessage.style.display = 'none';

            if (selection === 'dni') {
                documentoInput.setAttribute('maxlength', '8');
                documentoInput.setAttribute('placeholder', 'Ingresa 8 dígitos');
                documentoContainer.style.display = 'block';
            } else if (selection === 'ruc10' || selection === 'ruc20') {
                documentoInput.setAttribute('maxlength', '11');
                documentoInput.setAttribute('placeholder', 'Ingresa 11 dígitos');
                documentoContainer.style.display = 'block';
            } else {
                documentoContainer.style.display = 'none';
            }
        });

        if(apiNextBtn) {
            apiNextBtn.addEventListener('click', async () => {
                const tipo = tipoSolicitante.value;
                const numero = documentoInput.value.trim();

                // Validación del lado del cliente
                errorMessage.style.display = 'none';
                if (!validateDocument(numero, tipo)) {
                    return;
                }

                // Iniciar carga
                apiNextBtn.disabled = true;
                apiNextBtn.textContent = 'Validando...';

                const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
                let targetUrl = '';
                if (tipo === 'dni') {
                    targetUrl = `https://api.apis.net.pe/v1/dni?numero=${numero}`;
                } else {
                    targetUrl = `https://api.apis.net.pe/v1/ruc?numero=${numero}`;
                }
                const apiUrl = proxyUrl + targetUrl;

                try {
                    // 1. Verificar conectividad a internet de forma silenciosa
                    try {
                        await fetch("https://google.com", { mode: 'no-cors' });
                    } catch (netError) {
                        throw new Error("No se pudo establecer conexión a internet. Por favor, revise su red.");
                    }

                    // 2. Prepara los encabezados y realiza la solicitud a la API
                    const headers = new Headers();
                    headers.append("Authorization", "Bearer apis-token-1.aTSI1U7KEuT-6bbbCguH-4Y8TI6KS73N");

                    const response = await fetch(apiUrl, { method: 'GET', headers: headers });

                    if (!response.ok) {
                        // Si la respuesta no es exitosa (ej. 404, 500), lanzar un error con el status
                        throw new Error(`Error de la API: ${response.status} ${response.statusText}`);
                    }

                    const data = await response.json();

                    if (data.nombre || data.nombres) {
                        // Limpiar mensajes anteriores y procesar datos
                        document.getElementById('mensaje-bienvenida').innerHTML = '';
                        document.getElementById('mensaje-advertencia').innerHTML = '';

                        if (tipo === 'dni') {
                            document.getElementById('mensaje-bienvenida').innerHTML = `<h3>Estimado(a) ${data.nombres} ${data.apellidoPaterno},</h3>`;
                        } else { // RUC
                            document.getElementById('mensaje-bienvenida').innerHTML = `<h3>Estimado representante de ${data.nombre},</h3>`;
                            if (data.estado !== 'ACTIVO' || data.condicion !== 'HABIDO') {
                                 document.getElementById('mensaje-advertencia').innerHTML = `<p class="mensaje-error-ruc"><strong>Atención:</strong> Hemos detectado que el RUC no se encuentra Activo y Habido. La evaluación solo podría proceder con una garantía hipotecaria.</p>`;
                            }
                        }

                        // Avanzar al siguiente paso
                        steps[currentStep].style.display = 'none';
                        currentStep++;
                        if (steps[currentStep]) {
                            steps[currentStep].style.display = 'block';
                        }
                    } else {
                        // Si la API devuelve éxito pero no hay datos, es un documento no encontrado
                        throw new Error('La API no devolvió datos para el documento consultado.');
                    }
                } catch (error) {
                    // 3. Mostrar el mensaje de error DETALLADO
                    errorMessage.textContent = `Error: ${error.message}`;
                    errorMessage.style.display = 'block';
                } finally {
                    // Finalizar carga
                    apiNextBtn.disabled = false;
                    apiNextBtn.textContent = 'Siguiente';
                }
            });
        }

        // Lógica para los botones "Siguiente" de los otros pasos
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
                this.innerHTML = `<h2>¡Gracias!</h2><p>Tu solicitud de evaluación ha sido enviada. Nos pondremos en contacto contigo a la brevedad.</p>`;
            }
        });

        function validateDocument(numero, tipo) {
            if (!tipo) {
                errorMessage.textContent = 'Por favor, seleccione un tipo de solicitante.';
                errorMessage.style.display = 'block';
                return false;
            }
             if (tipo === 'dni') {
                if (numero.length !== 8 || !/^\d+$/.test(numero)) {
                    errorMessage.textContent = 'El DNI debe contener 8 dígitos numéricos.';
                    errorMessage.style.display = 'block';
                    return false;
                }
            } else if (tipo === 'ruc10' || tipo === 'ruc20') {
                if (numero.length !== 11 || !/^\d+$/.test(numero)) {
                    errorMessage.textContent = 'El RUC debe contener 11 dígitos numéricos.';
                    errorMessage.style.display = 'block';
                    return false;
                }
                if (tipo === 'ruc10' && !numero.startsWith('10')) {
                    errorMessage.textContent = 'Este tipo de RUC debe comenzar con 10.';
                    errorMessage.style.display = 'block';
                    return false;
                }
                if (tipo === 'ruc20' && !numero.startsWith('20')) {
                    errorMessage.textContent = 'Este tipo de RUC debe comenzar con 20.';
                    errorMessage.style.display = 'block';
                    return false;
                }
            }
            return true;
        }

        function validateStep(stepIndex) {
            let isValid = true;
            const currentStepFields = steps[stepIndex].querySelectorAll('input[required], select[required]');

            currentStepFields.forEach(field => {
                 if (field.id === 'documento' && stepIndex === 0) return;

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
