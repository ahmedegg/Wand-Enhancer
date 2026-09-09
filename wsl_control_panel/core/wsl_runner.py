import subprocess
from PyQt6.QtCore import QThread, pyqtSignal

class WSLRunner(QThread):
    # Signals to communicate safely with the main UI thread
    output_received = pyqtSignal(str)
    status_changed = pyqtSignal(str)

    def __init__(self, command, parent=None):
        super().__init__(parent)
        self.command = command
        self.process = None
        self._is_running = False

    def run(self):
        self._is_running = True
        self.status_changed.emit("running")

        try:
            # bufsize=1 and text=True provide line-buffered string output
            self.process = subprocess.Popen(
                ['wsl', '--exec', 'bash', '-c', self.command],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            # Read line by line. This blocks the background thread, NOT the UI.
            for line in self.process.stdout:
                if line:
                    self.output_received.emit(line.strip())

            self.process.wait()

            # Evaluate completion state if we didn't manually kill it
            if self._is_running:
                if self.process.returncode == 0:
                    self.status_changed.emit("done")
                else:
                    self.status_changed.emit("error")

        except Exception as e:
            self.output_received.emit(f"Error launching process: {e}")
            self.status_changed.emit("error")
        finally:
            self._is_running = False

    def stop(self):
        self._is_running = False
        if self.process:
            self.status_changed.emit("stopping...")
            # Terminating wsl.exe effectively kills the bash process it started on Windows
            self.process.terminate()
            try:
                self.process.wait(timeout=2)
            except subprocess.TimeoutExpired:
                self.process.kill()
            self.status_changed.emit("idle")
