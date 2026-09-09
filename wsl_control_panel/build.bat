@echo off
echo Installing requirements...
pip install -r requirements.txt

echo.
echo Building executable with PyInstaller...
:: Using --onedir is generally safer and faster for PyQt6, but --onefile is possible too.
:: --windowed hides the console window on launch.
pyinstaller --noconfirm --onedir --windowed --name "WSLControlPanel" main.py

echo.
echo Build complete. You can find your executable in the 'dist\WSLControlPanel' folder.
pause
