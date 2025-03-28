# Network Scanner nmap GUI

Network Scanner is a web-based application that scans a given network range to detect devices and their open ports with nmap. It provides an easy-to-use interface for network scanning and displays detailed information about discovered devices.

![Image](/media/scanner-b.gif) 

## Features

- Scan network ranges to discover devices.
- Detect open ports and services on the discovered devices.
- Display detailed information including IP address, hostname, state, and port details.
- Lightweight and packaged with Docker.

## Technologies Used

- Frontend: React
- Backend: FastAPI
- Network Scanning: Nmap
- Containerization: Docker

## Prerequisites to run

- Docker
- Docker Compose (optional)

## Installation

You can use already built images for frontend and backend:

### Run Frontend:
```bash
docker run -p 8089:80 -d --name NETSCAN-frontend ghcr.io/securityphoton/nmap-gui-frontend:latest
```

### Run Backend:
```bash
docker run -p 8000:8000 -d --name NETSCAN-backend ghcr.io/securityphoton/nmap-gui-backend:latest
```
### Or one line option to start both
```bash
docker run -p 8089:80 -d --name NETSCAN-frontend ghcr.io/securityphoton/nmap-gui-frontend:latest && docker run -p 8000:8000 -d --name NETSCAN-backend ghcr.io/securityphoton/nmap-gui-backend:latest
```
 Or use docker-compose-start.yml file to run with docker compose.

NOTE!
Use additional `--network host` parameter if you plan ARP scans of the local network (in this case, ignore HOST:CONTAINER port mappings).
```bash
docker run --network host -d --name NETSCAN-backend ghcr.io/securityphoton/nmap-gui-backend:latest
```

or choose the long way (in case you need some modifications):

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/scanner.git
    cd scanner
    ```

2. Build and run the Docker containers with docker compose:
    ```bash
    docker compose up --build -d
    ```
Note! there is two docker-compose files. One for local build and other for running app from already build images.

3. Open your browser and navigate to `http://localhost:8089` (or your http://your-docker-host-ip:8089) to access the application. Or you can change the default 8089 port to your preference (for ex. 8080 -> 8080:80) in the docker compose file.

## Usage

1. Enter the IP, DNS name or range you want to scan (e.g., `192.168.1.0/24`) in the input field.
2. Select the type of scan from the dropdown (Discovery Scan, Most Common Ports, All Ports, Custom).
Most Common ports include - 21,22,23,25,53,80,110,139,143,443,445,3389,8080,8443.
3. Click the "Scan" button to initiate the scan.
4. View the scan results, which include detailed information about each discovered device.

The "Verbose output" checkbox is for adding -v key to backend app log output in container, and does not do anything on the GUI.  

## Project Structure

- `frontend/`: Contains the React frontend source code.
- `backend/`: Contains the FastAPI backend source code.
- `frontend/Dockerfile`: Dockerfile for the frontend.
- `backend/Dockerfile`: Dockerfile for the backend.
- `frontend/nginx.conf`: Nginx global configuration file. Note, that it contains the timeout settings equal to 360 s - so for a scans, that will take more time to complete, it will not get the results to GUI. This is workaround, until it will be re-made.

## Example Response

```json
{
  "message": "Network scan completed for range: 192.168.1.0/24",
  "hosts": [
    {
      "ip": "192.168.1.1",
      "hostname": "",
      "state": "up",
      "protocols": [
        {
          "protocol": "tcp",
          "ports": [
            {
              "port": 80,
              "state": "open",
              "name": "http",
              "product": "nginx",
              "version": "1.18.0",
              "extrainfo": ""
            },
            {
              "port": 443,
              "state": "open",
              "name": "https",
              "product": "nginx",
              "version": "1.18.0",
              "extrainfo": ""
            }
          ]
        }
      ]
    }
  ]
}
```

## Development

To start the development server for the frontend and backend:

### Frontend

1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm start
    ```

The React app will be running at `http://localhost:3000`.

### Backend

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```

2. Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3. Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Start the FastAPI server:
    ```bash
    uvicorn main:app --reload
    ```

The FastAPI server will be running at `http://localhost:8000`.

### Building docker images

To build docker images, run in the project folder:

#### Frontend:
```bash
docker build -t network-scanner-frontend -f frontend/dockerfile .
```

#### Backend:
```bash
docker build -t network-scanner-backend -f backend/dockerfile .
```


## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any changes.

## License

This project is licensed under the MIT License.
