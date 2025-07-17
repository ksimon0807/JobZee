# Steps to Remove Sensitive Information from Git History

To properly clean your repository of sensitive information and push it to GitHub without being blocked, follow these steps:

## 1. Install Git Filter-Repo

First, make sure you have `git-filter-repo` installed. If not, you can install it with:

```powershell
pip install git-filter-repo
```

## 2. Back up Your Repository (Optional but Recommended)

Make a backup copy of your repository before proceeding.

## 3. Run the Filter Command

Use this command to filter out the sensitive blobs:

```powershell
git filter-repo --blob-callback "python strip_blobs.py"
```

This will rewrite your entire Git history, removing the sensitive information.

## 4. Push to GitHub

After filtering, you can push to GitHub:

```powershell
git remote add origin https://github.com/ksimon0807/JobZee.git
git push -f origin main
```

## 5. Verify

Check that your repository has been successfully pushed and doesn't contain sensitive information.
