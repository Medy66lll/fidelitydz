import os
import base64
import subprocess
from playwright.sync_api import sync_playwright

with open('public/logo.png', 'rb') as f:
    b64_logo = base64.b64encode(f.read()).decode('utf-8')
logo_src = f"data:image/png;base64,{b64_logo}"

os.makedirs('scratch/reel_frames_3', exist_ok=True)
os.makedirs('public/instagram/reels', exist_ok=True)

html_template = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@800;900&family=Plus+Jakarta+Sans:wght@700;800;900&family=JetBrains+Mono:wght@700;800;900&display=swap');
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: 1080px;
    height: 1920px;
    background: #020617;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #F8FAFC;
    position: relative;
    overflow: hidden;
  }}
  .mono {{ font-family: 'JetBrains Mono', monospace; }}
  .arabic {{ font-family: 'Cairo', sans-serif; direction: rtl; }}

  /* Background Grid */
  .bg-grid {{
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
    background-size: 60px 60px;
  }}
  .glow {{
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    transition: all 0.3s ease;
  }}

  /* Camera HUD Frame */
  .hud-bracket {{
    position: absolute;
    width: 50px;
    height: 50px;
    border: 3px solid rgba(148, 163, 184, 0.35);
    z-index: 100;
  }}
  .hud-tl {{ top: 50px; left: 50px; border-right: 0; border-bottom: 0; }}
  .hud-tr {{ top: 50px; right: 50px; border-left: 0; border-bottom: 0; }}
  .hud-bl {{ bottom: 50px; left: 50px; border-right: 0; border-top: 0; }}
  .hud-br {{ bottom: 50px; right: 50px; border-left: 0; border-top: 0; }}

  .hud-top-bar {{
    position: absolute;
    top: 60px;
    left: 120px;
    right: 120px;
    display: flex;
    justify-content: space-between;
    font-size: 20px;
    font-weight: 800;
    color: rgba(148, 163, 184, 0.6);
    z-index: 100;
  }}
  .rec-dot {{
    display: inline-block;
    width: 14px;
    height: 14px;
    background: #EF4444;
    border-radius: 50%;
    margin-right: 8px;
    box-shadow: 0 0 10px #EF4444;
  }}

  /* Stage Container */
  .stage {{
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 100px 70px;
    z-index: 10;
  }}

  /* Badges */
  .badge {{
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 12px 28px;
    border-radius: 9999px;
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 25px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }}
  .badge-amber {{
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.4);
    color: #FBBF24;
  }}
  .badge-emerald {{
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #34D399;
  }}

  /* SCENE 1: Problem */
  #scene1 {{
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;
  }}
  .stat-card-loss {{
    width: 780px;
    background: rgba(15, 23, 42, 0.85);
    border: 2px solid rgba(239, 68, 68, 0.4);
    border-radius: 36px;
    padding: 45px 40px;
    margin: 30px 0;
    box-shadow: 0 25px 60px -15px rgba(239, 68, 68, 0.2);
  }}

  /* SCENE 2: The SaaS Retention Machine */
  #scene2 {{
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;
  }}
  .kpi-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    width: 820px;
    margin: 25px 0;
  }}
  .kpi-card {{
    background: rgba(15, 23, 42, 0.9);
    border: 2px solid rgba(16, 185, 129, 0.35);
    border-radius: 28px;
    padding: 30px;
    text-align: left;
    box-shadow: 0 15px 40px -10px rgba(16, 185, 129, 0.2);
  }}
  .push-banner {{
    width: 820px;
    background: #0F172A;
    border: 2px solid #334155;
    border-radius: 26px;
    padding: 24px 30px;
    display: flex;
    align-items: center;
    gap: 20px;
    text-align: left;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    margin-top: 15px;
  }}

  /* SCENE 3: 3 Pillars */
  #scene3 {{
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;
  }}
  .pillar-card {{
    width: 820px;
    background: rgba(15, 23, 42, 0.85);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    padding: 32px 35px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 25px;
    text-align: left;
  }}

  /* SCENE 4: CTA */
  #scene4 {{
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;
  }}
  .cta-panel {{
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(15, 23, 42, 0.95));
    border: 2px solid rgba(16, 185, 129, 0.6);
    border-radius: 40px;
    padding: 55px 45px;
    width: 860px;
    box-shadow: 0 30px 80px -15px rgba(16, 185, 129, 0.45);
    margin: 30px 0;
  }}
