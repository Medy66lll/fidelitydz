import base64
import os
from playwright.sync_api import sync_playwright

with open('public/logo.png', 'rb') as f:
    b64_logo = base64.b64encode(f.read()).decode('utf-8')
logo_src = f"data:image/png;base64,{b64_logo}"

highlights = [
    {
        "id": "highlight_1_concept",
        "title": "C'est Quoi ?",
        "icon": "💡",
        "color": "#10B981",
        "ar": "الفكرة"
    },
    {
        "id": "highlight_2_scanner",
        "title": "En Caisse",
        "icon": "⚡",
        "color": "#F59E0B",
        "ar": "الماسح"
    },
    {
        "id": "highlight_3_avis",
        "title": "Avis Clients",
        "icon": "⭐",
        "color": "#FBBF24",
        "ar": "تقييمات"
    },
    {
        "id": "highlight_4_installation",
        "title": "Installation",
        "icon": "🛠️",
        "color": "#34D399",
        "ar": "التركيب"
    },
    {
        "id": "highlight_5_vip",
        "title": "Club VIP",
        "icon": "👑",
        "color": "#F59E0B",
        "ar": "نادي VIP"
    }
]

stories = [
    {
        "id": "story_1_poll_carton",
        "html": f"""
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: 1080px;
    height: 1920px;
    background: #020617;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #F8FAFC;
    padding: 90px 70px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
  }}
  .arabic {{ font-family: 'Cairo', sans-serif; direction: rtl; }}
  .glow {{
    position: absolute;
    top: 20%;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(2, 6, 23, 0) 70%);
  }}
  .top-brand {{
    display: flex;
    align-items: center;
    gap: 20px;
    z-index: 10;
  }}
  .logo {{ width: 80px; height: 80px; border-radius: 20px; }}
  .brand-name {{ font-size: 36px; font-weight: 900; color: #FFF; }}
  .brand-name span {{ color: #10B981; }}
  
  .content-card {{
    background: rgba(15, 23, 42, 0.9);
    border: 3px solid rgba(16, 185, 129, 0.6);
    border-radius: 40px;
    padding: 60px 50px;
    text-align: center;
    width: 100%;
    max-width: 940px;
    z-index: 10;
    box-shadow: 0 30px 80px rgba(0,0,0,0.8);
  }}
  .tag {{
    background: rgba(239, 68, 68, 0.15);
    border: 2px solid #EF4444;
    color: #FCA5A5;
    padding: 12px 28px;
    border-radius: 50px;
    font-size: 22px;
    font-weight: 900;
    display: inline-block;
    margin-bottom: 30px;
  }}
  .question-fr {{
    font-size: 54px;
    font-weight: 900;
    line-height: 1.2;
    margin-bottom: 20px;
  }}
  .question-ar {{
    font-size: 40px;
    font-weight: 800;
    color: #34D399;
    margin-bottom: 40px;
  }}
  .poll-mockup {{
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
  }}
  .poll-option {{
    background: #1E293B;
    border: 2.5px solid #334155;
    border-radius: 24px;
    padding: 28px 35px;
    font-size: 32px;
    font-weight: 800;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }}
  .poll-option.winner {{
    background: rgba(16, 185, 129, 0.2);
    border-color: #10B981;
    color: #A7F3D0;
  }}
  .bottom-cue {{
    font-size: 28px;
    font-weight: 800;
    color: #94A3B8;
    text-align: center;
    z-index: 10;
  }}
  .bottom-cue span {{ color: #F59E0B; }}
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="top-brand">
    <img src="{logo_src}" class="logo" />
    <div class="brand-name">Fidelity<span>DZ</span></div>
  </div>

  <div class="content-card">
    <div class="tag">📊 SONDAGE COMMERÇANTS DZ</div>
    <div class="question-fr">Dans votre boutique, combien de clients oublient leur carte en carton ?</div>
    <div class="question-ar arabic">في حانوتك، شحال من كليون يقولك نسيت كارطة الكارطون فالدار ؟</div>

    <div class="poll-mockup">
      <div class="poll-option winner">
        <span>A. Presque tous (80%+) 🤦‍♂️</span>
        <span style="color:#10B981;">89%</span>
      </div>
      <div class="poll-option">
        <span>B. Moins de la moitié 🤷‍♂️</span>
        <span style="color:#64748B;">11%</span>
      </div>
    </div>
  </div>

  <div class="bottom-cue">
    👉 <span>Glissez vers le haut ou écrivez en DM</span> pour passer au 100% digital
  </div>
</body>
</html>
"""
    },
    {
        "id": "story_2_quiz_vitesse",
        "html": f"""
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: 1080px;
    height: 1920px;
    background: #020617;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #F8FAFC;
    padding: 90px 70px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
  }}
  .arabic {{ font-family: 'Cairo', sans-serif; direction: rtl; }}
  .glow {{
    position: absolute;
    top: 25%;
    width: 850px;
    height: 850px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(2, 6, 23, 0) 70%);
  }}
  .top-brand {{ display: flex; align-items: center; gap: 20px; z-index: 10; }}
  .logo {{ width: 80px; height: 80px; border-radius: 20px; }}
  .brand-name {{ font-size: 36px; font-weight: 900; color: #FFF; }}
  .brand-name span {{ color: #F59E0B; }}

  .content-card {{
    background: rgba(15, 23, 42, 0.95);
    border: 3px solid rgba(245, 158, 11, 0.7);
    border-radius: 40px;
    padding: 60px 50px;
    text-align: center;
    width: 100%;
    max-width: 940px;
    z-index: 10;
    box-shadow: 0 30px 80px rgba(0,0,0,0.8);
  }}
  .tag {{
    background: rgba(245, 158, 11, 0.15);
    border: 2px solid #F59E0B;
    color: #FBBF24;
    padding: 12px 28px;
    border-radius: 50px;
    font-size: 22px;
    font-weight: 900;
    display: inline-block;
    margin-bottom: 25px;
  }}
  .question-fr {{ font-size: 52px; font-weight: 900; line-height: 1.2; margin-bottom: 15px; }}
  .question-ar {{ font-size: 38px; font-weight: 800; color: #34D399; margin-bottom: 35px; }}

  .quiz-list {{ display: flex; flex-direction: column; gap: 18px; }}
  .quiz-opt {{
    background: #1E293B;
    border: 2px solid #334155;
    border-radius: 24px;
    padding: 26px 30px;
    font-size: 30px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }}
  .quiz-opt.correct {{
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3));
    border-color: #10B981;
    color: #6EE7B7;
  }}
  .bottom-cue {{ font-size: 28px; font-weight: 800; color: #94A3B8; text-align: center; z-index: 10; }}
  .bottom-cue span {{ color: #34D399; }}
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="top-brand">
    <img src="{logo_src}" class="logo" />
    <div class="brand-name">Fidelity<span>DZ</span></div>
  </div>

  <div class="content-card">
    <div class="tag">⚡ TEST DE RAPIDITÉ EN CAISSE</div>
    <div class="question-fr">Combien de temps prend un scan client avec FidelityDZ ?</div>
    <div class="question-ar arabic">شحال تاخذ وقت باش تسكاني كليون في الصندوق ؟</div>

    <div class="quiz-list">
      <div class="quiz-opt">
        <span>A. 15 secondes 🐢</span>
      </div>
      <div class="quiz-opt correct">
        <span>B. 1.2 seconde chrono ⚡</span>
        <span style="font-size:36px;">✓</span>
      </div>
      <div class="quiz-opt">
        <span>C. 1 minute entière ⏳</span>
      </div>
    </div>
  </div>

  <div class="bottom-cue">
    📲 0 matériel requis : <span>fonctionne sur votre smartphone</span>
  </div>
</body>
</html>
"""
    },
    {
        "id": "story_3_social_proof",
        "html": f"""
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: 1080px;
    height: 1920px;
    background: #020617;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #F8FAFC;
    padding: 90px 70px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
  }}
  .arabic {{ font-family: 'Cairo', sans-serif; direction: rtl; }}
  .glow {{
    position: absolute;
    top: 30%;
    width: 850px;
    height: 850px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(2, 6, 23, 0) 70%);
  }}
  .top-brand {{ display: flex; align-items: center; gap: 20px; z-index: 10; }}
  .logo {{ width: 80px; height: 80px; border-radius: 20px; }}
  .brand-name {{ font-size: 36px; font-weight: 900; color: #FFF; }}
  .brand-name span {{ color: #10B981; }}

  .content-card {{
    background: rgba(15, 23, 42, 0.95);
    border: 3px solid rgba(16, 185, 129, 0.7);
    border-radius: 40px;
    padding: 60px 50px;
    text-align: center;
    width: 100%;
    max-width: 940px;
    z-index: 10;
  }}
  .tag {{
    background: rgba(16, 185, 129, 0.15);
    border: 2px solid #10B981;
    color: #34D399;
    padding: 12px 28px;
    border-radius: 50px;
    font-size: 22px;
    font-weight: 900;
    display: inline-block;
    margin-bottom: 25px;
  }}
  .metric-large {{
    font-size: 110px;
    font-weight: 900;
    color: #10B981;
    line-height: 1;
    margin-bottom: 10px;
    text-shadow: 0 0 35px rgba(16, 185, 129, 0.5);
  }}
  .metric-label-fr {{ font-size: 42px; font-weight: 900; margin-bottom: 10px; }}
  .metric-label-ar {{ font-size: 34px; font-weight: 800; color: #FBBF24; margin-bottom: 35px; }}

  .quote-box {{
    background: #1E293B;
    border-radius: 24px;
    padding: 30px;
    text-align: left;
    font-size: 26px;
    line-height: 1.4;
    color: #E2E8F0;
    border-left: 6px solid #10B981;
  }}
  .quote-author {{ margin-top: 15px; font-size: 20px; font-weight: 800; color: #34D399; }}
  .bottom-cue {{ font-size: 28px; font-weight: 800; color: #94A3B8; text-align: center; z-index: 10; }}
  .bottom-cue span {{ color: #F59E0B; }}
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="top-brand">
    <img src="{logo_src}" class="logo" />
    <div class="brand-name">Fidelity<span>DZ</span></div>
  </div>

  <div class="content-card">
    <div class="tag">📈 RÉSULTATS COMMERÇANTS DZ</div>
    <div class="metric-large">+68%</div>
    <div class="metric-label-fr">De Clients Fidèles en Plus</div>
    <div class="metric-label-ar arabic">زيادة في الزبائن المتكررين لنفس المحل</div>

    <div class="quote-box">
      "من النهار اللي درنا كارطة الفيديلتي في التليفون، الزبائن صاروا يرجعوا مخصوص باش يقفلوا الـ 10 أختام ويدوا كادواتهم.. النتيجة باينة في لاكاس !"
      <div class="quote-author">— سفيان، مسير كوفي شوب (الجزائر العاصمة)</div>
    </div>
  </div>

  <div class="bottom-cue">
    📩 <span>Envoyez un DM</span> pour installer le système dans votre commerce
  </div>
</body>
</html>
"""
    },
    {
        "id": "story_4_action_vip",
        "html": f"""
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: 1080px;
    height: 1920px;
    background: #020617;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #F8FAFC;
    padding: 90px 70px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
  }}
  .arabic {{ font-family: 'Cairo', sans-serif; direction: rtl; }}
  .glow {{
    position: absolute;
    top: 25%;
    width: 900px;
    height: 900px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(2, 6, 23, 0) 70%);
  }}
  .top-brand {{ display: flex; align-items: center; gap: 20px; z-index: 10; }}
  .logo {{ width: 80px; height: 80px; border-radius: 20px; }}
  .brand-name {{ font-size: 36px; font-weight: 900; color: #FFF; }}
  .brand-name span {{ color: #F59E0B; }}

  .content-card {{
    background: rgba(15, 23, 42, 0.95);
    border: 3px solid #F59E0B;
    border-radius: 40px;
    padding: 60px 50px;
    text-align: center;
    width: 100%;
    max-width: 940px;
    z-index: 10;
    box-shadow: 0 0 50px rgba(245, 158, 11, 0.25);
  }}
  .tag {{
    background: rgba(245, 158, 11, 0.2);
    border: 2px solid #F59E0B;
    color: #FBBF24;
    padding: 12px 30px;
    border-radius: 50px;
    font-size: 22px;
    font-weight: 900;
    display: inline-block;
    margin-bottom: 25px;
  }}
  .title-fr {{ font-size: 54px; font-weight: 900; line-height: 1.15; margin-bottom: 15px; }}
  .title-fr span {{ color: #FBBF24; }}
  .title-ar {{ font-size: 38px; font-weight: 800; color: #34D399; margin-bottom: 35px; }}

  .steps-box {{ display: flex; flex-direction: column; gap: 20px; text-align: left; }}
  .step-item {{
    background: #1E293B;
    border-radius: 20px;
    padding: 24px 28px;
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 26px;
    font-weight: 800;
  }}
  .step-num {{
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #F59E0B;
    color: #020617;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 900;
    flex-shrink: 0;
  }}
  .bottom-cue {{ font-size: 32px; font-weight: 900; color: #FFFFFF; text-align: center; z-index: 10; }}
  .bottom-cue span {{ color: #F59E0B; }}
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="top-brand">
    <img src="{logo_src}" class="logo" />
    <div class="brand-name">Fidelity<span>DZ</span></div>
  </div>

  <div class="content-card">
    <div class="tag">👑 PROGRAMME BÊTA VIP</div>
    <div class="title-fr">20 Commerces <span>Sélectionnés</span> par Wilaya</div>
    <div class="title-ar arabic">اخترنا 20 محل في كل ولاية نركبولهم النظام باطل</div>

    <div class="steps-box">
      <div class="step-item">
        <div class="step-num">1</div>
        <span>Répondez à cette story avec votre Wilaya</span>
      </div>
      <div class="step-item">
        <div class="step-num">2</div>
        <span>On configure votre carte personnalisée</span>
      </div>
      <div class="step-item">
        <div class="step-num">3</div>
        <span>Testez en caisse pendant 14 jours gratuitement</span>
      </div>
    </div>
  </div>

  <div class="bottom-cue">
    📩 <span>Écrivez-nous en DM</span> pour réserver la place de votre boutique !
  </div>
</body>
</html>
"""
    }
]

