#!/bin/bash

tt() {
  # Check if an argument was provided
  if [ -z "$1" ]; then
    echo "Usage: $0 <filename>"
    return 1
  fi

  # Create the directory if it doesn't exist
  mkdir -p src/test

  # Create the file with the provided name followed by .test.ts inside src/test/
  touch "src/test/$1.test.ts"
  echo "File 'src/test/$1.test.ts' created successfully."
}

#chmod +x createTestFile.sh