</style>
</head>
<body>
  <div class="bg-grid"></div>
  <div id="glowElem" class="glow" style="width: 900px; height: 900px; top: 300px; left: 90px; background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%);"></div>

  <!-- Camera HUD -->
  <div class="hud-bracket hud-tl"></div>
  <div class="hud-bracket hud-tr"></div>
  <div class="hud-bracket hud-bl"></div>
  <div class="hud-bracket hud-br"></div>
  <div class="hud-top-bar mono">
    <div><span class="rec-dot"></span>REC [RETENTION_ROI]</div>
    <div id="hudTime">00:00:00</div>
    <div>FIDELITY.DZ ⚡</div>
  </div>

  <!-- Stage -->
  <div class="stage">

    <!-- SCENE 1: The Reality (0s - 3.2s) -->
    <div id="scene1">
      <div class="badge badge-amber">
        <span>⚠️</span> VÉRITÉ DU COMMERCE
      </div>
      <h1 style="font-size: 64px; font-weight: 900; line-height: 1.15; margin-bottom: 20px;">
        60% DE TES CLIENTS<br>NE REVIENNENT JAMAIS.
      </h1>

      <div class="stat-card-loss">
        <div style="font-size: 24px; color: #94A3B8; font-weight: 800; margin-bottom: 10px;">POURQUOI ?</div>
        <div style="font-size: 34px; font-weight: 900; color: #FCA5A5; line-height: 1.3; margin-bottom: 25px;">
          Pas parce que ton produit est mauvais.<br>
          <span style="color: #F8FAFC;">Parce qu'ils t'oublient après 3 jours.</span>
        </div>
        <div style="display: flex; justify-content: space-around; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 25px;">
          <div>
            <div class="mono" style="font-size: 48px; font-weight: 900; color: #EF4444;">-60%</div>
            <div style="font-size: 18px; color: #94A3B8; font-weight: 700;">Visites Perdues</div>
          </div>
          <div>
            <div class="mono" style="font-size: 48px; font-weight: 900; color: #F59E0B;">0</div>
            <div style="font-size: 18px; color: #94A3B8; font-weight: 700;">Relance Possible</div>
          </div>
        </div>
      </div>

      <div class="arabic" style="font-size: 38px; font-weight: 900; color: #FCD34D; margin-top: 10px;">
        الزبون يجي خطرة وما يزيدش يولي ؟
      </div>
    </div>

    <!-- SCENE 2: The Machine (3.2s - 7.5s) -->
    <div id="scene2">
      <div class="badge badge-emerald">
        <span>🚀</span> LA SOLUTION SAAS
      </div>
      <h1 style="font-size: 64px; font-weight: 900; line-height: 1.15; margin-bottom: 10px;">
        TRANSFORME-LES EN HABITUÉS !
      </h1>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div style="font-size: 18px; color: #94A3B8; font-weight: 800; margin-bottom: 8px;">VISITES RÉPÉTÉES</div>
          <div class="mono" id="kpiVisits" style="font-size: 54px; font-weight: 900; color: #10B981;">+68%</div>
          <div style="font-size: 15px; color: #6EE7B7; font-weight: 700; margin-top: 6px;">Mesuré sur 30 jours</div>
        </div>
        <div class="kpi-card">
          <div style="font-size: 18px; color: #94A3B8; font-weight: 800; margin-bottom: 8px;">AVIS GOOGLE MAPS</div>
          <div class="mono" style="font-size: 54px; font-weight: 900; color: #FBBF24;">⭐ 4.9</div>
          <div style="font-size: 15px; color: #FCD34D; font-weight: 700; margin-top: 6px;">+180 avis 5 étoiles</div>
        </div>
      </div>

      <!-- Push Notification Simulation -->
      <div class="push-banner">
        <div style="width: 60px; height: 60px; border-radius: 16px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0;">
          📲
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 18px; font-weight: 900; color: #F8FAFC;">Notification Automatique</span>
            <span class="mono" style="font-size: 14px; color: #64748B;">À l'instant</span>
          </div>
          <div style="font-size: 20px; color: #CBD5E1; font-weight: 600;">
            "Salam Amine ! Ton café offert t'attend aujourd'hui ☕"
          </div>
        </div>
      </div>

      <div class="arabic" style="font-size: 36px; font-weight: 900; color: #6EE7B7; margin-top: 25px;">
        فكرة ذكية ترجعلك الزبون مرّة وجوج وعشرة !
      </div>
    </div>

    <!-- SCENE 3: Why it Works in Algeria (7.5s - 9.8s) -->
    <div id="scene3">
      <div class="badge badge-emerald">
        <span>🇩🇿</span> CONÇU POUR L'ALGÉRIE
      </div>
      <h1 style="font-size: 60px; font-weight: 900; line-height: 1.15; margin-bottom: 30px;">
        SIMPLE. DIRECT. EFFICACE.
      </h1>

      <div class="pillar-card" id="pc1">
        <div style="font-size: 48px; width: 80px; height: 80px; border-radius: 20px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">⚡</div>
        <div>
          <div style="font-size: 26px; font-weight: 900; color: #F8FAFC; margin-bottom: 6px;">Zéro Appli à Installer</div>
          <div style="font-size: 19px; color: #94A3B8; font-weight: 600;">Un simple QR code à l'entrée ou sur le comptoir.</div>
        </div>
      </div>

      <div class="pillar-card" id="pc2">
        <div style="font-size: 48px; width: 80px; height: 80px; border-radius: 20px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">🔒</div>
        <div>
          <div style="font-size: 26px; font-weight: 900; color: #F8FAFC; margin-bottom: 6px;">Tes Données T'appartiennent</div>
          <div style="font-size: 19px; color: #94A3B8; font-weight: 600;">Base de clients 100% à toi, zéro intermédiaire.</div>
        </div>
      </div>

      <div class="pillar-card" id="pc3">
        <div style="font-size: 48px; width: 80px; height: 80px; border-radius: 20px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">☕</div>
        <div>
          <div style="font-size: 26px; font-weight: 900; color: #F8FAFC; margin-bottom: 6px;">Pour Tous les Commerces</div>
          <div style="font-size: 19px; color: #94A3B8; font-weight: 600;">Cafés, restos, boutiques vêtements, salons de coiffure.</div>
        </div>
      </div>
    </div>

    <!-- SCENE 4: CTA Multi-Trigger (9.8s - 12.0s) -->
    <div id="scene4">
      <img src="{logo_src}" style="height: 90px; margin-bottom: 20px;" />
      
      <div class="badge badge-emerald" style="margin-bottom: 15px;">
        <span>🔥</span> OFFRE BÊTA COMMERCE
      </div>

      <h1 style="font-size: 64px; font-weight: 900; line-height: 1.15; margin-bottom: 10px;">
        COMMENCE CETTE SEMAINE
      </h1>

      <div class="cta-panel">
        <div style="font-size: 30px; font-weight: 800; color: #94A3B8; margin-bottom: 15px;">REÇOIS TON ACCÈS TEST :</div>
        <div style="font-size: 46px; font-weight: 900; color: #34D399; margin-bottom: 15px;">
          Commente "VIP" ou écris ta WILAYA 👇
        </div>
        <div style="font-size: 22px; font-weight: 700; color: #CBD5E1;">
          Ou envoie-nous un message direct en DM
        </div>
      </div>

      <div class="arabic" style="font-size: 34px; font-weight: 900; color: #F8FAFC; margin-top: 15px;">
        علّق بولايتك ونبعتولك التيست ديركت فالخاص !
      </div>
    </div>

  </div>

  <script>
    function seek(t) {{
      const s1 = document.getElementById('scene1');
      const s2 = document.getElementById('scene2');
      const s3 = document.getElementById('scene3');
      const s4 = document.getElementById('scene4');
      const glow = document.getElementById('glowElem');
      
      // HUD Timecode
      const mins = Math.floor(t / 60);
      const secs = Math.floor(t % 60);
      const frames = Math.floor((t % 1) * 30);
      document.getElementById('hudTime').innerText = 
        String(mins).padStart(2,'0') + ':' + 
        String(secs).padStart(2,'0') + ':' + 
        String(frames).padStart(2,'0');

      s1.style.display = 'none';
      s2.style.display = 'none';
      s3.style.display = 'none';
      s4.style.display = 'none';

      if (t < 3.2) {{
        s1.style.display = 'flex';
        glow.style.background = 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)';
      }} else if (t < 7.5) {{
        s2.style.display = 'flex';
        glow.style.background = 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%)';
        const relT = t - 3.2;
        const curPerc = Math.min(68, Math.floor((relT / 1.0) * 68));
        document.getElementById('kpiVisits').innerText = '+' + curPerc + '%';
      }} else if (t < 9.8) {{
        s3.style.display = 'flex';
        glow.style.background = 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)';
        const relT = t - 7.5;
        document.getElementById('pc1').style.opacity = relT > 0.1 ? '1' : '0';
        document.getElementById('pc2').style.opacity = relT > 0.7 ? '1' : '0';
        document.getElementById('pc3').style.opacity = relT > 1.4 ? '1' : '0';
      }} else {{
        s4.style.display = 'flex';
        glow.style.background = 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)';
      }}
    }}
    window.seek = seek;
    seek(0);
  </script>
