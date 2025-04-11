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

    const noButtonsPopup = document.getElementById('noButtonsPopup');
    const closePopup = noButtonsPopup.querySelector('.close');
    const buttonsContainer = document.getElementById('container');

    editButton.addEventListener('click', (event) => {
        if (!buttonsContainer.querySelector('.button-container')) {
            event.preventDefault();
            noButtonsPopup.style.display = 'block';
        }
    });

    closePopup.addEventListener('click', () => {
        noButtonsPopup.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === noButtonsPopup) {
            noButtonsPopup.style.display = 'none';
        }
    });

    if (document.body.classList.contains('animate-page')) {
        setTimeout(() => {
            document.body.classList.remove('animate-page');
        }, 1000); // Allow animations to complete before removing the class
    }

    const content = document.getElementById('content');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const pages = [
        `<div class="col-12"><h4>Tecnologias Utilizadas</h4>
        <ul>
            <li><strong>Backend:</strong> Django Framework, PostgreSQL, paho-mqtt, Python.</li>
            <li><strong>Frontend:</strong> HTML5, CSS3, JavaScript.</li>
            <li><strong>Containerização:</strong> Docker, Alpine Linux.</li>
            <li><strong>Mensageria:</strong> Mosquitto MQTT Broker.</li>
        </ul></div>`,
        `<div class="col-12"><h4>Motivo da Escolha do Protocolo MQTT</h4>
        <p>O protocolo MQTT foi escolhido para garantir que o sistema seja independente de APIs de fabricantes, permitindo que os dados sejam mantidos localmente, caso o usuário assim deseje. Isso proporciona maior privacidade e controle sobre os dados.</p>
        <p>Além disso, o MQTT é leve e eficiente, ideal para dispositivos IoT com recursos limitados. Ele permite comunicação assíncrona e suporta padrões de publicação/assinatura, facilitando a escalabilidade do sistema.</p></div>`,
        `<div class="col-12"><h4>Sobre o Django</h4>
        <p>Django é o framework principal utilizado para o backend. Ele gerencia a autenticação de usuários, a lógica de negócios e a interação com o banco de dados.</p>
        <ul>
            <li>Gerenciamento de usuários com autenticação baseada em sessão.</li>
            <li>Integração com o PostgreSQL para armazenar dados de dispositivos e ações MQTT.</li>
            <li>Uso do Django Allauth para facilitar o login e a recuperação de senhas.</li>
        </ul></div>`,
        `<div class="col-12"><h4>Sobre o PostgreSQL</h4>
        <p>PostgreSQL é o banco de dados relacional utilizado para armazenar informações críticas do sistema, como configurações de dispositivos e logs de ações.</p>
        <ul>
            <li>Armazenamento de dados de botões MQTT, incluindo IP, porta e tópicos.</li>
            <li>Registro de ações realizadas pelos dispositivos, como mensagens publicadas no broker MQTT.</li>
            <li>Uso de transações ACID para garantir a consistência dos dados.</li>
        </ul></div>`,
        `<div class="col-12"><h4>Sobre o Docker</h4>
        <p>Docker é utilizado para containerizar a aplicação, garantindo que o ambiente de desenvolvimento seja consistente com o de produção.</p>
        <ul>
            <li>Criação de containers separados para o Django, PostgreSQL e Mosquitto MQTT Broker.</li>
            <li>Uso de Alpine Linux como base para imagens leves.</li>
            <li>Configuração de volumes para persistência de dados, como arquivos estáticos e logs.</li>
        </ul></div>`,
        `<div class="col-12"><h4>Propósito da Aplicação</h4>
        <p>O PiHome foi desenvolvido para oferecer uma solução de automação residencial que prioriza a privacidade e o controle local dos dados.</p>
        <ul>
            <li>Permitir que os usuários controlem dispositivos IoT sem depender de serviços de terceiros.</li>
            <li>Garantir que os dados permaneçam locais, aumentando a segurança e a privacidade.</li>
            <li>Fornecer uma interface amigável e responsiva para gerenciar dispositivos e ações.</li>
        </ul></div>`
    ];
    let currentPage = 0;

    function updateContent() {
        content.classList.remove('show'); // Start fade-out
        setTimeout(() => {
            content.innerHTML = pages[currentPage];
            content.classList.add('show'); // Start fade-in
        }, 500); // Match the transition duration
        prevPage.style.display = currentPage === 0 ? 'none' : 'inline-block';
        nextPage.style.display = currentPage === pages.length - 1 ? 'none' : 'inline-block';
    }

    prevPage.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            updateContent();
        }
    });

    nextPage.addEventListener('click', () => {
        if (currentPage < pages.length - 1) {
            currentPage++;
            updateContent();
        }
    });

    updateContent(); // Initialize the content display
});
