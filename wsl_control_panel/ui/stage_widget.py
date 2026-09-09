from PyQt6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QTextEdit, QLabel, QLineEdit
from core.wsl_runner import WSLRunner

class StageWidget(QWidget):
    def __init__(self, stage_name, default_cmd, config_dict, parent=None):
        super().__init__(parent)
        self.stage_name = stage_name
        self.config_dict = config_dict

        # --- UI Setup ---
        self.layout = QVBoxLayout(self)
        self.header_layout = QHBoxLayout()

        self.title_label = QLabel(f"<b>{stage_name}</b>")
        self.status_label = QLabel("Status: idle")

        # Load persisted config if available, otherwise use default
        self.cmd_input = QLineEdit()
        self.cmd_input.setText(self.config_dict.get(self.stage_name, default_cmd))

        self.start_btn = QPushButton("Start")
        self.stop_btn = QPushButton("Stop")
        self.stop_btn.setEnabled(False)

        self.header_layout.addWidget(self.title_label)
        self.header_layout.addWidget(self.status_label)
        self.header_layout.addWidget(self.cmd_input)
        self.header_layout.addWidget(self.start_btn)
        self.header_layout.addWidget(self.stop_btn)

        self.log_output = QTextEdit()
        self.log_output.setReadOnly(True)

        self.layout.addLayout(self.header_layout)
        self.layout.addWidget(self.log_output)

        # --- Connections ---
        self.start_btn.clicked.connect(self.start_stage)
        self.stop_btn.clicked.connect(self.stop_stage)

        # Update our config dict in real-time as the user types
        self.cmd_input.textChanged.connect(self.update_config)

        self.runner = None

    def start_stage(self):
        command = self.cmd_input.text()
        self.log_output.clear()

        self.runner = WSLRunner(command)
        self.runner.output_received.connect(self.append_log)
        self.runner.status_changed.connect(self.update_status)

        self.runner.start()

        self.start_btn.setEnabled(False)
        self.stop_btn.setEnabled(True)

    def stop_stage(self):
        if self.runner:
            self.runner.stop()
            self.runner.wait()  # Wait safely for the background thread to exit

        self.start_btn.setEnabled(True)
        self.stop_btn.setEnabled(False)

    def append_log(self, text):
        self.log_output.append(text)
        # Scroll to bottom automatically
        scrollbar = self.log_output.verticalScrollBar()
        scrollbar.setValue(scrollbar.maximum())

    def update_status(self, status):
        self.status_label.setText(f"Status: {status}")
        if status in ["done", "error", "idle"]:
            self.start_btn.setEnabled(True)
            self.stop_btn.setEnabled(False)

    def update_config(self, text):
        self.config_dict[self.stage_name] = text