os.makedirs('public/instagram/highlights', exist_ok=True)
os.makedirs('public/instagram/stories', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # 1. Highlights Covers (1080x1920 with perfect circular highlight center)
    page_hl = browser.new_page(viewport={"width": 1080, "height": 1920})
    for hl in highlights:
        out_hl = f"public/instagram/highlights/{hl['id']}.png"
        html_hl = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@800;900&family=Plus+Jakarta+Sans:wght@800;900&display=swap');
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
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, {hl['color']}33 0%, rgba(2, 6, 23, 0) 70%);
  }}
  .circle-badge {{
    width: 480px;
    height: 480px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
    border: 6px solid {hl['color']};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15px;
    box-shadow: 0 0 60px {hl['color']}44, 0 30px 60px rgba(0,0,0,0.8);
    z-index: 10;
  }}
  .icon {{ font-size: 130px; line-height: 1; }}
  .title-fr {{ font-size: 34px; font-weight: 900; color: #FFFFFF; text-align: center; }}
  .title-ar {{ font-family: 'Cairo', sans-serif; direction: rtl; font-size: 26px; font-weight: 800; color: {hl['color']}; }}
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="circle-badge">
    <div class="icon">{hl['icon']}</div>
    <div class="title-fr">{hl['title']}</div>
    <div class="title-ar">{hl['ar']}</div>
  </div>
</body>
</html>
"""
        page_hl.set_content(html_hl)
        page_hl.wait_for_timeout(500)
        page_hl.screenshot(path=out_hl, clip={"x": 0, "y": 0, "width": 1080, "height": 1920})
        print(f"Generated highlight cover: {out_hl}")

    page_hl.close()

    # 2. Daily Stories (1080x1920)
    page_st = browser.new_page(viewport={"width": 1080, "height": 1920})
    for st in stories:
        out_st = f"public/instagram/stories/{st['id']}.png"
        page_st.set_content(st["html"])
        page_st.wait_for_timeout(800)
        page_st.screenshot(path=out_st, clip={"x": 0, "y": 0, "width": 1080, "height": 1920})
        print(f"Generated story: {out_st}")

    page_st.close()
    browser.close()
print("All highlights and stories rendered successfully!")
