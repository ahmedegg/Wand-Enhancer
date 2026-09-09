import sys
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget, QPushButton
from core.config import load_config, save_config
from ui.stage_widget import StageWidget

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("WSL Pipeline Control Panel")
        self.resize(900, 700)

        self.config_data = load_config()

        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        self.layout = QVBoxLayout(central_widget)

        # Global Controls
        self.start_all_btn = QPushButton("Start All Stages")
        self.stop_all_btn = QPushButton("Stop All Stages")
        self.layout.addWidget(self.start_all_btn)
        self.layout.addWidget(self.stop_all_btn)

        # Instantiate Pipeline Stages
        self.stages = []
        pipeline_definition = [
            ("Stage 1 (Discovery)", "echo 'Starting Discovery...' && sleep 3 && echo 'Discovery Complete'"),
            ("Stage 2 (Capture)", "for i in {1..5}; do echo \"Capturing file $i...\"; sleep 1; done"),
            ("Stage 3 (Service)", "python3 -m http.server 8080")
        ]

        for name, default_cmd in pipeline_definition:
            widget = StageWidget(name, default_cmd, self.config_data)
            self.stages.append(widget)
            self.layout.addWidget(widget)

        self.start_all_btn.clicked.connect(self.start_all)
        self.stop_all_btn.clicked.connect(self.stop_all)

    def start_all(self):
        for stage in self.stages:
            if stage.start_btn.isEnabled():
                stage.start_stage()

    def stop_all(self):
        for stage in self.stages:
            if stage.stop_btn.isEnabled():
                stage.stop_stage()

    def closeEvent(self, event):
        # Guaranteed cleanup on window close
        self.stop_all()
        save_config(self.config_data)
        event.accept()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
