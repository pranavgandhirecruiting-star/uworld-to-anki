"""
Non-blocking HTTP server that runs inside Anki's main thread via QTimer.
Serves both the static React UI and JSON API endpoints.
"""

import json
import mimetypes
import os
import select
import socket

BIND_ADDRESS = "127.0.0.1"
BIND_PORT = 28735
WEB_DIR = os.path.join(os.path.dirname(__file__), "web")


class WebServer:
    def __init__(self, api_handler):
        self.api_handler = api_handler
        self.clients = []
        self.sock = None

    def listen(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.setblocking(False)
        self.sock.bind((BIND_ADDRESS, BIND_PORT))
        self.sock.listen(5)

    def advance(self):
        if self.sock is None:
            return
        self._accept_clients()
        self._advance_clients()

    def _accept_clients(self):
        try:
            readable, _, _ = select.select([self.sock], [], [], 0)
            if readable:
                client_sock, _ = self.sock.accept()
                client_sock.setblocking(False)
                self.clients.append(WebClient(client_sock, self.api_handler))
        except (socket.error, OSError):
            pass

    def _advance_clients(self):
        active = []
        for client in self.clients:
            if client.advance():
                active.append(client)
        self.clients = active

    def close(self):
        if self.sock:
            self.sock.close()
            self.sock = None
        for client in self.clients:
            try:
                client.sock.close()
            except Exception:
                pass
        self.clients = []


class WebClient:
    def __init__(self, sock, api_handler):
        self.sock = sock
        self.api_handler = api_handler
        self.buffer = b""
        self.response = None

    def advance(self):
        try:
            if self.response is None:
                data = self.sock.recv(65536)
                if not data:
                    self.sock.close()
                    return False
                self.buffer += data
                response = self._try_handle_request()
                if response is not None:
                    self.response = response
            else:
                sent = self.sock.send(self.response[:65536])
                self.response = self.response[sent:]
                if not self.response:
                    self.sock.close()
                    return False
            return True
        except (socket.error, OSError):
            try:
                self.sock.close()
            except Exception:
                pass
            return False

    def _try_handle_request(self):
        if b"\r\n\r\n" not in self.buffer:
            return None

        header_end = self.buffer.index(b"\r\n\r\n")
        header_block = self.buffer[:header_end].decode("utf-8", errors="replace")
        body_start = header_end + 4

        lines = header_block.split("\r\n")
        request_line = lines[0]
        parts = request_line.split(" ")
        if len(parts) < 2:
            return self._error_response(400, "Bad Request")

        method = parts[0]
        path = parts[1].split("?")[0]  # strip query params

        # Parse headers
        content_length = 0
        for line in lines[1:]:
            if line.lower().startswith("content-length:"):
                content_length = int(line.split(":", 1)[1].strip())

        # For POST requests, wait for full body
        body = self.buffer[body_start:]
        if method == "POST" and len(body) < content_length:
            return None

        # Handle CORS preflight
        if method == "OPTIONS":
            return self._cors_preflight()

        # Route: API endpoint
        if path == "/api" and method == "POST":
            try:
                request_body = json.loads(body[:content_length])
                result = self.api_handler(request_body)
                return self._json_response(result)
            except json.JSONDecodeError:
                return self._json_response({"result": None, "error": "Invalid JSON"})
            except Exception as e:
                return self._json_response({"result": None, "error": str(e)})

        # Route: Static files
        return self._serve_static(path)

    def _serve_static(self, path):
        if path == "/":
            path = "/index.html"

        # Security: prevent directory traversal
        safe_path = os.path.normpath(path.lstrip("/"))
        if safe_path.startswith(".."):
            return self._error_response(403, "Forbidden")

        file_path = os.path.join(WEB_DIR, safe_path)

        if not os.path.isfile(file_path):
            # SPA fallback: serve index.html for unmatched routes
            file_path = os.path.join(WEB_DIR, "index.html")
            if not os.path.isfile(file_path):
                return self._error_response(404, "Not Found")

        content_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"

        try:
            with open(file_path, "rb") as f:
                body = f.read()
        except IOError:
            return self._error_response(500, "Internal Server Error")

        headers = (
            f"HTTP/1.1 200 OK\r\n"
            f"Content-Type: {content_type}\r\n"
            f"Content-Length: {len(body)}\r\n"
            f"Cache-Control: no-cache\r\n"
            f"\r\n"
        ).encode("utf-8")

        return headers + body

    def _json_response(self, data):
        body = json.dumps(data).encode("utf-8")
        headers = (
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n"
            f"Content-Length: {len(body)}\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Access-Control-Allow-Methods: POST, OPTIONS\r\n"
            "Access-Control-Allow-Headers: Content-Type\r\n"
            "Access-Control-Allow-Private-Network: true\r\n"
            "\r\n"
        ).encode("utf-8")
        return headers + body

    def _cors_preflight(self):
        headers = (
            "HTTP/1.1 204 No Content\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n"
            "Access-Control-Allow-Headers: Content-Type\r\n"
            "Access-Control-Allow-Private-Network: true\r\n"
            "Access-Control-Max-Age: 86400\r\n"
            "\r\n"
        ).encode("utf-8")
        return headers

    def _error_response(self, code, message):
        body = f"<h1>{code} {message}</h1>".encode("utf-8")
        headers = (
            f"HTTP/1.1 {code} {message}\r\n"
            f"Content-Type: text/html\r\n"
            f"Content-Length: {len(body)}\r\n"
            f"\r\n"
        ).encode("utf-8")
        return headers + body
