import base64
import os
from playwright.sync_api import sync_playwright

with open('public/logo.png', 'rb') as f:
    b64_logo = base64.b64encode(f.read()).decode('utf-8')
logo_src = f"data:image/png;base64,{b64_logo}"

posts = [
    {
        "id": "post_1_before_after",
        "title": "Avant vs Maintenant",
        "html": f"""
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: 1080px;
    height: 1350px;
    background: #020617;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #F8FAFC;
    padding: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }}
  .arabic {{ font-family: 'Cairo', sans-serif; direction: rtl; }}
  
  /* Background glow */
  .glow-1 {{
    position: absolute;
    top: -150px;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 500px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(2, 6, 23, 0) 70%);
    pointer-events: none;
  }}
  .glow-2 {{
    position: absolute;
    bottom: -100px;
    right: -100px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(2, 6, 23, 0) 70%);
    pointer-events: none;
  }}

  /* Header */
  .header {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  }}
  .brand-group {{
    display: flex;
    align-items: center;
    gap: 18px;
  }}
  .logo {{
    width: 72px;
    height: 72px;
    border-radius: 18px;
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35);
  }}
  .brand-title {{
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -0.5px;
    color: #FFFFFF;
  }}
  .brand-title span {{ color: #10B981; }}
  .tag-badge {{
    background: rgba(16, 185, 129, 0.15);
    border: 1.5px solid rgba(16, 185, 129, 0.4);
    padding: 10px 22px;
    border-radius: 50px;
    font-size: 18px;
    font-weight: 800;
    color: #34D399;
  }}

  /* Main Headline */
  .headline-box {{
    margin-top: 25px;
    text-align: center;
    z-index: 10;
  }}
  .headline-fr {{
    font-size: 46px;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -1px;
    margin-bottom: 12px;
  }}
  .headline-fr span {{
    color: #34D399;
    text-decoration: underline wavy #10B981 3px;
  }}
  .headline-ar {{
    font-size: 34px;
    font-weight: 800;
    color: #FCD34D;
  }}

  /* Comparison Grid */
  .comparison-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-top: 30px;
    z-index: 10;
  }}
  
  /* Card Old */
  .card-old {{
    background: rgba(30, 41, 59, 0.6);
    border: 2px solid rgba(239, 68, 68, 0.35);
    border-radius: 28px;
    padding: 35px 28px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    position: relative;
  }}
  .badge-bad {{
    position: absolute;
    top: -16px;
    left: 28px;
    background: #EF4444;
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 900;
    padding: 6px 16px;
    border-radius: 30px;
    text-transform: uppercase;
  }}
  .card-mockup-old {{
    background: #E2E8F0;
    border-radius: 18px;
    padding: 22px;
    margin: 20px 0;
    transform: rotate(-3deg);
    box-shadow: 0 15px 30px rgba(0,0,0,0.5);
    border: 2px dashed #94A3B8;
  }}
  .card-mockup-title {{
    color: #334155;
    font-size: 16px;
    font-weight: 800;
    text-align: center;
    margin-bottom: 14px;
  }}
  .stamps-old-grid {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }}
  .stamp-old-circle {{
    width: 42px;
    height: 42px;
    border: 2px dashed #64748B;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #94A3B8;
  }}
  .stamp-old-circle.stamped {{
    background: #CBD5E1;
    border-color: #1E293B;
    color: #0F172A;
    font-weight: 900;
  }}
  .points-list {{
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 16px;
    font-weight: 600;
  }}
  .points-list li {{
    display: flex;
    align-items: center;
    gap: 10px;
  }}
  .bad-icon {{ color: #EF4444; font-size: 20px; font-weight: 900; }}

  /* Card New */
  .card-new {{
    background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(6, 78, 59, 0.45));
    border: 2px solid rgba(16, 185, 129, 0.7);
    border-radius: 28px;
    padding: 35px 28px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 25px 50px rgba(16, 185, 129, 0.25);
    position: relative;
  }}
  .badge-good {{
    position: absolute;
    top: -16px;
    left: 28px;
    background: #10B981;
    color: #020617;
    font-size: 14px;
    font-weight: 900;
    padding: 6px 18px;
    border-radius: 30px;
    text-transform: uppercase;
  }}
  .card-mockup-new {{
    background: linear-gradient(135deg, #0F172A 0%, #064E3B 100%);
    border: 1.5px solid rgba(52, 211, 153, 0.6);
    border-radius: 18px;
    padding: 20px;
    margin: 20px 0;
    transform: rotate(2deg);
    box-shadow: 0 15px 35px rgba(0,0,0,0.7);
  }}
  .phone-status {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #A7F3D0;
    margin-bottom: 12px;
    font-weight: 700;
  }}
  .stamps-new-grid {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }}
  .stamp-new-circle {{
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.15);
    border: 1.5px solid #10B981;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FBBF24;
    font-size: 18px;
  }}
  .reward-pill {{
    background: #F59E0B;
    color: #020617;
    font-size: 12px;
    font-weight: 900;
    text-align: center;
    padding: 8px;
    border-radius: 10px;
    text-transform: uppercase;
  }}
  .good-icon {{ color: #10B981; font-size: 20px; font-weight: 900; }}

  /* Bottom Call to Action */
  .footer-cta {{
    background: rgba(15, 23, 42, 0.85);
    border: 2px solid rgba(16, 185, 129, 0.5);
    border-radius: 24px;
    padding: 24px 35px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 30px;
    z-index: 10;
  }}
  .cta-text-fr {{
    font-size: 20px;
    font-weight: 800;
    color: #FFFFFF;
  }}
  .cta-text-ar {{
    font-size: 20px;
    font-weight: 700;
    color: #34D399;
  }}
  .cta-button {{
    background: #10B981;
    color: #020617;
    font-size: 22px;
    font-weight: 900;
    padding: 16px 36px;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
    display: flex;
    align-items: center;
    gap: 12px;
  }}
</style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>

  <!-- Header -->
  <div class="header">
    <div class="brand-group">
      <img src="{logo_src}" class="logo" alt="Logo FidelityDZ" />
      <div class="brand-title">Fidelity<span>DZ</span></div>
    </div>
    <div class="tag-badge">🇩🇿 N°1 en Algérie</div>
  </div>

  <!-- Headline -->
  <div class="headline-box">
    <div class="headline-fr">Pourquoi la carte en carton <span>tue</span> vos ventes ?</div>
    <div class="headline-ar arabic">وعلاش كارطة الكارطون تخلّي دراهمك تضيع كل يوم ؟</div>
  </div>

  <!-- Comparison -->
  <div class="comparison-grid">
    <!-- Old -->
    <div class="card-old">
      <div class="badge-bad">❌ Avant (الكارطون)</div>
      <div class="card-mockup-old">
        <div class="card-mockup-title">CARTE DE FIDÉLITÉ</div>
        <div class="stamps-old-grid">
          <div class="stamp-old-circle stamped">✓</div>
          <div class="stamp-old-circle stamped">✓</div>
          <div class="stamp-old-circle">3</div>
          <div class="stamp-old-circle">4</div>
          <div class="stamp-old-circle">5</div>
          <div class="stamp-old-circle">6</div>
          <div class="stamp-old-circle">7</div>
          <div class="stamp-old-circle">8</div>
          <div class="stamp-old-circle">9</div>
          <div class="stamp-old-circle">🎁</div>
        </div>
      </div>
      <ul class="points-list">
        <li><span class="bad-icon">✕</span> 80% oubliée à la maison</li>
        <li><span class="bad-icon">✕</span> Zéro contact client récupéré</li>
        <li><span class="bad-icon">✕</span> Pas de relance possible</li>
        <li><span class="bad-icon">✕</span> Image dépassée & papier froissé</li>
      </ul>
    </div>

    <!-- New -->
    <div class="card-new">
      <div class="badge-good">✓ FidelityDZ (الهاتف)</div>
      <div class="card-mockup-new">
        <div class="phone-status">
          <span>● FIDELITYDZ PASS</span>
          <span>100% PWA</span>
        </div>
        <div class="stamps-new-grid">
          <div class="stamp-new-circle">★</div>
          <div class="stamp-new-circle">★</div>
          <div class="stamp-new-circle">★</div>
          <div class="stamp-new-circle">★</div>
          <div class="stamp-new-circle">★</div>
          <div class="stamp-new-circle">★</div>
          <div class="stamp-new-circle">★</div>
          <div class="stamp-new-circle">★</div>
          <div class="stamp-new-circle">★</div>
          <div class="stamp-new-circle" style="background:#F59E0B; color:#020617; font-weight:900;">🎁</div>
        </div>
        <div class="reward-pill">Cadeau VIP Débloqué !</div>
      </div>
      <ul class="points-list">
        <li><span class="good-icon">✓</span> Toujours dans le smartphone</li>
        <li><span class="good-icon">✓</span> 0 application à télécharger</li>
        <li><span class="good-icon">✓</span> Relance WhatsApp 1-Clic</li>
        <li><span class="good-icon">✓</span> +68% de visites répétées</li>
      </ul>
    </div>
  </div>

  <!-- Footer CTA -->
  <div class="footer-cta">
    <div>
      <div class="cta-text-fr">Envoyez un DM pour activer votre commerce</div>
      <div class="cta-text-ar arabic">أرسل رسالة في الخاص (DM) لتفعيل محلك مجاناً</div>
    </div>
    <div class="cta-button">
      <span>Envoyer un DM</span>
      <span>➔</span>
    </div>
  </div>
</body>
</html>
"""
    },
    {
        "id": "post_2_live_scan",
        "title": "Le Scan en Caisse 1.2s",
        "html": f"""
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: 1080px;
    height: 1350px;
    background: #020617;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #F8FAFC;
    padding: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }}
  .arabic {{ font-family: 'Cairo', sans-serif; direction: rtl; }}

  /* Aura */
  .glow-top {{
    position: absolute;
    top: -100px;
    right: 50%;
    transform: translateX(50%);
    width: 900px;
    height: 500px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(2, 6, 23, 0) 70%);
    pointer-events: none;
  }}

  /* Header */
  .header {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  }}
  .brand-group {{ display: flex; align-items: center; gap: 18px; }}
  .logo {{ width: 72px; height: 72px; border-radius: 18px; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35); }}
  .brand-title {{ font-size: 32px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF; }}
  .brand-title span {{ color: #10B981; }}
  .pill-badge {{
    background: rgba(245, 158, 11, 0.15);
    border: 1.5px solid rgba(245, 158, 11, 0.5);
    padding: 10px 24px;
    border-radius: 50px;
    font-size: 18px;
    font-weight: 800;
    color: #FBBF24;
  }}

  /* Headline */
  .headline-section {{
    text-align: center;
    margin-top: 20px;
    z-index: 10;
  }}
  .hero-title {{
    font-size: 52px;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -1.5px;
  }}
  .hero-title span {{ color: #34D399; }}
  .hero-subtitle-ar {{
    font-size: 32px;
    font-weight: 800;
    color: #E2E8F0;
    margin-top: 10px;
  }}

  /* Center Screen Showcase (Scanner Device) */
  .device-mockup-wrapper {{
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 30px 0;
    z-index: 10;
  }}
  .phone-frame {{
    width: 440px;
    height: 600px;
    background: #0F172A;
    border: 5px solid #334155;
    border-radius: 44px;
    padding: 24px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 50px rgba(16, 185, 129, 0.25);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }}
  .scanner-header {{
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    font-weight: 800;
    color: #94A3B8;
  }}
  .scanner-viewfinder {{
    width: 100%;
    height: 250px;
    background: #020617;
    border-radius: 20px;
    border: 2px solid #10B981;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin: 15px 0;
  }}
  .laser-line {{
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 3px;
    background: #10B981;
    box-shadow: 0 0 15px #10B981, 0 0 25px #34D399;
  }}
  .qr-code-graphic {{
    width: 140px;
    height: 140px;
    background: white;
    padding: 10px;
    border-radius: 12px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
  }}
  .qr-block {{ background: #020617; border-radius: 2px; }}
  
  .success-toast {{
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    border-radius: 18px;
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35);
  }}
  .check-circle {{
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: white;
    color: #059669;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 900;
  }}
  .success-text-bold {{ font-size: 18px; font-weight: 900; color: white; }}
  .success-text-sub {{ font-size: 12px; color: #D1FAE5; font-weight: 700; }}

  /* 3 Floating Badges */
  .badge-grid {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    z-index: 10;
  }}
  .badge-item {{
    background: rgba(30, 41, 59, 0.85);
    border: 1.5px solid rgba(148, 163, 184, 0.2);
    border-radius: 20px;
    padding: 18px 14px;
    text-align: center;
  }}
  .badge-icon {{ font-size: 28px; margin-bottom: 8px; }}
  .badge-label {{ font-size: 15px; font-weight: 800; color: #FFFFFF; line-height: 1.25; }}

  /* Footer CTA */
  .footer-cta {{
    background: rgba(15, 23, 42, 0.85);
    border: 2px solid rgba(16, 185, 129, 0.5);
    border-radius: 24px;
    padding: 24px 35px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  }}
  .cta-title {{ font-size: 22px; font-weight: 900; color: #FFFFFF; }}
  .cta-desc {{ font-size: 16px; font-weight: 700; color: #34D399; }}
  .cta-btn {{
    background: #10B981;
    color: #020617;
    font-size: 20px;
    font-weight: 900;
    padding: 16px 32px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
  }}
</style>
</head>
<body>
  <div class="glow-top"></div>

  <!-- Header -->
  <div class="header">
    <div class="brand-group">
      <img src="{logo_src}" class="logo" alt="FidelityDZ Logo" />
      <div class="brand-title">Fidelity<span>DZ</span></div>
    </div>
    <div class="pill-badge">⚡ Scanner Caisse Ultra-Rapide</div>
  </div>

  <!-- Headline -->
  <div class="headline-section">
    <div class="hero-title">1.2 Seconde <span>Chrono</span> en Caisse</div>
    <div class="hero-subtitle-ar arabic">سكاني الزبون في ثانية واحدة بلا ما تعطل لاكاس</div>
  </div>

  <!-- Mockup Phone Viewfinder -->
  <div class="device-mockup-wrapper">
    <div class="phone-frame">
      <div class="scanner-header">
        <span>● FIDELITYDZ SCANNER</span>
        <span>MODE CAISSE</span>
      </div>

      <div class="scanner-viewfinder">
        <div class="qr-code-graphic">
          <div class="qr-block"></div><div></div><div class="qr-block"></div><div class="qr-block"></div><div></div><div class="qr-block"></div>
          <div></div><div class="qr-block"></div><div></div><div></div><div class="qr-block"></div><div></div>
          <div class="qr-block"></div><div class="qr-block"></div><div class="qr-block"></div><div class="qr-block"></div><div></div><div class="qr-block"></div>
          <div></div><div></div><div class="qr-block"></div><div></div><div class="qr-block"></div><div></div>
          <div class="qr-block"></div><div></div><div></div><div class="qr-block"></div><div></div><div class="qr-block"></div>
          <div class="qr-block"></div><div class="qr-block"></div><div></div><div class="qr-block"></div><div class="qr-block"></div><div></div>
        </div>
        <div class="laser-line"></div>
      </div>

      <div class="success-toast">
        <div class="check-circle">✓</div>
        <div>
          <div class="success-text-bold">+1 Tampon Enregistré !</div>
          <div class="success-text-sub">Client: 0550 •• •• 84 (Visite N°7)</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 3 Highlights -->
  <div class="badge-grid">
    <div class="badge-item">
      <div class="badge-icon">📲</div>
      <div class="badge-label">Zéro App<br/><span style="color:#34D399">Pas d'installation</span></div>
    </div>
    <div class="badge-item">
      <div class="badge-icon">⚡</div>
      <div class="badge-label">1.2s Chrono<br/><span style="color:#FBBF24">Ultra rapide</span></div>
    </div>
    <div class="badge-item">
      <div class="badge-icon">🛡️</div>
      <div class="badge-label">Anti-Fraude<br/><span style="color:#60A5FA">Cooldown sécurisé</span></div>
    </div>
  </div>

  <!-- Footer CTA -->
  <div class="footer-cta">
    <div>
      <div class="cta-title">Activez votre boutique</div>
      <div class="cta-desc arabic">أرسل رسالة في الخاص لتفعيل المنصة في محلك</div>
    </div>
    <div class="cta-btn">
      <span>Envoyer un DM</span>
      <span>➔</span>
    </div>
  </div>
</body>
</html>
"""
    },
    {
        "id": "post_3_google_reviews",
        "title": "Booster Avis Google 5 Etoiles",
        "html": f"""
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: 1080px;
    height: 1350px;
    background: #020617;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #F8FAFC;
    padding: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }}
  .arabic {{ font-family: 'Cairo', sans-serif; direction: rtl; }}

  /* Glow */
  .glow-gold {{
    position: absolute;
    top: -120px;
    left: 50%;
    transform: translateX(-50%);
    width: 850px;
    height: 550px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(2, 6, 23, 0) 70%);
    pointer-events: none;
  }}

  /* Header */
  .header {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  }}
  .brand-group {{ display: flex; align-items: center; gap: 18px; }}
  .logo {{ width: 72px; height: 72px; border-radius: 18px; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.35); }}
  .brand-title {{ font-size: 32px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF; }}
  .brand-title span {{ color: #F59E0B; }}
  .gold-badge {{
    background: rgba(245, 158, 11, 0.15);
    border: 1.5px solid #F59E0B;
    padding: 10px 22px;
    border-radius: 50px;
    font-size: 18px;
    font-weight: 800;
    color: #FBBF24;
  }}

  /* Headline */
  .headline-section {{
    text-align: center;
    margin-top: 25px;
    z-index: 10;
  }}
  .title-fr {{
    font-size: 48px;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -1px;
  }}
  .title-fr span {{ color: #F59E0B; }}
  .title-ar {{
    font-size: 34px;
    font-weight: 800;
    color: #34D399;
    margin-top: 10px;
  }}

  /* Main Google Maps Rating Mockup */
  .center-showcase {{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    margin: 30px 0;
    z-index: 10;
  }}
  .maps-card {{
    width: 650px;
    background: #0F172A;
    border: 2px solid rgba(245, 158, 11, 0.6);
    border-radius: 28px;
    padding: 35px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.7), 0 0 40px rgba(245, 158, 11, 0.2);
    text-align: center;
  }}
  .stars-row {{
    display: flex;
    justify-content: center;
    gap: 12px;
    font-size: 48px;
    color: #F59E0B;
    margin-bottom: 12px;
    text-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
  }}
  .rating-score {{
    font-size: 64px;
    font-weight: 900;
    color: #FFFFFF;
    line-height: 1;
  }}
  .rating-count {{
    font-size: 20px;
    font-weight: 700;
    color: #94A3B8;
    margin-top: 8px;
  }}

  /* Connect mechanism */
  .mechanism-pill {{
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(245, 158, 11, 0.25));
    border: 1.5px solid rgba(52, 211, 153, 0.5);
    border-radius: 20px;
    padding: 22px 35px;
    width: 650px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }}
  .mech-text {{
    font-size: 20px;
    font-weight: 800;
    color: #FFFFFF;
  }}
  .mech-tag {{
    background: #F59E0B;
    color: #020617;
    font-size: 16px;
    font-weight: 900;
    padding: 8px 18px;
    border-radius: 12px;
  }}

  /* 3 Benefits */
  .benefits-row {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    z-index: 10;
  }}
  .benefit-card {{
    background: rgba(30, 41, 59, 0.7);
    border: 1.5px solid rgba(148, 163, 184, 0.2);
    border-radius: 20px;
    padding: 20px 16px;
    text-align: center;
  }}
  .benefit-title {{ font-size: 16px; font-weight: 800; color: #FFFFFF; margin-top: 6px; }}
  .benefit-sub {{ font-size: 13px; font-weight: 600; color: #94A3B8; }}

  /* Footer CTA */
  .footer-cta {{
    background: rgba(15, 23, 42, 0.85);
    border: 2px solid rgba(245, 158, 11, 0.5);
    border-radius: 24px;
    padding: 24px 35px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  }}
  .cta-title {{ font-size: 22px; font-weight: 900; color: #FFFFFF; }}
  .cta-desc {{ font-size: 16px; font-weight: 700; color: #FBBF24; }}
  .cta-btn {{
    background: #F59E0B;
    color: #020617;
    font-size: 20px;
    font-weight: 900;
    padding: 16px 34px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4);
  }}
</style>
</head>
<body>
  <div class="glow-gold"></div>

  <!-- Header -->
  <div class="header">
    <div class="brand-group">
      <img src="{logo_src}" class="logo" alt="FidelityDZ Logo" />
      <div class="brand-title">Fidelity<span>DZ</span></div>
    </div>
    <div class="gold-badge">★ Booster Google Maps 5★</div>
  </div>

  <!-- Headline -->
  <div class="headline-section">
    <div class="title-fr">+200 Avis <span>Google Maps</span> 5 Étoiles</div>
    <div class="title-ar arabic">كيفاش تطلع تقييم محلك لـ 5 نجوم بلا ما تترجى الزبون ؟</div>
  </div>

  <!-- Showcase -->
  <div class="center-showcase">
    <div class="maps-card">
      <div class="stars-row">★★★★★</div>
      <div class="rating-score">4.9 / 5.0</div>
      <div class="rating-count">+248 Avis Vérifiés sur Google Maps</div>
    </div>

    <div class="mechanism-pill">
      <div class="mech-text">1 Avis 5 Étoiles Google = <span style="color:#FBBF24">+1 Tampon Offert</span></div>
      <div class="mech-tag">Automatique</div>
    </div>
  </div>

  <!-- Benefits -->
  <div class="benefits-row">
    <div class="benefit-card">
      <div style="font-size:26px;">📍</div>
      <div class="benefit-title">N°1 du Quartier</div>
      <div class="benefit-sub">Apparaissez premier sur Maps</div>
    </div>
    <div class="benefit-card">
      <div style="font-size:26px;">⭐</div>
      <div class="benefit-title">Confiance Totale</div>
      <div class="benefit-sub">Avis vérifiés de vrais clients</div>
    </div>
    <div class="benefit-card">
      <div style="font-size:26px;">👥</div>
      <div class="benefit-title">+40% Nouveaux Clients</div>
      <div class="benefit-sub">Attirez du passage naturel</div>
    </div>
  </div>

  <!-- Footer CTA -->
  <div class="footer-cta">
    <div>
      <div class="cta-title">Activez cette option dans votre boutique</div>
      <div class="cta-desc arabic">أرسل رسالة في الخاص ونفعلوهالك مباشرة</div>
    </div>
    <div class="cta-btn">
      <span>Envoyer un DM</span>
      <span>➔</span>
    </div>
  </div>
</body>
</html>
"""
    }
]

os.makedirs('public/instagram', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1080, "height": 1350})

    for post in posts:
        out_path = f"public/instagram/{post['id']}.png"
        page.set_content(post["html"])
        page.wait_for_timeout(1000)
        page.screenshot(path=out_path, clip={"x": 0, "y": 0, "width": 1080, "height": 1350})
        print(f"Generated {out_path} ({os.path.getsize(out_path)} bytes)")

    browser.close()
