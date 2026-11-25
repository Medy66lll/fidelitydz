import os
import base64
from playwright.sync_api import sync_playwright

with open('public/logo.png', 'rb') as f:
    b64_logo = base64.b64encode(f.read()).decode('utf-8')
logo_src = f"data:image/png;base64,{b64_logo}"

output_base = "public/instagram/highlights_stories"
os.makedirs(output_base, exist_ok=True)

# Common HTML Head with fonts, CSS, and styling
def get_html_wrapper(content, bg_accent="rgba(16, 185, 129, 0.25)"):
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800;900&family=JetBrains+Mono:wght@700;800&display=swap');
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: 1080px;
    height: 1920px;
    background: #020617;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #F8FAFC;
    position: relative;
    overflow: hidden;
    padding: 90px 70px 100px 70px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }}
  .mono {{ font-family: 'JetBrains Mono', monospace; }}
  .arabic {{ font-family: 'Cairo', sans-serif; direction: rtl; }}

  /* Grid & Ambient Glow */
  .bg-grid {{
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
    background-size: 60px 60px;
    z-index: 0;
  }}
  .glow-top {{
    position: absolute;
    width: 900px;
    height: 900px;
    top: -200px;
    left: 90px;
    border-radius: 50%;
    background: radial-gradient(circle, {bg_accent} 0%, rgba(2, 6, 23, 0) 70%);
    pointer-events: none;
    z-index: 0;
  }}
  .glow-bottom {{
    position: absolute;
    width: 700px;
    height: 700px;
    bottom: -150px;
    right: 50px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(2, 6, 23, 0) 70%);
    pointer-events: none;
    z-index: 0;
  }}

  /* Top Bar */
  .top-bar {{
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }}
  .badge-category {{
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.35);
    color: #34D399;
    padding: 10px 22px;
    border-radius: 9999px;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }}
  .slide-stepper {{
    display: flex;
    gap: 8px;
  }}
  .step-bar {{
    width: 45px;
    height: 6px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.2);
  }}
  .step-bar.active {{
    background: #10B981;
    box-shadow: 0 0 10px #10B981;
  }}

  /* Content Container */
  .content {{
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin: auto 0;
  }}

  /* Card Box */
  .ui-card {{
    background: rgba(15, 23, 42, 0.88);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 36px;
    padding: 40px;
    width: 100%;
    backdrop-filter: blur(16px);
    box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.6);
  }}

  /* Footer Callout */
  .footer-bar {{
    position: relative;
    z-index: 10;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 18px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }}
</style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="glow-top"></div>
  <div class="glow-bottom"></div>
  {content}