</body>
</html>
"""

html_path = 'scratch/reel_motion_3.html'
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_template)
print("Created scratch/reel_motion_3.html")

FPS = 30
DURATION = 12.0
TOTAL_FRAMES = int(FPS * DURATION)
print(f"Rendering {TOTAL_FRAMES} frames at {FPS} FPS for Reel 3...")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1080, "height": 1920})
    page.goto(f"file:///{os.path.abspath(html_path)}")
    page.wait_for_timeout(1000)

    for frame in range(TOTAL_FRAMES):
        t = frame / FPS
        page.evaluate(f"window.seek({t})")
        frame_file = f"scratch/reel_frames_3/frame_{frame:04d}.jpg"
        page.screenshot(path=frame_file, quality=90)
        if frame % 60 == 0:
            print(f"Rendered frame {frame}/{TOTAL_FRAMES} ({t:.1f}s)")

    browser.close()

print("All frames rendered for Reel 3! Assembling with FFmpeg, music and cinematic impact...")

out_mp4 = "public/instagram/reels/reel_retention_machine_12s.mp4"
music_path = "scratch/audio/track_130.mp3"
sfx_impact = ".agents/skills/sound-effects/sfx/impact/fs-177242-cinematic-impact.ogg"
sfx_ding = ".agents/skills/sound-effects/sfx/ding/fs-571513-soft-notifications-bell-ding-d.ogg"

# Audio filter complex: music + cinematic impact at 0.1s + ding at 3.3s
cmd = [
    "ffmpeg", "-v", "error", "-y",
    "-framerate", str(FPS),
    "-i", "scratch/reel_frames_3/frame_%04d.jpg",
    "-ss", "00:00:10",  # energetic intro-to-verse section
    "-i", music_path,
    "-i", sfx_impact,
    "-i", sfx_ding,
    "-filter_complex",
    "[1:a]volume=0.85,afade=t=out:st=10.5:d=1.5[music];"
    "[2:a]volume=1.4[impact];"
    "[3:a]adelay=3300|3300,volume=1.8[ding];"
    "[music][impact][ding]amix=inputs=3:duration=first[aout]",
    "-map", "0:v",
    "-map", "[aout]",
    "-t", str(DURATION),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-crf", "18",
    "-preset", "fast",
    "-c:a", "aac",
    "-b:a", "192k",
    out_mp4
]

subprocess.run(cmd, check=True)
print(f"SUCCESS! Rendered master reel 3: {out_mp4} ({os.path.getsize(out_mp4)} bytes)")
