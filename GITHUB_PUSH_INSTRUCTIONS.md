# Commands to Force Push to GitHub

Make sure you've run these commands from the root of your project:

```powershell
# 1. Add the remote repository if not already added
git remote add origin https://github.com/ksimon0807/JobZee.git

# If the remote is already added, you might need to set the URL
# git remote set-url origin https://github.com/ksimon0807/JobZee.git

# 2. Add all files (excluding those in .gitignore)
git add .

# 3. Commit your changes
git commit -m "Initial commit"

# 4. Force push to the main branch of your GitHub repository
git push -f origin main
```

Note: Force pushing will overwrite the remote repository completely with your local version. Any changes that exist only on the remote will be lost.

If you encounter authentication issues, you might need to:
1. Generate a personal access token on GitHub
2. Use that token as your password when prompted
3. Or configure the Git credential manager

To check if the push was successful:
```powershell
git status
```

Remember that sensitive information in your commit history will still be accessible unless you've used the strip_blobs.py script to remove them.
