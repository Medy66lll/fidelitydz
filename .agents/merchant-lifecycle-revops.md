# FidelityDZ â€” Merchant Lifecycle, SMS & WhatsApp RevOps Playbook

> **Automated Customer Journey, Communications & Retention Specification**  
> *Engineered via Emails, SMS, RevOps & Churn-Prevention Skills*  
> *Target: Algerian CommerÃ§ants, Franchises & Multi-Store Operators*

---

## 1. Automated Merchant Onboarding Sequences (Email + WhatsApp)

```mermaid
journey
  title Parcours d'Activation CommerÃ§ant FidelityDZ
  section J0 : Inscription
    Inscription 0 CB: 5: CommerÃ§ant
    RÃ©ception QR Code PDF: 5: WhatsApp Bot
  section J1 : Premier Scan
    Premier Scan en Caisse: 4: Caissier
    Message FÃ©licitations: 5: Email + Push
  section J3 : Engagement
    Activation Google Reviews: 4: GÃ©rant
    10Ã¨me Client EnregistrÃ©: 5: Dashboard
  section J5 : ClÃ´ture d'Essai
    Rappel Fin d'Essai (J-2): 3: SMS + WhatsApp
  section J7 : Conversion
    Paiement Chargily / BaridiMob: 5: GÃ©rant
    Envoi Chevalet Acrylique: 5: Logistique DZ
```

### Email 1: Bienvenue & Votre QR Code Comptoir (J0 - ImmÃ©diat)
- **Objet:** Votre QR Code FidelityDZ est prêt ! (À imprimer pour votre comptoir)
- **Corps :**
  > Bonjour **[Nom_Gérant]**,  
  > 
  > Bienvenue parmi les commerçants visionnaires d'Algérie ! Votre compte pour **[Nom_Commerce]** est actif.  
  > 
  > 🚀 **Voici votre plan d'action pour aujourd'hui (3 minutes chrono) :**  
  > 1. Téléchargez et imprimez votre QR Code officiel : [Lien_PDF_Chevalet]  
  > 2. Posez-le sur votre comptoir près de la caisse.  
  > 3. Ouvrez votre scanner sur votre téléphone : [Lien_Scanner]  
  > 
  > 💡 *Astuce du jour :* Dites simplement à votre prochain client : *"Scannez ici pour débloquer votre cadeau de bienvenue !"*  
  > 
  > Une question ? Répondez directement à cet email ou contactez notre équipe sur WhatsApp au **0541 53 47 62**.  
  > 
  > L'équipe FidelityDZ 🇩🇿

---

### Email 2: La CÃ©lÃ©bration du Premier Scan (J1)
- **Objet:** 🎯 Premier scan réussi chez [Nom_Commerce] !
- **Corps :**
  > Félicitations **[Nom_Gérant]** !  
  > 
  > Votre premier client vient d'enregistrer sa carte de fidélité digitale dans votre boutique.  
  > 
  > Ce client a désormais votre carte dans son smartphone. La probabilité qu'il revienne chez vous dans les 14 jours vient de grimper de **68%**.  
  > 
  > Continuez à scanner chaque client en caisse. Plus vous scannez, plus votre chiffre d'affaires récurrent augmente.  
  > 
  > Suivez vos statistiques en temps réel : [Lien_Dashboard]

---

### Email 3: Rappel ClÃ´ture d'Essai & Garantie Risque ZÃ©ro (J5 - 48h avant expiration)
- **Objet:** ⏳ Votre essai gratuit FidelityDZ expire dans 48h ([X] clients enregistrés)
- **Corps :**
  > Bonjour **[Nom_Gérant]**,  
  > 
  > Durant vos 5 premiers jours, vous avez déjà fidélisé **[X] clients** chez **[Nom_Commerce]** !  
  > 
  > Pour que vos clients continuent à cumuler leurs tampons et que votre scanner reste actif sans interruption, activez votre abonnement avant dimanche :  
  > 
  > 👉 [Activer mon abonnement Pro (5,900 DA / mois)]  
  > 
  > 🔒 **Rappel de notre Garantie Commerçant DZ :**  
  > Si dans 30 jours vous n'êtes pas 100% convaincu de l'augmentation de la fidélité de vos clients, nous vous remboursons intégralement sur votre compte BaridiMob ou CCP.  
  > 
  > Modes de paiement acceptés : Edahabia, CIB, Chargily Pay, BaridiMob.

---

## 2. WhatsApp Direct Concierge Integration (RevOps)

Le système de messagerie directe est connecté aux déclencheurs de base de données :
1. **Échec de paiement (Dunning) :** Envoi d'un message bienveillant sur WhatsApp avec le lien direct de réessai Chargily ou le RIB BaridiMob pour virement immédiat.
2. **Inactivité Commerçant (0 scan en 48h) :** Appel de courtoisie du support pour vérifier si le commerçant a besoin d'aide pour imprimer son chevalet de caisse.

---

## 3. Churn Prevention & Cancellation Deflection Playbook

Lorsqu'un commerçant clique sur *"Résilier mon abonnement"* dans son dashboard :
1. **Étape 1 : Le Choc de la Perte**  
   Afficher : *"Attention, en résiliant, vos [X] clients fidélisés ne pourront plus scanner leur carte et perdront leurs tampons cumulés chez [Nom_Commerce]."*
2. **Étape 2 : L'Offre de Sauvetage (Save Offer)**  
   Proposer une option de secours :  
   - Option A : *"Mettre en pause mon abonnement pendant 60 jours sans frais (ex: travaux, fermeture de vacances)"*.  
   - Option B : *"Bénéficier de 50% de réduction sur les 2 prochains mois (soit 2,950 DA au lieu de 5,900 DA)"*.
3. **Étape 3 : Sondage de Sortie**  
   Si le commerçant confirme, enregistrement du motif (Prix, Utilisation difficile, Fermeture boutique) pour affinage du produit.
