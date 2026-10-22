# 1. Retirer les fichiers d'environnement du suivi Git (sans les effacer de votre machine)
git rm --cached .env .env.local .env.*.local 2>/dev/null || true

# 2. Vérifier l'état : aucun fichier .env ne doit être vert
git status

# 3. Ajouter tous les fichiers modifiés (le .gitignore bloque automatiquement vos clés)
git add .

# 4. Enregistrer le commit
git commit -m "feat v12: 69 wilayas, logo supabase, reseaux sociaux, securite et RLS"

# 5. Envoyer sur GitHub (déclenche le déploiement automatique Vercel)
git push origin main