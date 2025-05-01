@echo off
IF NOT EXIST .venv python -m venv .venv
call .venv\Scripts\activate.bat
pip install -r requirements.txt
pyinstaller -F rf_processor.py
deactivate