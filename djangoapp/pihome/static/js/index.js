document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById("addButton");
    const editButton = document.getElementById("editButton");
    const modal = document.getElementById("modal");
    const closeModal = document.querySelector(".close");
    const confirmButton = document.getElementById("confirmButton");
    const container = document.getElementById("container");
    const pageTitle = document.getElementById("pageTitle");

    const brokerIP = document.getElementById("brokerIP");
    const brokerPort = document.getElementById("brokerPort");
    const mqttTopic = document.getElementById("mqttTopic");
    const buttonName = document.getElementById("buttonName");

    let editMode = false;
    let editButtonId = null;

    // Abrir modal ao clicar no botão +
    addButton.addEventListener("click", () => {
        modal.style.display = "block";
        brokerIP.value = "";
        brokerPort.value = "";
        mqttTopic.value = "";
        buttonName.value = "";
        editButtonId = null;

        // Trigger modal animation
        modal.classList.add("modal-animation");
    });

    // Fechar modal
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
        modal.classList.remove("modal-animation");
    });

    // Fechar modal ao clicar fora dele
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
            modal.classList.remove("modal-animation");
        }
    });

    // Criar ou atualizar configuração MQTT
    confirmButton.addEventListener("click", confirmMQTTConfig);

    function confirmMQTTConfig() {
        const ip = brokerIP.value.trim();
        const port = brokerPort.value.trim();
        const topic = mqttTopic.value.trim();
        const name = buttonName.value.trim();
        const createBtn = false; // Set to false since the checkbox is removed

        if (ip && port && topic && name) {
            // Testar conexão com o broker
            fetch('/test-mqtt-connection/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ ip, port })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Connection successful') {
                    const url = editButtonId ? `/update-mqtt-button/${editButtonId}/` : '/save-mqtt-button/';
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify({ name, ip, port, topic, create_button: createBtn })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            modal.style.display = "none";
                            location.reload(); // Reload the page
                        } else {
                            alert('Falha ao salvar o botão. Por favor, tente novamente.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Falha ao salvar o botão. Por favor, tente novamente.');
                    });
                } else {
                    alert('Falha na conexão com o broker MQTT. Por favor, verifique as configurações e tente novamente.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Falha na conexão com o broker MQTT. Por favor, verifique as configurações e tente novamente.');
            });
        }
    }

    // Função para obter o valor do cookie CSRF
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Adicionar eventos aos botões carregados do banco de dados
    document.querySelectorAll('.dynamic-btn').forEach(button => {
        button.addEventListener('click', () => {
            const ip = button.dataset.ip;
            const port = button.dataset.port;
            const topic = button.dataset.topic;

            fetch('/execute-mqtt-action/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ ip, port, topic, message: 'TOGGLE' })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    // Entrar no modo de edição
    editButton.addEventListener("click", () => {
        editMode = !editMode;
        container.classList.toggle('grid', !editMode);
        container.classList.toggle('column', editMode);
        if (editMode) {
            container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))'; // Expand but not too much
            editButton.textContent = "Sair do modo de edição";
            pageTitle.textContent = "Configuração MQTT";
        } else {
            container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))'; // Restore original layout
            editButton.textContent = "Editar";
            pageTitle.textContent = "Dispositivos";
        }
        document.querySelectorAll('.edit-btn, .delete-btn').forEach(button => {
            button.style.display = editMode ? "inline-block" : "none";
        });
    });

    // Adicionar eventos aos botões de edição e exclusão
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const buttonContainer = event.target.closest('.button-container');
            const dynamicButton = buttonContainer.querySelector('.dynamic-btn');
            const id = dynamicButton.dataset.id;
            const name = dynamicButton.textContent;
            const ip = dynamicButton.dataset.ip;
            const port = dynamicButton.dataset.port;
            const topic = dynamicButton.dataset.topic;

            // Preencher o modal com os dados do botão
            brokerIP.value = ip;
            brokerPort.value = port;
            mqttTopic.value = topic;
            buttonName.value = name;

            // Mostrar o modal
            modal.style.display = "block";
            editButtonId = id;
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const buttonContainer = event.target.closest('.button-container');
            const dynamicButton = buttonContainer.querySelector('.dynamic-btn');
            const id = dynamicButton.dataset.id;

            fetch(`/delete-mqtt-button/${id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    location.reload(); // Reload the page
                } else {
                    alert('Falha ao apagar o botão. Por favor, tente novamente.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Falha ao apagar o botão. Por favor, tente novamente.');
            });
        });
    });

    const offcanvasLinks = document.querySelectorAll('.offcanvas-body a:not(.dropdown-toggle)');
    const offcanvas = document.querySelector('.offcanvas');

    offcanvasLinks.forEach(link => {
        link.addEventListener('click', () => {
            const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvas);
            if (offcanvasInstance) {
                offcanvasInstance.hide();
            }
        });
    });

    // Remove animation class after animations complete
    setTimeout(() => {
        document.body.classList.remove('animate-page');
    }, 1000); // Allow animations to complete before removing the class
});
