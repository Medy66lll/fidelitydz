rm -rf .git
git initecho "node_modules/" > .gitignoreecho ".next/" >> .gitignoreecho ".env*.local" >> .gitignore
git add .
git commit -m "Initial commit FidelityDZ"
git branch -M main
git remote add origin https://github.com/Medy66lll/fidelitydz.git
git push -u origin main --force