</body>
</html>
"""

# Story definition list
stories = [
    # ---------------- HIGHLIGHT 1: CONCEPT & PLATEFORME ----------------
    {
        "id": "hl1_concept_1",
        "folder": "hl1_concept",
        "bg": "rgba(239, 68, 68, 0.2)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">💡 C'EST QUOI FIDELITYDZ ?</div>
            <div class="slide-stepper">
              <div class="step-bar active"></div><div class="step-bar"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🗑️ ➔ 📱</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              LE CARTON, C'EST FINI.<br>PASSEZ AU DIGITAL.
            </h1>
            
            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px;">
                <div style="font-size: 40px; background: rgba(239, 68, 68, 0.2); width: 70px; height: 70px; border-radius: 20px; display: flex; align-items: center; justify-content: center;">❌</div>
                <div>
                  <div style="font-size: 26px; font-weight: 800; color: #FCA5A5;">Les cartes papier traditionnelles</div>
                  <div style="font-size: 20px; color: #94A3B8;">80% perdues, oubliées à la maison ou froissées.</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 20px;">
                <div style="font-size: 40px; background: rgba(16, 185, 129, 0.2); width: 70px; height: 70px; border-radius: 20px; display: flex; align-items: center; justify-content: center;">✅</div>
                <div>
                  <div style="font-size: 26px; font-weight: 800; color: #6EE7B7;">FidelityDZ : 100% dans le smartphone</div>
                  <div style="font-size: 20px; color: #94A3B8;">Toujours avec le client. Zéro perte. Zéro impression.</div>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #FCD34D;">
              ودّع كارطة الكارطون، وزيد فمداخيل محلك بالديجيتال !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Swipe pour voir la solution 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl1_concept_2",
        "folder": "hl1_concept",
        "bg": "rgba(16, 185, 129, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">💡 C'EST QUOI FIDELITYDZ ?</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar active"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🇩🇿 ⚡ 📲</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              LA 1ÈRE PLATEFORME SAAS<br>DE FIDÉLITÉ EN ALGÉRIE
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #34D399; font-weight: 800; margin-bottom: 15px;">CONÇU POUR LE COMMERCE LOCAL :</div>
              <div style="display: flex; flex-direction: column; gap: 18px;">
                <div style="display: flex; align-items: center; gap: 18px;">
                  <span style="font-size: 32px;">☕</span>
                  <span style="font-size: 22px; font-weight: 700; color: #F8FAFC;">Cafés & Salons de thé</span>
                </div>
                <div style="display: flex; align-items: center; gap: 18px;">
                  <span style="font-size: 32px;">🍔</span>
                  <span style="font-size: 22px; font-weight: 700; color: #F8FAFC;">Fast-food & Restaurants</span>
                </div>
                <div style="display: flex; align-items: center; gap: 18px;">
                  <span style="font-size: 32px;">👗</span>
                  <span style="font-size: 22px; font-weight: 700; color: #F8FAFC;">Boutiques de prêt-à-porter</span>
                </div>
                <div style="display: flex; align-items: center; gap: 18px;">
                  <span style="font-size: 32px;">✂️</span>
                  <span style="font-size: 22px; font-weight: 700; color: #F8FAFC;">Salons de coiffure & Beauté</span>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #6EE7B7;">
              تخدم بأي تيليفون عندك، ساهلة وبلا ما تبدل ماتريال !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Les 3 avantages clés 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl1_concept_3",
        "folder": "hl1_concept",
        "bg": "rgba(59, 130, 246, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">💡 C'EST QUOI FIDELITYDZ ?</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar"></div><div class="step-bar active"></div>
            </div>
          </div>

          <div class="content">
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 35px;">
              LES 3 PILIERS DU SUCCÈS
            </h1>

            <div style="display: flex; flex-direction: column; gap: 20px; width: 100%; margin-bottom: 30px;">
              <div class="ui-card" style="padding: 28px; text-align: left; display: flex; align-items: center; gap: 24px;">
                <div style="font-size: 44px; width: 80px; height: 80px; border-radius: 20px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">🚀</div>
                <div>
                  <div style="font-size: 26px; font-weight: 900; color: #F8FAFC;">0 Téléchargement</div>
                  <div style="font-size: 19px; color: #94A3B8;">Le client scanne et sa carte s'ouvre direct en 1 clic.</div>
                </div>
              </div>

              <div class="ui-card" style="padding: 28px; text-align: left; display: flex; align-items: center; gap: 24px;">
                <div style="font-size: 44px; width: 80px; height: 80px; border-radius: 20px; background: rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">👛</div>
                <div>
                  <div style="font-size: 26px; font-weight: 900; color: #F8FAFC;">Apple & Google Wallet</div>
                  <div style="font-size: 19px; color: #94A3B8;">Compatible avec 100% des smartphones.</div>
                </div>
              </div>

              <div class="ui-card" style="padding: 28px; text-align: left; display: flex; align-items: center; gap: 24px;">
                <div style="font-size: 44px; width: 80px; height: 80px; border-radius: 20px; background: rgba(245, 158, 11, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">⚡</div>
                <div>
                  <div style="font-size: 26px; font-weight: 900; color: #F8FAFC;">Validation 1.2s en caisse</div>
                  <div style="font-size: 19px; color: #94A3B8;">Zéro file d'attente, le tampon s'ajoute immédiatement.</div>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 34px; font-weight: 900; color: #FCD34D;">
              شوف الـ Highlight الجاي كيفاش تفتح حسابك فـ 60 ثانية !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #34D399; font-weight: 800;">DM pour tester dans ton commerce 📩</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },

    # ---------------- HIGHLIGHT 2: CRÉER SON COMPTE (60s) ----------------
    {
        "id": "hl2_inscription_1",
        "folder": "hl2_inscription",
        "bg": "rgba(16, 185, 129, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">⚡ CRÉER SON COMPTE</div>
            <div class="slide-stepper">
              <div class="step-bar active"></div><div class="step-bar"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">⏱️ 📝</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              INSCRIPTION EN 60 SECONDES CHRONO
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #34D399; font-weight: 800; margin-bottom: 20px;">FORMULAIRE ULTRA-RAPIDE :</div>
              
              <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="background: #020617; border: 1px solid #334155; border-radius: 16px; padding: 16px 20px;">
                  <div style="font-size: 15px; color: #64748B; font-weight: 700;">NOM DE TON COMMERCE</div>
                  <div style="font-size: 22px; font-weight: 800; color: #F8FAFC;">Café El Bahdja ☕</div>
                </div>
                <div style="background: #020617; border: 1px solid #334155; border-radius: 16px; padding: 16px 20px;">
                  <div style="font-size: 15px; color: #64748B; font-weight: 700;">WILAYA</div>
                  <div style="font-size: 22px; font-weight: 800; color: #F8FAFC;">16 - Alger 🇩🇿</div>
                </div>
                <div style="background: #020617; border: 1px solid #334155; border-radius: 16px; padding: 16px 20px;">
                  <div style="font-size: 15px; color: #64748B; font-weight: 700;">NUMÉRO DE TÉLÉPHONE</div>
                  <div class="mono" style="font-size: 22px; font-weight: 800; color: #F8FAFC;">0550 XX XX XX</div>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #6EE7B7;">
              عمر معلومات محلك فدقيقة واحدة وراك واجد !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Lien auto-généré sécurisé 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl2_inscription_2",
        "folder": "hl2_inscription",
        "bg": "rgba(59, 130, 246, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">⚡ CRÉER SON COMPTE</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar active"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🔒 ✨</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              LIEN QR CODE AUTO-GÉNÉRÉ
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #60A5FA; font-weight: 800; margin-bottom: 15px;">ZÉRO ERREUR TECHNIQUE :</div>
              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5; margin-bottom: 25px;">
                Le lien unique de ton commerce se crée automatiquement à partir du nom. Il est sécurisé et non modifiable pour garantir la protection de tes scans.
              </div>

              <div style="background: rgba(16, 185, 129, 0.15); border: 1px dashed #10B981; border-radius: 20px; padding: 22px; display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 32px;">🔗</span>
                <div>
                  <div style="font-size: 16px; color: #34D399; font-weight: 800;">TON IDENTIFIANT UNIQUE CLIENT</div>
                  <div class="mono" style="font-size: 22px; font-weight: 900; color: #F8FAFC;">join / cafe-el-bahdja</div>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #93C5FD;">
              الرابط يتصاوب أوتوماتيك ويحميك من أي خلط فالسكان !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Ton flyer de comptoir prêt 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl2_inscription_3",
        "folder": "hl2_inscription",
        "bg": "rgba(245, 158, 11, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">⚡ CRÉER SON COMPTE</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar"></div><div class="step-bar active"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🖨️ 🖼️</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              FLYER & QR COMPTOIR<br>PRÊT À IMPRIMER
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #FBBF24; font-weight: 800; margin-bottom: 15px;">TÉLÉCHARGEMENT DIRECT :</div>
              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5; margin-bottom: 25px;">
                Dès ton inscription, tu télécharges ton affiche au format PDF ou PNG haute résolution avec ton logo et ton QR code pour le coller sur ton comptoir.
              </div>

              <div style="display: flex; justify-content: space-around; background: #020617; border-radius: 20px; padding: 20px;">
                <div style="text-align: center;">
                  <div style="font-size: 36px;">📄</div>
                  <div style="font-size: 16px; font-weight: 800; color: #F8FAFC; margin-top: 5px;">Format A4/A5</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 36px;">🏷️</div>
                  <div style="font-size: 16px; font-weight: 800; color: #F8FAFC; margin-top: 5px;">Chevalet Caisse</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 36px;">🪟</div>
                  <div style="font-size: 16px; font-weight: 800; color: #F8FAFC; margin-top: 5px;">Sticker Vitrine</div>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #FDE68A;">
              إطبع البلاكة تاعك وحطها فوق الكاسة ديركت !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #FBBF24; font-weight: 800;">Envoie un DM pour ton flyer test 📩</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },

    # ---------------- HIGHLIGHT 3: MODIFIER LA CARTE (STUDIO) ----------------
    {
        "id": "hl3_personnalisation_1",
        "folder": "hl3_personnalisation",
        "bg": "rgba(16, 185, 129, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">🎨 MODIFIER SA CARTE</div>
            <div class="slide-stepper">
              <div class="step-bar active"></div><div class="step-bar"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🎯 🛠️</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              LE STUDIO DE PERSONNALISATION
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #34D399; font-weight: 800; margin-bottom: 15px;">C'EST TOI LE PATRON :</div>
              <div style="display: flex; flex-direction: column; gap: 18px;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 15px;">
                  <span style="font-size: 20px; font-weight: 700; color: #F8FAFC;">Type de programme</span>
                  <span class="mono" style="background: rgba(16, 185, 129, 0.2); color: #34D399; padding: 6px 14px; border-radius: 10px; font-weight: 800;">TAMPONS (Stamps)</span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 15px;">
                  <span style="font-size: 20px; font-weight: 700; color: #F8FAFC;">Nombre de tampons</span>
                  <span class="mono" style="font-size: 22px; font-weight: 900; color: #FBBF24;">10 Tampons</span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 20px; font-weight: 700; color: #F8FAFC;">Bonus 1er scan</span>
                  <span class="mono" style="background: rgba(59, 130, 246, 0.2); color: #60A5FA; padding: 6px 14px; border-radius: 10px; font-weight: 800;">+1 Offert direct</span>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #6EE7B7;">
              خير شحال من طابع تحب: 6، 8 ولا 10 طوابع !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Personnaliser la récompense 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl3_personnalisation_2",
        "folder": "hl3_personnalisation",
        "bg": "rgba(245, 158, 11, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">🎨 MODIFIER SA CARTE</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar active"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🎁 ☕</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              DÉFINIS TA RÉCOMPENSE
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #FBBF24; font-weight: 800; margin-bottom: 15px;">ADAPTÉ À TON SECTEUR :</div>
              
              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="background: #020617; border-left: 4px solid #10B981; border-radius: 12px; padding: 14px 18px;">
                  <div style="font-size: 16px; color: #10B981; font-weight: 800;">CAFÉ / PÂTISSERIE</div>
                  <div style="font-size: 20px; font-weight: 800; color: #F8FAFC;">"10ème Café ou Boisson Offert"</div>
                </div>
                <div style="background: #020617; border-left: 4px solid #3B82F6; border-radius: 12px; padding: 14px 18px;">
                  <div style="font-size: 16px; color: #60A5FA; font-weight: 800;">FAST FOOD / RESTO</div>
                  <div style="font-size: 20px; font-weight: 800; color: #F8FAFC;">"Menu Maxi ou Dessert Gratuit"</div>
                </div>
                <div style="background: #020617; border-left: 4px solid #EC4899; border-radius: 12px; padding: 14px 18px;">
                  <div style="font-size: 16px; color: #F472B6; font-weight: 800;">SALON DE COIFFURE</div>
                  <div style="font-size: 20px; font-weight: 800; color: #F8FAFC;">"-30% sur la 6ème prestation"</div>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #FDE68A;">
              حط الكادو اللي يخلي الزبون يعاود يرجع لعندك !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Booster Google Maps 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl3_personnalisation_3",
        "folder": "hl3_personnalisation",
        "bg": "rgba(234, 179, 8, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">🎨 MODIFIER SA CARTE</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar"></div><div class="step-bar active"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">⭐ 🚀</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              BOOSTER D'AVIS GOOGLE MAPS
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #FACC15; font-weight: 800; margin-bottom: 15px;">LA FONCTION SECRÈTE :</div>
              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5; margin-bottom: 25px;">
                Active l'option <strong>"Récompense Avis Google"</strong> : le client gagne +1 tampon bonus s'il laisse un avis 5 étoiles sur ta fiche Google Maps !
              </div>

              <div style="background: rgba(250, 204, 21, 0.15); border: 1px solid #FACC15; border-radius: 20px; padding: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 24px; font-weight: 900; color: #FDE047;">⭐⭐⭐⭐⭐ 4.9/5</div>
                  <div style="font-size: 16px; color: #E2E8F0; font-weight: 700;">+140 avis authentiques en 30 jours</div>
                </div>
                <div class="mono" style="font-size: 28px; font-weight: 900; color: #10B981;">+1 TAMPON</div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #FEF08A;">
              طلع محلك رقم #1 فـ Google Maps بكل سهولة !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #FACC15; font-weight: 800;">Commente "STUDIO" pour tester 📩</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },

    # ---------------- HIGHLIGHT 4: CÔTÉ CLIENT (LA CARTE) ----------------
    {
        "id": "hl4_cote_client_1",
        "folder": "hl4_cote_client",
        "bg": "rgba(59, 130, 246, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">📲 CÔTÉ CLIENT</div>
            <div class="slide-stepper">
              <div class="step-bar active"></div><div class="step-bar"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">📸 ⚡</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              LE CLIENT SCANNE AVEC<br>SON APPAREIL PHOTO
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #60A5FA; font-weight: 800; margin-bottom: 15px;">ZÉRO APPLICATION !</div>
              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5; margin-bottom: 25px;">
                Le client n'a pas besoin de Play Store ni d'App Store. Il ouvre juste l'appareil photo de son téléphone et vise le QR code posé sur ton comptoir.
              </div>

              <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; border-radius: 18px; padding: 18px; display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 32px;">⚡</span>
                <span style="font-size: 20px; font-weight: 800; color: #34D399;">Ouverture immédiate en 0.5 seconde !</span>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #93C5FD;">
              ماكانش تيليشارجمون.. يسكاني الكود بالكاميرا برك !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Voir la carte s'afficher 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl4_cote_client_2",
        "folder": "hl4_cote_client",
        "bg": "rgba(16, 185, 129, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">📲 CÔTÉ CLIENT</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar active"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">👛 📱</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              SA CARTE DANS SON SMARTPHONE
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <span style="font-size: 22px; font-weight: 900; color: #F8FAFC;">Café El Bahdja ☕</span>
                <span class="mono" style="font-size: 16px; color: #34D399; font-weight: 800;">4 / 10 TAMPONS</span>
              </div>

              <!-- Stamp Circles Grid Mockup -->
              <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 25px;">
                <div style="height: 65px; border-radius: 50%; background: #10B981; display: flex; align-items: center; justify-content: center; font-size: 26px;">☕</div>
                <div style="height: 65px; border-radius: 50%; background: #10B981; display: flex; align-items: center; justify-content: center; font-size: 26px;">☕</div>
                <div style="height: 65px; border-radius: 50%; background: #10B981; display: flex; align-items: center; justify-content: center; font-size: 26px;">☕</div>
                <div style="height: 65px; border-radius: 50%; background: #10B981; display: flex; align-items: center; justify-content: center; font-size: 26px;">☕</div>
                <div style="height: 65px; border-radius: 50%; background: #1E293B; border: 2px dashed #475569; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #64748B;">5</div>
                <div style="height: 65px; border-radius: 50%; background: #1E293B; border: 2px dashed #475569; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #64748B;">6</div>
                <div style="height: 65px; border-radius: 50%; background: #1E293B; border: 2px dashed #475569; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #64748B;">7</div>
                <div style="height: 65px; border-radius: 50%; background: #1E293B; border: 2px dashed #475569; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #64748B;">8</div>
                <div style="height: 65px; border-radius: 50%; background: #1E293B; border: 2px dashed #475569; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #64748B;">9</div>
                <div style="height: 65px; border-radius: 50%; background: rgba(245, 158, 11, 0.2); border: 2px solid #F59E0B; display: flex; align-items: center; justify-content: center; font-size: 26px;">🎁</div>
              </div>

              <div style="font-size: 18px; color: #94A3B8; text-align: center; font-weight: 700;">
                Encore 6 cafés pour débloquer votre cadeau ! 🎉
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #6EE7B7;">
              يشوف طوابعو قدام عينيه ومتحمس يكمل الكادو !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Ajouter à Apple / Google Wallet 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl4_cote_client_3",
        "folder": "hl4_cote_client",
        "bg": "rgba(168, 85, 247, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">📲 CÔTÉ CLIENT</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar"></div><div class="step-bar active"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🍎 🤖</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              APPLE WALLET & GOOGLE WALLET
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #C084FC; font-weight: 800; margin-bottom: 15px;">TOUJOURS DANS SA POCHE :</div>
              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5; margin-bottom: 25px;">
                En 1 clic, le client ajoute la carte dans l'application Wallet de son iPhone ou Android. Elle reste à côté de ses cartes bancaires !
              </div>

              <div style="display: flex; gap: 16px;">
                <div style="flex: 1; background: #000; border: 1px solid #334155; border-radius: 18px; padding: 18px; text-align: center;">
                  <div style="font-size: 28px;">🍏</div>
                  <div style="font-size: 16px; font-weight: 800; color: #F8FAFC; margin-top: 5px;">Apple Wallet</div>
                </div>
                <div style="flex: 1; background: #000; border: 1px solid #334155; border-radius: 18px; padding: 18px; text-align: center;">
                  <div style="font-size: 28px;">🤖</div>
                  <div style="font-size: 16px; font-weight: 800; color: #F8FAFC; margin-top: 5px;">Google Wallet</div>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #E9D5FF;">
              الكارطة تبقى ديما فتلفونو وما تضيعش قاع !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #C084FC; font-weight: 800;">DM pour tester l'expérience client 📩</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },

    # ---------------- HIGHLIGHT 5: COMMENT SCANNER (EN CAISSE) ----------------
    {
        "id": "hl5_scanner_caisse_1",
        "folder": "hl5_scanner_caisse",
        "bg": "rgba(16, 185, 129, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">⚡ EN CAISSE</div>
            <div class="slide-stepper">
              <div class="step-bar active"></div><div class="step-bar"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🏪 📱</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              LE SCANNER CAISSIER ULTRA-SIMPLE
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #34D399; font-weight: 800; margin-bottom: 15px;">AUCUN MATÉRIEL SPÉCIAL :</div>
              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5; margin-bottom: 25px;">
                Utilise n'importe quel smartphone ou tablette de ton commerce. Ouvre la page Scanner Caissier et vise le QR code du client.
              </div>

              <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; border-radius: 18px; padding: 20px; display: flex; align-items: center; justify-content: space-around;">
                <div style="text-align: center;">
                  <div style="font-size: 32px;">📷</div>
                  <div style="font-size: 16px; font-weight: 800; color: #F8FAFC; margin-top: 4px;">Scan Caméra</div>
                </div>
                <div style="font-size: 24px; color: #64748B;">OU</div>
                <div style="text-align: center;">
                  <div style="font-size: 32px;">🔢</div>
                  <div style="font-size: 16px; font-weight: 800; color: #F8FAFC; margin-top: 4px;">N° Téléphone</div>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #6EE7B7;">
              بأي تلفون عندك فالكاسة تخدم ديركت بلا ما تشري والو !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Validation en 1.2s 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl5_scanner_caisse_2",
        "folder": "hl5_scanner_caisse",
        "bg": "rgba(59, 130, 246, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">⚡ EN CAISSE</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar active"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">⏱️ ⚡</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              BIP ! TAMPON VALIDÉ EN 1.2s
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <div class="mono" style="font-size: 40px; font-weight: 900; color: #10B981;">00:01.2s</div>
                <span class="mono" style="background: rgba(16, 185, 129, 0.2); color: #10B981; padding: 6px 14px; border-radius: 10px; font-weight: 800;">CONFIRMÉ</span>
              </div>

              <div style="font-size: 24px; font-weight: 900; color: #F8FAFC; margin-bottom: 8px;">Client : Karim B. (0555 XX XX XX)</div>
              <div style="font-size: 19px; color: #34D399; font-weight: 700; margin-bottom: 20px;">+1 Tampon ajouté • Total : 5/10 tampons</div>

              <div style="background: #020617; border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 14px;">
                <span style="font-size: 28px;">🔔</span>
                <span style="font-size: 17px; color: #CBD5E1; font-weight: 600;">Son de confirmation immédiat pour le caissier et le client.</span>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #93C5FD;">
              بيب ! الطابع تسجل فاللحظة وبلا ما تحبس لاشين !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Protection hors-ligne 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl5_scanner_caisse_3",
        "folder": "hl5_scanner_caisse",
        "bg": "rgba(245, 158, 11, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">⚡ EN CAISSE</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar"></div><div class="step-bar active"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">📶 🔒</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              MARCHE MÊME SANS INTERNET<br>& SÉCURITÉ ANTI-FRAUDE
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 18px;">
                <div style="font-size: 36px; background: rgba(59, 130, 246, 0.2); width: 65px; height: 65px; border-radius: 18px; display: flex; align-items: center; justify-content: center;">📡</div>
                <div>
                  <div style="font-size: 22px; font-weight: 800; color: #60A5FA;">Mode Hors-Ligne (Offline Sync)</div>
                  <div style="font-size: 18px; color: #94A3B8;">Connexion coupée ? Les scans s'enregistrent et se synchronisent seuls.</div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 18px;">
                <div style="font-size: 36px; background: rgba(245, 158, 11, 0.2); width: 65px; height: 65px; border-radius: 18px; display: flex; align-items: center; justify-content: center;">🛡️</div>
                <div>
                  <div style="font-size: 22px; font-weight: 800; color: #FBBF24;">Délai Anti-Fraude (15 min)</div>
                  <div style="font-size: 18px; color: #94A3B8;">Impossible de scanner deux fois de suite la même carte.</div>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #FDE68A;">
              حتى وتتقطع الكونيكسيون، محلك يبقى خدام عادي ومحمي !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #FBBF24; font-weight: 800;">Commente "SCANNER" pour tester 📩</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },

    # ---------------- HIGHLIGHT 6: VOIR SES CLIENTS (CRM) ----------------
    {
        "id": "hl6_voir_clients_1",
        "folder": "hl6_voir_clients",
        "bg": "rgba(16, 185, 129, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">👥 MES CLIENTS</div>
            <div class="slide-stepper">
              <div class="step-bar active"></div><div class="step-bar"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">📊 👥</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              TON FICHIER CLIENT EN DIRECT
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #34D399; font-weight: 800; margin-bottom: 15px;">DASHBOARD COMMERÇANT :</div>
              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5; margin-bottom: 25px;">
                Fini les clients anonymes ! Tu vois la liste de tous tes clients inscrits, leur numéro, le nombre de visites et leur date de dernier passage.
              </div>

              <div style="display: flex; justify-content: space-around; background: #020617; border-radius: 20px; padding: 20px;">
                <div style="text-align: center;">
                  <div class="mono" style="font-size: 36px; font-weight: 900; color: #10B981;">342</div>
                  <div style="font-size: 15px; color: #94A3B8; font-weight: 700;">Clients Inscrits</div>
                </div>
                <div style="text-align: center;">
                  <div class="mono" style="font-size: 36px; font-weight: 900; color: #60A5FA;">+68%</div>
                  <div style="font-size: 15px; color: #94A3B8; font-weight: 700;">Visites Répétées</div>
                </div>
                <div style="text-align: center;">
                  <div class="mono" style="font-size: 36px; font-weight: 900; color: #FBBF24;">48</div>
                  <div style="font-size: 15px; color: #94A3B8; font-weight: 700;">Cadeaux Offerts</div>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #6EE7B7;">
              تعرف زبائن محلك بالواحد وتعرف شكون لي وفي وشكون لا !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Les segments intelligents 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl6_voir_clients_2",
        "folder": "hl6_voir_clients",
        "bg": "rgba(59, 130, 246, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">👥 MES CLIENTS</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar active"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🎯 🔍</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              FILTRES INTELLIGENTS
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #60A5FA; font-weight: 800; margin-bottom: 20px;">SÉPARATION PAR PROFIL :</div>
              
              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; border-radius: 16px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 20px; font-weight: 800; color: #34D399;">👑 Clients VIP (+5 visites)</span>
                  <span class="mono" style="font-size: 20px; font-weight: 900; color: #F8FAFC;">124</span>
                </div>
                <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid #F59E0B; border-radius: 16px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 20px; font-weight: 800; color: #FBBF24;">🎁 Récompense Prête à Consommer</span>
                  <span class="mono" style="font-size: 20px; font-weight: 900; color: #F8FAFC;">38</span>
                </div>
                <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #EF4444; border-radius: 16px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 20px; font-weight: 800; color: #F87171;">⚠️ Inactifs depuis 30 jours</span>
                  <span class="mono" style="font-size: 20px; font-weight: 900; color: #F8FAFC;">54</span>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #93C5FD;">
              فرّز زبائنك بكليك واحدة: لـ VIP ولي غابو عليك !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Relance WhatsApp directe 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl6_voir_clients_3",
        "folder": "hl6_voir_clients",
        "bg": "rgba(34, 197, 94, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">👥 MES CLIENTS</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar"></div><div class="step-bar active"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">💬 🚀</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              RELANCE WHATSAPP EN 1 CLIC
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #4ADE80; font-weight: 800; margin-bottom: 15px;">FAIS REVENIR TES CLIENTS :</div>
              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5; margin-bottom: 25px;">
                Un client n'est pas venu depuis 1 mois ? Clique sur l'icône WhatsApp pour lui envoyer un message prêt à l'emploi avec une offre spéciale !
              </div>

              <div style="background: rgba(34, 197, 94, 0.15); border: 1px solid #22C55E; border-radius: 20px; padding: 20px;">
                <div style="font-size: 16px; color: #4ADE80; font-weight: 800; margin-bottom: 6px;">EXEMPLE DE MESSAGE AUTO :</div>
                <div style="font-size: 19px; color: #F8FAFC; font-weight: 600; line-height: 1.4;">
                  "Salam Amine ! Tu nous manques chez Café El Bahdja ☕ Passe aujourd'hui et profite de ton café offert !"
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #86EFAC;">
              رجع الزبون لي نسى محلك بميساج واتساب بلمسة واحدة !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #4ADE80; font-weight: 800;">Commente "CLIENTS" pour tester 📩</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },

    # ---------------- HIGHLIGHT 7: RÉCOMPENSES & CARTE CLIENT ----------------
    {
        "id": "hl7_recompenses_1",
        "folder": "hl7_recompenses",
        "bg": "rgba(245, 158, 11, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">🎁 RÉCOMPENSES</div>
            <div class="slide-stepper">
              <div class="step-bar active"></div><div class="step-bar"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🎉 ✨</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              LE DÉBLOCAGE DU CADEAU EN DIRECT
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #FBBF24; font-weight: 800; margin-bottom: 15px;">L'EFFET WOW :</div>
              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5; margin-bottom: 25px;">
                Quand le client atteint son 10ème tampon, une explosion de confettis s'affiche sur son écran avec son bon cadeau débloqué !
              </div>

              <div style="background: rgba(245, 158, 11, 0.15); border: 2px solid #F59E0B; border-radius: 20px; padding: 22px; text-align: center;">
                <div style="font-size: 38px; margin-bottom: 6px;">🎁 🎉</div>
                <div style="font-size: 24px; font-weight: 900; color: #FDE68A;">RÉCOMPENSE PRÊTE !</div>
                <div style="font-size: 18px; color: #F8FAFC; margin-top: 4px;">"1 Café ou Boisson Offert"</div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #FDE68A;">
              فرحة الزبون كي يوصل للكادو تخليه وفي لمحلك طول العام !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Validation en caisse 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl7_recompenses_2",
        "folder": "hl7_recompenses",
        "bg": "rgba(16, 185, 129, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">🎁 RÉCOMPENSES</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar active"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🛡️ ✅</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              UTILISATION SÉCURISÉE EN CAISSE
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #34D399; font-weight: 800; margin-bottom: 15px;">ZÉRO FRAUDE :</div>
              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5; margin-bottom: 25px;">
                Le cadeau ne peut être consommé que lorsque le caissier scanne le QR code ou valide avec son code PIN caisse.
              </div>

              <div style="background: #020617; border-radius: 18px; padding: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 20px; font-weight: 800; color: #F8FAFC;">Statut du bon</div>
                  <div style="font-size: 16px; color: #10B981; font-weight: 700;">Validé par caissier #1</div>
                </div>
                <div class="mono" style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10B981; color: #10B981; padding: 8px 18px; border-radius: 12px; font-weight: 800;">
                  CONSOMMÉ
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #6EE7B7;">
              الكادو ما يقدر يديه الزبون حتى يفوت عليك فالكاسة !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Le cycle de fidélité infini 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl7_recompenses_3",
        "folder": "hl7_recompenses",
        "bg": "rgba(59, 130, 246, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">🎁 RÉCOMPENSES</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar"></div><div class="step-bar active"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🔄 📈</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              LE CYCLE INFINI DE RETOUR
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #60A5FA; font-weight: 800; margin-bottom: 15px;">DÈS QUE LE CADEAU EST PRIS :</div>
              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5; margin-bottom: 25px;">
                La carte redémarre automatiquement pour une nouvelle série de tampons. Le client ne repart jamais de zéro sans motivation !
              </div>

              <div style="display: flex; align-items: center; justify-content: space-around; background: #020617; border-radius: 20px; padding: 20px;">
                <div style="text-align: center;">
                  <span style="font-size: 32px;">☕</span>
                  <div style="font-size: 16px; font-weight: 800; color: #F8FAFC; margin-top: 4px;">Visite 1</div>
                </div>
                <div style="font-size: 24px; color: #10B981;">➔</div>
                <div style="text-align: center;">
                  <span style="font-size: 32px;">🎁</span>
                  <div style="font-size: 16px; font-weight: 800; color: #FBBF24; margin-top: 4px;">Cadeau</div>
                </div>
                <div style="font-size: 24px; color: #10B981;">➔</div>
                <div style="text-align: center;">
                  <span style="font-size: 32px;">🔄</span>
                  <div style="font-size: 16px; font-weight: 800; color: #60A5FA; margin-top: 4px;">Re-visite</div>
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #93C5FD;">
              دورة الزبائن ما تحبسش.. يدي كادو ويعاود يرجع !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #60A5FA; font-weight: 800;">Commente "VIP" pour tester 📩</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },

    # ---------------- HIGHLIGHT 8: FAQ & QUESTIONS FRÉQUENTES ----------------
    {
        "id": "hl8_faq_1",
        "folder": "hl8_faq",
        "bg": "rgba(168, 85, 247, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">❓ FAQ</div>
            <div class="slide-stepper">
              <div class="step-bar active"></div><div class="step-bar"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">💰 📱</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              LE CLIENT DOIT-IL PAYER<br>OU TÉLÉCHARGER UNE APPLI ?
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                <div style="font-size: 40px; background: rgba(16, 185, 129, 0.2); width: 70px; height: 70px; border-radius: 20px; display: flex; align-items: center; justify-content: center;">✅</div>
                <div>
                  <div style="font-size: 26px; font-weight: 900; color: #34D399;">NON, 100% GRATUIT ET INSTANTANÉ !</div>
                  <div style="font-size: 19px; color: #94A3B8;">Pour le client : zéro frais, zéro téléchargement.</div>
                </div>
              </div>

              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5;">
                Il scanne simplement avec son appareil photo habituel (iPhone ou Android) et sa carte s'ouvre directement.
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #E9D5FF;">
              الزبون ما يخلص والو وما يتيليشارجي والو !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Question suivante 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl8_faq_2",
        "folder": "hl8_faq",
        "bg": "rgba(59, 130, 246, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">❓ FAQ</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar active"></div><div class="step-bar"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🖥️ 🏪</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              FAUT-IL UN MATÉRIEL<br>OU MACHINE SPÉCIALE ?
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                <div style="font-size: 40px; background: rgba(16, 185, 129, 0.2); width: 70px; height: 70px; border-radius: 20px; display: flex; align-items: center; justify-content: center;">✅</div>
                <div>
                  <div style="font-size: 26px; font-weight: 900; color: #34D399;">NON, JUSTE TON SMARTPHONE !</div>
                  <div style="font-size: 19px; color: #94A3B8;">Pas de douchette, pas de terminal payant.</div>
                </div>
              </div>

              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5;">
                N'importe quel smartphone, tablette ou ordinateur connecté à Internet fait l'affaire pour scanner les clients.
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #93C5FD;">
              ما تسحق تشري حتى ماتريال.. بتلفونك برك تخدم !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #94A3B8; font-weight: 700;">Comment tester ? 👉</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    },
    {
        "id": "hl8_faq_3",
        "folder": "hl8_faq",
        "bg": "rgba(16, 185, 129, 0.25)",
        "content": f"""
          <div class="top-bar">
            <div class="badge-category">❓ FAQ</div>
            <div class="slide-stepper">
              <div class="step-bar"></div><div class="step-bar"></div><div class="step-bar active"></div>
            </div>
          </div>

          <div class="content">
            <div style="font-size: 72px; margin-bottom: 20px;">🇩🇿 🔥</div>
            <h1 style="font-size: 58px; font-weight: 900; line-height: 1.2; margin-bottom: 25px;">
              COMMENT TESTER DANS<br>MON COMMERCE CETTE SEMAINE ?
            </h1>

            <div class="ui-card" style="margin-bottom: 30px; text-align: left;">
              <div style="font-size: 22px; color: #34D399; font-weight: 800; margin-bottom: 15px;">ACCÈS BÊTA PRIVÉE 20 COMMERCES :</div>
              <div style="font-size: 20px; color: #CBD5E1; line-height: 1.5; margin-bottom: 25px;">
                Nous ouvrons 20 comptes de test prioritaires pour les commerces algériens cette semaine.
              </div>

              <div style="background: rgba(16, 185, 129, 0.18); border: 2px solid #10B981; border-radius: 20px; padding: 22px; text-align: center;">
                <div style="font-size: 32px; font-weight: 900; color: #34D399; margin-bottom: 8px;">
                  Commente "VIP" ci-dessous 👇
                </div>
                <div style="font-size: 20px; color: #F8FAFC; font-weight: 700;">
                  Ou envoie un message privé en DM !
                </div>
              </div>
            </div>

            <div class="arabic" style="font-size: 36px; font-weight: 900; color: #6EE7B7;">
              أبعث ديركت فالخاص ونوجدو محلك فدقيقتين !
            </div>
          </div>

          <div class="footer-bar">
            <span style="font-size: 20px; color: #34D399; font-weight: 800;">Envoyer un message privé 📩</span>
            <img src="{logo_src}" style="height: 38px;" />
          </div>
        """
    }
]

# Highlight Covers Definition
covers = [
    {"folder": "hl1_concept", "icon": "💡", "title": "C'EST QUOI ?", "sub": "LE CONCEPT"},
    {"folder": "hl2_inscription", "icon": "⚡", "title": "INSCRIPTION", "sub": "EN 60s"},
    {"folder": "hl3_personnalisation", "icon": "🎨", "title": "MON DESIGN", "sub": "PERSONNALISER"},
    {"folder": "hl4_cote_client", "icon": "📲", "title": "CÔTÉ CLIENT", "sub": "ZÉRO APP"},
    {"folder": "hl5_scanner_caisse", "icon": "🔍", "title": "EN CAISSE", "sub": "SCANNER 1.2s"},
    {"folder": "hl6_voir_clients", "icon": "👥", "title": "MES CLIENTS", "sub": "CRM & WHATSAPP"},
    {"folder": "hl7_recompenses", "icon": "🎁", "title": "CADEAUX", "sub": "RÉCOMPENSES"},
    {"folder": "hl8_faq", "icon": "❓", "title": "FAQ", "sub": "QUESTIONS"}
]

print("Rendering Highlight Covers...")
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1080, "height": 1920})

    # 1. Render Covers
    for cov in covers:
        folder_path = os.path.join(output_base, cov["folder"])
        os.makedirs(folder_path, exist_ok=True)
        cov_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800;900&display=swap');
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: 1080px;
    height: 1920px;
    background: #020617;
    font-family: 'Plus Jakarta Sans', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
  }}
  .glow {{
    position: absolute;
    width: 800px;
    height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(2, 6, 23, 0) 70%);
  }}
  .cover-circle {{
    width: 480px;
    height: 480px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.95));
    border: 6px solid #10B981;
    box-shadow: 0 0 80px rgba(16, 185, 129, 0.4), inset 0 0 40px rgba(16, 185, 129, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 10;
  }}
  .icon {{
    font-size: 140px;
    margin-bottom: 15px;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
  }}
  .title {{
    font-size: 32px;
    font-weight: 900;
    color: #F8FAFC;
    letter-spacing: 2px;
    text-transform: uppercase;
  }}
  .sub {{
    font-size: 20px;
    font-weight: 800;
    color: #34D399;
    letter-spacing: 3px;
    margin-top: 5px;
  }}
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="cover-circle">
    <div class="icon">{cov["icon"]}</div>
    <div class="title">{cov["title"]}</div>
    <div class="sub">{cov["sub"]}</div>
  </div>
</body>
</html>"""
        temp_cov = "scratch/temp_cover.html"
        with open(temp_cov, "w", encoding="utf-8") as f:
            f.write(cov_html)
        page.goto(f"file:///{os.path.abspath(temp_cov)}")
        cov_img_path = os.path.join(folder_path, "cover.png")
        page.screenshot(path=cov_img_path)
        print(f"Rendered Cover: {cov_img_path}")

    # 2. Render Story Slides
    print("Rendering 24 Story Slides...")
    for idx, story in enumerate(stories):
        folder_path = os.path.join(output_base, story["folder"])
        full_html = get_html_wrapper(story["content"], story["bg"])
        temp_story = "scratch/temp_story.html"
        with open(temp_story, "w", encoding="utf-8") as f:
            f.write(full_html)
        page.goto(f"file:///{os.path.abspath(temp_story)}")
        slide_img_path = os.path.join(folder_path, f"{story['id']}.png")
        page.screenshot(path=slide_img_path)
        print(f"Rendered Slide [{idx+1}/24]: {slide_img_path}")

    browser.close()

print("ALL HIGHLIGHTS AND STORY SLIDES RENDERED SUCCESSFULLY!")
