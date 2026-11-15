rm -rf .git
git init
git branch -M main
git add .
git commit -m "Security v83: Full 27-point security audit & hardening"
git remote add origin https://github.com/Medy66lll/fidelitydz.git
git push -f origin main