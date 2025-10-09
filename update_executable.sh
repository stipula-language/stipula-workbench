#!/bin/bash

GITHUB_URL="https://github.com/stipula-language/stipula/raw/master/Stipula%20Executable/Stipula-LAN.jar"
DESTINATION_PATH="server_interpreter/Stipula-LAN.jar"
TEMP_FILE="Stipula-LAN.jar.temp"

if [ ! -d "server_interpreter" ]; then
  echo "Error: The 'server_interpreter' directory does not exist."
  echo "Please make sure you are running the script from the correct directory."
  exit 1
fi

echo "Downloading Stipula-LAN.jar..."
if curl -L -o "$TEMP_FILE" "$GITHUB_URL"; then
  echo "Download complete."
else
  echo "Error downloading the file. Check the URL and your internet connection."
  exit 1
fi

echo "Replacing file at $DESTINATION_PATH..."
if mv "$TEMP_FILE" "$DESTINATION_PATH"; then
  echo "File replaced successfully!"
else
  echo "Error replacing the file."
  rm -f "$TEMP_FILE"
  exit 1
fi

exit 0
