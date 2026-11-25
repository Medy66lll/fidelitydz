import os
import base64
import subprocess
from playwright.sync_api import sync_playwright

with open('public/logo.png', 'rb') as f:
    b64_logo = base64.b64encode(f.read()).decode('utf-8')
logo_src = f"data:image/png;base64,{b64_logo}"

os.makedirs('scratch/reel_frames', exist_ok=True)
os.makedirs('public/instagram/reels', exist_ok=True)

html_template = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@800;900&family=Plus+Jakarta+Sans:wght@700;800;900&family=JetBrains+Mono:wght@700;800&display=swap');
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

  /* Background Grid & Ambient Glows */
  .bg-grid {{
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
    background-size: 60px 60px;
  }}
  .glow-green {{
    position: absolute;
    width: 900px;
    height: 900px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(2, 6, 23, 0) 70%);
    pointer-events: none;
    transition: transform 0.2s ease;
  }}
  .glow-amber {{
    position: absolute;
    width: 700px;
    height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(2, 6, 23, 0) 70%);
    pointer-events: none;
  }}

  /* Camera HUD Frame */
  .hud-bracket {{
    position: absolute;
    width: 50px;
    height: 50px;
    border: 3px solid rgba(148, 163, 184, 0.4);
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

  /* Scene 1 Elements */
  #s1 {{
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 30px;
  }}
  .s1-kicker {{
    font-size: 28px;
    font-weight: 900;
    color: #EF4444;
    letter-spacing: 4px;
    text-transform: uppercase;
  }}
  .s1-title {{
    font-size: 78px;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -2px;
  }}
  .strike-box {{
    position: relative;
    display: inline-block;
    color: #94A3B8;
  }}
  .strike-line {{
    position: absolute;
    top: 55%;
    left: 0;
    height: 8px;
    background: #EF4444;
    border-radius: 4px;
    transform: rotate(-2deg);
  }}

  /* Scene 2 Elements: Brand Slam */
  #s2 {{
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 25px;
  }}
  .logo-slam {{
    width: 170px;
    height: 170px;
    border-radius: 42px;
    box-shadow: 0 25px 60px rgba(16, 185, 129, 0.5), 0 0 80px rgba(16, 185, 129, 0.3);
  }}
  .brand-slam-text {{
    font-size: 110px;
    font-weight: 900;
    letter-spacing: -4px;
    line-height: 0.95;
  }}
  .brand-slam-text span {{ color: #10B981; }}
  .brand-badge {{
    background: rgba(16, 185, 129, 0.2);
    border: 2px solid #10B981;
    color: #34D399;
    padding: 14px 36px;
    border-radius: 50px;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 1px;
  }}

  /* Scene 3: Phone Mockup with 10 Stamps */
  #s3 {{
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }}
  .phone-card {{
    width: 780px;
    background: linear-gradient(145deg, #0F172A 0%, #064E3B 100%);
    border: 3px solid rgba(52, 211, 153, 0.8);
    border-radius: 40px;
    padding: 45px;
    box-shadow: 0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(16, 185, 129, 0.35);
  }}
  .pass-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }}
  .pass-title {{ font-size: 32px; font-weight: 900; color: #FFF; }}
  .pass-tag {{
    background: #10B981;
    color: #020617;
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 18px;
    font-weight: 900;
  }}
  .stamps-grid {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 18px;
    margin-bottom: 30px;
  }}
  .stamp-slot {{
    height: 110px;
    border-radius: 24px;
    background: rgba(15, 23, 42, 0.7);
    border: 2.5px solid rgba(16, 185, 129, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 44px;
    color: #64748B;
    position: relative;
    overflow: hidden;
  }}
  .stamp-slot.active {{
    background: rgba(16, 185, 129, 0.25);
    border-color: #10B981;
    color: #F59E0B;
    box-shadow: 0 0 25px rgba(245, 158, 11, 0.5);
  }}
  .stamp-slot.unlocked {{
    background: #F59E0B;
    color: #020617;
    border-color: #FBBF24;
    font-weight: 900;
    font-size: 50px;
    box-shadow: 0 0 35px #F59E0B;
  }}
  .reward-banner {{
    background: #F59E0B;
    color: #020617;
    font-size: 26px;
    font-weight: 900;
    text-align: center;
    padding: 16px;
    border-radius: 18px;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4);
  }}

  /* Scene 4: Fast Features */
  #s4 {{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    width: 100%;
  }}
  .feature-pill {{
    background: #0F172A;
    border: 3px solid #10B981;
    border-radius: 30px;
    padding: 30px 45px;
    display: flex;
    align-items: center;
    gap: 25px;
    width: 820px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  }}
  .f-icon {{ font-size: 55px; }}
  .f-title {{ font-size: 38px; font-weight: 900; color: #FFF; }}
  .f-sub {{ font-size: 22px; font-weight: 700; color: #34D399; }}

  /* Scene 5: Outro CTA */
  #s5 {{
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 35px;
  }}
  .vip-card {{
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
    border: 3px solid #F59E0B;
    border-radius: 40px;
    padding: 60px 50px;
    box-shadow: 0 0 70px rgba(245, 158, 11, 0.35);
  }}
  .vip-kicker {{ font-size: 32px; font-weight: 900; color: #FBBF24; margin-bottom: 15px; }}
  .vip-main-title {{ font-size: 64px; font-weight: 900; line-height: 1.15; margin-bottom: 20px; }}
  .vip-main-title span {{ color: #10B981; }}
  .vip-sub-ar {{ font-size: 40px; font-weight: 800; color: #34D399; margin-bottom: 40px; }}
  .cta-big-button {{
    background: #10B981;
    color: #020617;
    font-size: 38px;
    font-weight: 900;
    padding: 24px 60px;
    border-radius: 25px;
    box-shadow: 0 15px 40px rgba(16, 185, 129, 0.6);
    display: inline-block;
  }}
</style>
</head>
<body>
  <div class="bg-grid"></div>
  <div id="glowGreen" class="glow-green" style="top:-200px; left:50%; transform:translateX(-50%);"></div>
  <div id="glowAmber" class="glow-amber" style="bottom:-150px; right:-150px;"></div>

  <!-- HUD Viewfinder Frame -->
  <div class="hud-bracket hud-tl"></div>
  <div class="hud-bracket hud-tr"></div>
  <div class="hud-bracket hud-bl"></div>
  <div class="hud-bracket hud-br"></div>

  <div class="hud-top-bar mono">
    <div><span class="rec-dot"></span>REC [60 FPS]</div>
    <div id="timecode">00:00.00</div>
    <div>ALGERIA // B2B CORE</div>
  </div>

  <div class="stage">
    <!-- Scene 1: The Problem (0.0s - 2.5s) -->
    <div id="s1" style="display:none;">
      <div class="s1-kicker mono">COMMERCE EN ALGÉRIE</div>
      <div class="s1-title">
        Vos clients oublient leur<br/>
        <span class="strike-box">
          CARTE EN CARTON ?
          <div id="strikeLine" class="strike-line" style="width:0%;"></div>
        </span>
      </div>
      <div class="arabic" style="font-size:44px; color:#F87171; font-weight:800; margin-top:15px;">
        80% يترماو ولا يتنساو في الدار !
      </div>
    </div>

    <!-- Scene 2: Brand Slam (2.5s - 5.0s) -->
    <div id="s2" style="display:none;">
      <img src="{logo_src}" class="logo-slam" id="s2Logo" />
      <div class="brand-slam-text">FIDELITY<span>DZ</span></div>
      <div class="brand-badge mono">N°1 DE LA FIDÉLITÉ DIGITALE</div>
      <div class="arabic" style="font-size:42px; color:#FBBF24; font-weight:800;">
        البطاقة الرقمية الأولى في الجزائر
      </div>
    </div>

    <!-- Scene 3: The 10 Stamps UI (5.0s - 8.0s) -->
    <div id="s3" style="display:none;">
      <div class="phone-card">
        <div class="pass-header">
          <div class="pass-title">● FIDELITYDZ PASS</div>
          <div class="pass-tag">100% PWA</div>
        </div>
        <div class="stamps-grid">
          <div class="stamp-slot" id="st1">★</div>
          <div class="stamp-slot" id="st2">★</div>
          <div class="stamp-slot" id="st3">★</div>
          <div class="stamp-slot" id="st4">★</div>
          <div class="stamp-slot" id="st5">★</div>
          <div class="stamp-slot" id="st6">★</div>
          <div class="stamp-slot" id="st7">★</div>
          <div class="stamp-slot" id="st8">★</div>
          <div class="stamp-slot" id="st9">★</div>
          <div class="stamp-slot" id="st10">🎁</div>
        </div>
        <div id="rewardBanner" class="reward-banner" style="opacity:0; transform:scale(0.8);">
          🎉 CADEAU VIP DÉBLOQUÉ !
        </div>
      </div>
    </div>

    <!-- Scene 4: Speed & Retention (8.0s - 10.0s) -->
    <div id="s4" style="display:none;">
      <div class="feature-pill" id="f1">
        <div class="f-icon">⚡</div>
        <div>
          <div class="f-title">1.2 Seconde en Caisse</div>
          <div class="f-sub arabic">سكاني الزبون في ثانية واحدة بلا تعب</div>
        </div>
      </div>
      <div class="feature-pill" id="f2" style="border-color:#F59E0B;">
        <div class="f-icon">📈</div>
        <div>
          <div class="f-title">+68% Visites Répétées</div>
          <div class="f-sub arabic">الزبائن يرجعوا ديما لنفس المحل</div>
        </div>
      </div>
      <div class="feature-pill" id="f3" style="border-color:#38BDF8;">
        <div class="f-icon">📲</div>
        <div>
          <div class="f-title">0 App à Télécharger</div>
          <div class="f-sub arabic">يفتح الكاميرا ويمسح في ثانيتين</div>
        </div>
      </div>
    </div>

    <!-- Scene 5: Outro CTA (10.0s - 12.0s) -->
    <div id="s5" style="display:none;">
      <div class="vip-card">
        <div class="vip-kicker mono">👑 BÊTA VIP LIMITÉE</div>
        <div class="vip-main-title">20 Boutiques Sélectionnées<br/><span>Par Wilaya</span></div>
        <div class="vip-sub-ar arabic">خلّي اسم محلك أو ولايتك في تعليق</div>
        <div class="cta-big-button">Commente "VIP" ➔</div>
      </div>
    </div>
  </div>

  <script>
    function seek(t) {{
      const min = Math.floor(t / 60);
      const sec = Math.floor(t % 60);
      const ms = Math.floor((t % 1) * 100);
      document.getElementById('timecode').textContent = 
        String(min).padStart(2,'0') + ':' + String(sec).padStart(2,'0') + '.' + String(ms).padStart(2,'0');

      const s1 = document.getElementById('s1');
      const s2 = document.getElementById('s2');
      const s3 = document.getElementById('s3');
      const s4 = document.getElementById('s4');
      const s5 = document.getElementById('s5');

      s1.style.display = 'none';
      s2.style.display = 'none';
      s3.style.display = 'none';
      s4.style.display = 'none';
      s5.style.display = 'none';

      if (t < 2.5) {{
        s1.style.display = 'flex';
        const p = Math.min(1, Math.max(0, (t - 0.8) / 0.8));
        document.getElementById('strikeLine').style.width = (p * 100) + '%';
      }} else if (t < 5.0) {{
        s2.style.display = 'flex';
        const p = Math.min(1, Math.max(0, (t - 2.5) / 0.4));
        const scale = 1.3 - 0.3 * p;
        document.getElementById('s2Logo').style.transform = `scale(${{scale}})`;
      }} else if (t < 8.0) {{
        s3.style.display = 'flex';
        const relT = t - 5.0; // 0 to 3.0s
        for (let i = 1; i <= 9; i++) {{
          const slot = document.getElementById('st' + i);
          if (relT > i * 0.2) {{
            slot.classList.add('active');
          }} else {{
            slot.classList.remove('active');
          }}
        }}
        const st10 = document.getElementById('st10');
        const banner = document.getElementById('rewardBanner');
        if (relT > 2.0) {{
          st10.classList.add('unlocked');
          banner.style.opacity = '1';
          banner.style.transform = 'scale(1)';
        }} else {{
          st10.classList.remove('unlocked');
          banner.style.opacity = '0';
          banner.style.transform = 'scale(0.8)';
        }}
      }} else if (t < 10.0) {{
        s4.style.display = 'flex';
        const relT = t - 8.0;
        document.getElementById('f1').style.opacity = relT > 0.1 ? '1' : '0';
        document.getElementById('f2').style.opacity = relT > 0.6 ? '1' : '0';
        document.getElementById('f3').style.opacity = relT > 1.2 ? '1' : '0';
      }} else {{
        s5.style.display = 'flex';
      }}
    }}
    window.seek = seek;
    seek(0);
  </script>
</body>
</html>
"""

html_path = 'scratch/reel_motion_1.html'
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_template)
print("Created scratch/reel_motion_1.html")

# Render frames at 30 fps for 12 seconds = 360 frames
FPS = 30
DURATION = 12.0
TOTAL_FRAMES = int(FPS * DURATION)
print(f"Rendering {TOTAL_FRAMES} frames at {FPS} FPS...")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1080, "height": 1920})
    page.goto(f"file:///{os.path.abspath(html_path)}")
    page.wait_for_timeout(1000)

    for frame in range(TOTAL_FRAMES):
        t = frame / FPS
        page.evaluate(f"window.seek({t})")
        frame_file = f"scratch/reel_frames/frame_{frame:04d}.jpg"
        page.screenshot(path=frame_file, quality=90)
        if frame % 60 == 0:
            print(f"Rendered frame {frame}/{TOTAL_FRAMES} ({t:.1f}s)")

    browser.close()

print("All frames rendered! Assembling with FFmpeg and audio track...")

# Assembly with FFmpeg: video + background music track_130.mp3
out_mp4 = "public/instagram/reels/reel_growth_motion_12s.mp4"
music_path = "scratch/audio/track_130.mp3"

cmd = [
    "ffmpeg", "-v", "error", "-y",
    "-framerate", str(FPS),
    "-i", "scratch/reel_frames/frame_%04d.jpg",
    "-ss", "00:00:04",  # start at beat drop
    "-i", music_path,
    "-t", str(DURATION),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-crf", "18",
    "-preset", "fast",
    "-c:a", "aac",
    "-b:a", "192k",
    "-af", "afade=t=out:st=10.5:d=1.5",
    out_mp4
]

subprocess.run(cmd, check=True)
print(f"SUCCESS! Rendered master reel: {out_mp4} ({os.path.getsize(out_mp4)} bytes)")
