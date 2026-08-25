@echo off
pushd "%~dp0.."
python -m http.server 8001
popd
