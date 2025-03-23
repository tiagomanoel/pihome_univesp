# PiHome

## Setup Instructions

### Prerequisites

- Docker
- Docker Compose

### Step 1: Clone the Repository

```sh
git clone https://github.com/tiagomanoel/piHome.git
cd piHome
```

### Step 2: Configure the Environment Variables

Rename the `.env-example` file inside the `dotenv_files` directory to `.env` and update the configurations as needed:

```sh
mv dotenv_files/.env-example dotenv_files/.env
```

Edit the `.env` file with the following content:

```properties
SECRET_KEY="your-secret-key"  # You can generate a secret key using: python -c "import secrets; print(secrets.token_urlsafe(50))"

# 0 False, 1 True
DEBUG="1"

# Comma Separated values
ALLOWED_HOSTS="127.0.0.1,localhost"

DB_ENGINE="django.db.backends.postgresql"
POSTGRES_DB="your-database-name"
POSTGRES_USER="your-database-user"
POSTGRES_PASSWORD="your-database-password"
POSTGRES_HOST="your-database-host"
POSTGRES_PORT="5432"

# MQTT broker configurations
MQTT_HOST="your-mqtt-host"
MQTT_PORT="1883"
MQTT_CLIENT_NAME="your-client-name"
MQTT_KEEPALIVE="60"
MQTT_TOPIC="your-topic"
```

#### Generating a Django `SECRET_KEY`

You can generate a Django `SECRET_KEY` using the following Python command:

```sh
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Copy the generated key and replace `your-secret-key` in the `.env` file.

### Step 3: Build and Run the Containers

Run the following command to build and start the containers:

```sh
docker-compose up --build
```

This command will:

1. Build the Docker images for the Django application and PostgreSQL database.
2. Start the PostgreSQL database container.
3. Start the Django application container, which will:
   - Wait for the PostgreSQL database to be ready.
   - Apply database migrations.
   - Start the Django development server on port 8000.
   - Start the Mosquitto MQTT broker on port 1883.

### Step 4: Access the Application

Open your web browser and navigate to `http://127.0.0.1:8000` to access the Django application.

### Additional Information

- The static files are served from the `data/web/static` directory.
- The media files are served from the `data/web/media` directory.
- The Mosquitto MQTT broker is configured using the `mosquitto.conf` file.

### Troubleshooting

If you encounter any issues, check the logs of the running containers:

```sh
docker-compose logs
```

For more detailed logs, you can follow the logs of a specific container:

```sh
docker-compose logs -f <container_name>
```

Replace `<container_name>` with the name of the container you want to follow (e.g., `djangoapp` or `psql`).

### Handling Permission Errors

If you encounter any permission errors, you may need to adjust the permissions of the project files and directories. You can use the following commands to change the permissions:

```sh
# Change ownership to the current user
sudo chown -R $USER:$USER /path/to/project

# Set read, write, and execute permissions for the user
sudo chmod -R u+rwx /path/to/project
```

Replace `/path/to/project` with the path to your project directory.

---

## Contact

![Email](https://img.shields.io/badge/Email-tiagomanoel@tiagomanoel.com.br-blue?style=flat-square&logo=gmail)
![GitHub](https://img.shields.io/badge/GitHub-tiagomanoel-blue?style=flat-square&logo=github)