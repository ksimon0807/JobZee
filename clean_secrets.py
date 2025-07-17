#!/usr/bin/env python3

import os
import glob
import re

# These are the patterns we need to replace
GOOGLE_CLIENT_ID = "839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "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"

# Replacements (keep the same format but replace with dummy values)
REPLACEMENT_ID = "YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com"
REPLACEMENT_SECRET = "YOUR-GOOGLE-CLIENT-SECRET"

# List of file extensions to check
EXTENSIONS = [
    ".js", ".jsx", ".ts", ".tsx", ".html", ".css", 
    ".md", ".json", ".env", ".example", ".txt", ".yml", ".yaml"
]

# Find all files with these extensions
def find_files():
    files = []
    for ext in EXTENSIONS:
        files.extend(glob.glob(f"**/*{ext}", recursive=True))
    return files

# Replace sensitive data in a file
def clean_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Check if the file contains any secrets
        if GOOGLE_CLIENT_ID in content or GOOGLE_CLIENT_SECRET in content:
            print(f"Cleaning file: {file_path}")
            
            # Replace the secrets
            new_content = content.replace(GOOGLE_CLIENT_ID, REPLACEMENT_ID)
            new_content = new_content.replace(GOOGLE_CLIENT_SECRET, REPLACEMENT_SECRET)
            
            # Write the cleaned content back
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            
            return True
        
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return False

# Main function
def main():
    files = find_files()
    cleaned_files = 0
    
    for file in files:
        if clean_file(file):
            cleaned_files += 1
    
    print(f"Cleaned {cleaned_files} files")

if __name__ == "__main__":
    main()
