import os
import base64
import subprocess
from playwright.sync_api import sync_playwright

with open('public/logo.png', 'rb') as f:
    b64_logo = base64.b64encode(f.read()).decode('utf-8')
logo_src = f"data:image/png;base64,{b64_logo}"

os.makedirs('scratch/reel_frames_2', exist_ok=True)
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

  /* SCENE 1: Paper Card Slow */
  #scene1 {{
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;
  }}
  .badge-red {{
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #F87171;
    padding: 12px 28px;
    border-radius: 9999px;
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 30px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }}
  .timer-red {{
    font-size: 110px;
    font-weight: 900;
    color: #EF4444;
    letter-spacing: -2px;
    line-height: 1;
    margin: 20px 0;
    text-shadow: 0 0 40px rgba(239, 68, 68, 0.5);
  }}
  .paper-card {{
    width: 720px;
    background: #FEF3C7;
    border: 4px dashed #D97706;
    border-radius: 28px;
    padding: 35px;
    color: #92400E;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
    margin: 30px 0;
    transform: rotate(-2deg);
    position: relative;
  }}
  .cross-stamp {{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(15deg);
    background: rgba(220, 38, 38, 0.9);
    color: white;
    font-size: 40px;
    font-weight: 900;
    padding: 16px 40px;
    border-radius: 16px;
    border: 4px solid #FEE2E2;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }}

  /* SCENE 2: Fast Scan 1.2s */
  #scene2 {{
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;
  }}
  .badge-emerald {{
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #34D399;
    padding: 12px 28px;
    border-radius: 9999px;
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 24px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }}
  .timer-emerald {{
    font-size: 130px;
    font-weight: 900;
    color: #10B981;
    letter-spacing: -2px;
    line-height: 1;
    margin: 15px 0;
    text-shadow: 0 0 60px rgba(16, 185, 129, 0.6);
  }}
  .phone-mock {{
    width: 740px;
    background: #0B1329;
    border: 2px solid rgba(16, 185, 129, 0.4);
    border-radius: 40px;
    padding: 40px;
    box-shadow: 0 30px 80px -10px rgba(16, 185, 129, 0.25);
    position: relative;
    overflow: hidden;
  }}
  .scan-beam {{
    position: absolute;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, #34D399, #10B981, #34D399, transparent);
    box-shadow: 0 0 25px #10B981, 0 0 50px #10B981;
    transition: top 0.05s linear;
  }}
  .stamps-row {{
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 25px;
  }}
  .stamp-circle {{
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #1E293B;
    border: 2px solid #334155;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 900;
    color: #64748B;
    transition: all 0.2s ease;
  }}
  .stamp-active {{
    background: linear-gradient(135deg, #10B981, #059669);
    border-color: #34D399;
    color: white;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
  }}

  /* SCENE 3: 3 Killer Features */
  #scene3 {{
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;
  }}
  .feature-pill {{
    width: 820px;
    background: rgba(15, 23, 42, 0.85);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    padding: 30px 40px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 30px;
    text-align: left;
    backdrop-filter: blur(12px);
    transition: all 0.3s ease;
  }}
  .pill-icon {{
    width: 90px;
    height: 90px;
    border-radius: 24px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 44px;
    flex-shrink: 0;
  }}

  /* SCENE 4: CTA */
  #scene4 {{
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;
  }}
  .cta-box {{
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.9));
    border: 2px solid rgba(16, 185, 129, 0.5);
    border-radius: 40px;
    padding: 55px 50px;
    width: 860px;
    box-shadow: 0 30px 80px -20px rgba(16, 185, 129, 0.4);
    margin: 30px 0;
  }}
</style>
</head>
<body>
  <div class="bg-grid"></div>
  <div id="glowElem" class="glow" style="width: 900px; height: 900px; top: 300px; left: 90px; background: radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%);"></div>

  <!-- Camera HUD -->
  <div class="hud-bracket hud-tl"></div>
  <div class="hud-bracket hud-tr"></div>
  <div class="hud-bracket hud-bl"></div>
  <div class="hud-bracket hud-br"></div>
  <div class="hud-top-bar mono">
    <div><span class="rec-dot"></span>REC [SPEED_CHRONO]</div>
    <div id="hudTime">00:00:00</div>
    <div>FIDELITY.DZ ⚡</div>
  </div>

  <!-- Stage -->
  <div class="stage">

    <!-- SCENE 1: The Slow Paper Punch Card (0s - 3.2s) -->
    <div id="scene1">
      <div class="badge-red">
        <span>⚠️</span> ANCIENNE MÉTHODE
      </div>
      <h1 style="font-size: 64px; font-weight: 900; line-height: 1.15; margin-bottom: 15px;">
        15 SECONDES PERDUES<br>À CHAQUE CLIENT
      </h1>
      <div class="timer-red mono" id="redTimer">00:14.85</div>
      
      <div class="paper-card">
        <div style="font-size: 26px; font-weight: 800; margin-bottom: 15px;">CARTE DE FIDÉLITÉ EN CARTON</div>
        <div style="font-size: 20px; font-weight: 700; opacity: 0.8; margin-bottom: 20px;">Tampon introuvable • Client qui attend • File bloquée</div>
        <div style="display: flex; justify-content: center; gap: 15px; opacity: 0.6;">
          <div style="width: 50px; height: 50px; border-radius: 50%; border: 3px dashed #B45309; display: flex; align-items: center; justify-content: center; font-weight: 900;">1</div>
          <div style="width: 50px; height: 50px; border-radius: 50%; border: 3px dashed #B45309; display: flex; align-items: center; justify-content: center; font-weight: 900;">2</div>
          <div style="width: 50px; height: 50px; border-radius: 50%; border: 3px dashed #B45309; display: flex; align-items: center; justify-content: center; font-weight: 900;">?</div>
          <div style="width: 50px; height: 50px; border-radius: 50%; border: 3px dashed #B45309; display: flex; align-items: center; justify-content: center; font-weight: 900;">?</div>
        </div>
        <div class="cross-stamp">PERDUE DANS 80% DES CAS</div>
      </div>

      <div class="arabic" style="font-size: 38px; font-weight: 900; color: #FCA5A5; margin-top: 20px;">
        ضيعت وقتك ووقت الزبون فلكاسة ؟
      </div>
    </div>

    <!-- SCENE 2: The Fast Scan 1.2s (3.2s - 7.5s) -->
    <div id="scene2">
      <div class="badge-emerald">
        <span>⚡</span> SCAN ULTRA-RAPIDE
      </div>
      <h1 style="font-size: 64px; font-weight: 900; line-height: 1.15; margin-bottom: 10px;">
        1.2 SECONDE CHRONO !
      </h1>
      <div class="timer-emerald mono" id="greenTimer">00:01.20</div>

      <div class="phone-mock">
        <div id="scanBeam" class="scan-beam" style="top: 20px;"></div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <img src="{logo_src}" style="height: 48px;" />
            <div style="text-align: left;">
              <div style="font-size: 22px; font-weight: 900; color: #F8FAFC;">Café El Bahdja ☕</div>
              <div style="font-size: 16px; color: #34D399; font-weight: 700;">Client VIP #0842</div>
            </div>
          </div>
          <div class="mono" style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10B981; color: #10B981; padding: 8px 18px; border-radius: 12px; font-weight: 800; font-size: 16px;">
            SCAN CONFIRMÉ
          </div>
        </div>

        <!-- Stamps Visual -->
        <div class="stamps-row">
          <div class="stamp-circle stamp-active">☕</div>
          <div class="stamp-circle stamp-active">☕</div>
          <div class="stamp-circle stamp-active">☕</div>
          <div id="newStamp" class="stamp-circle" style="transform: scale(1.15);">☕</div>
          <div class="stamp-circle">5</div>
          <div class="stamp-circle">🎁</div>
        </div>

        <div style="margin-top: 30px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; padding: 18px; display: flex; align-items: center; justify-content: center; gap: 15px;">
          <span style="font-size: 28px;">✨</span>
          <span style="font-size: 22px; font-weight: 800; color: #34D399;">+1 Tampon instantané • SMS / Push envoyé</span>
        </div>
      </div>

      <div class="arabic" style="font-size: 38px; font-weight: 900; color: #6EE7B7; margin-top: 25px;">
        سكاني برك.. الكاسة تجري بلا تبطال !
      </div>
    </div>

    <!-- SCENE 3: 3 Killer Features (7.5s - 9.8s) -->
    <div id="scene3">
      <div class="badge-emerald">
        <span>🚀</span> TECHNOLOGIE SAAS MODERNE
      </div>
      <h1 style="font-size: 60px; font-weight: 900; line-height: 1.15; margin-bottom: 35px;">
        POURQUOI ÇA CARTONNE ?
      </h1>

      <div class="feature-pill" id="fp1">
        <div class="pill-icon">📱</div>
        <div>
          <div style="font-size: 28px; font-weight: 900; color: #F8FAFC; margin-bottom: 6px;">0 Application à Télécharger</div>
          <div style="font-size: 20px; color: #94A3B8; font-weight: 600;">S'ouvre direct par QR code sur tous les smartphones.</div>
        </div>
      </div>

      <div class="feature-pill" id="fp2">
        <div class="pill-icon">👛</div>
        <div>
          <div style="font-size: 28px; font-weight: 900; color: #F8FAFC; margin-bottom: 6px;">Apple Wallet & Android</div>
          <div style="font-size: 20px; color: #94A3B8; font-weight: 600;">La carte reste toujours dans la poche du client.</div>
        </div>
      </div>

      <div class="feature-pill" id="fp3">
        <div class="pill-icon">📈</div>
        <div>
          <div style="font-size: 28px; font-weight: 900; color: #F8FAFC; margin-bottom: 6px;">+68% de Visites Répétées</div>
          <div style="font-size: 20px; color: #94A3B8; font-weight: 600;">Relances et récompenses automatiques sans effort.</div>
        </div>
      </div>
    </div>

    <!-- SCENE 4: Viral Call to Action (9.8s - 12.0s) -->
    <div id="scene4">
      <img src="{logo_src}" style="height: 90px; margin-bottom: 25px;" />
      
      <div class="badge-emerald" style="margin-bottom: 20px;">
        <span>🇩🇿</span> PROGRAMME BÊTA VIP EN COURS
      </div>

      <h1 style="font-size: 64px; font-weight: 900; line-height: 1.15; margin-bottom: 10px;">
        ACTIVE LA SOLUTION DANS TON COMMERCE
      </h1>

      <div class="cta-box">
        <div style="font-size: 32px; font-weight: 800; color: #94A3B8; margin-bottom: 15px;">COMMENT EN PROFITER ?</div>
        <div style="font-size: 48px; font-weight: 900; color: #34D399; margin-bottom: 15px;">
          Commente "CHRONO" 👇
        </div>
        <div style="font-size: 24px; font-weight: 700; color: #CBD5E1;">
          Ou envoie-nous un message direct en DM
        </div>
      </div>

      <div class="arabic" style="font-size: 34px; font-weight: 900; color: #F8FAFC; margin-top: 15px;">
        ماتراطيش التيست.. 20 محل فقط هاد السيمانة !
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
        glow.style.background = 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%)';
        // Red timer ticking up
        const curSec = Math.min(14.85, (t / 3.0) * 14.85);
        document.getElementById('redTimer').innerText = '00:' + curSec.toFixed(2).padStart(5, '0');
      }} else if (t < 7.5) {{
        s2.style.display = 'flex';
        glow.style.background = 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)';
        // Green fast timer stopping at 1.20s
        const relT = t - 3.2;
        const curGreen = Math.min(1.20, (relT / 0.8) * 1.20);
        document.getElementById('greenTimer').innerText = '00:0' + curGreen.toFixed(2);
        
        // Scan beam moving up and down
        const beamPos = 20 + Math.sin(relT * 5) * 120 + 120;
        document.getElementById('scanBeam').style.top = beamPos + 'px';

        // Stamp 4 popping
        const stamp4 = document.getElementById('newStamp');
        if (relT > 1.0) {{
          stamp4.className = 'stamp-circle stamp-active';
        }} else {{
          stamp4.className = 'stamp-circle';
        }}
      }} else if (t < 9.8) {{
        s3.style.display = 'flex';
        glow.style.background = 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)';
        const relT = t - 7.5;
        document.getElementById('fp1').style.opacity = relT > 0.1 ? '1' : '0';
        document.getElementById('fp2').style.opacity = relT > 0.7 ? '1' : '0';
        document.getElementById('fp3').style.opacity = relT > 1.4 ? '1' : '0';
      }} else {{
        s4.style.display = 'flex';
        glow.style.background = 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%)';
      }}
    }}
    window.seek = seek;
    seek(0);
  </script>
</body>
</html>
"""

html_path = 'scratch/reel_motion_2.html'
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_template)
print("Created scratch/reel_motion_2.html")

FPS = 30
DURATION = 12.0
TOTAL_FRAMES = int(FPS * DURATION)
print(f"Rendering {TOTAL_FRAMES} frames at {FPS} FPS for Reel 2...")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1080, "height": 1920})
    page.goto(f"file:///{os.path.abspath(html_path)}")
    page.wait_for_timeout(1000)

    for frame in range(TOTAL_FRAMES):
        t = frame / FPS
        page.evaluate(f"window.seek({t})")
        frame_file = f"scratch/reel_frames_2/frame_{frame:04d}.jpg"
        page.screenshot(path=frame_file, quality=90)
        if frame % 60 == 0:
            print(f"Rendered frame {frame}/{TOTAL_FRAMES} ({t:.1f}s)")

    browser.close()

print("All frames rendered for Reel 2! Assembling with FFmpeg, music and SFX...")

out_mp4 = "public/instagram/reels/reel_cashier_speed_12s.mp4"
music_path = "scratch/audio/track_130.mp3"
sfx_ding = ".agents/skills/sound-effects/sfx/ding/fs-571513-soft-notifications-bell-ding-d.ogg"

# Audio filter complex: music with fade out + ding sfx delayed to 4.2s (when scan finishes)
cmd = [
    "ffmpeg", "-v", "error", "-y",
    "-framerate", str(FPS),
    "-i", "scratch/reel_frames_2/frame_%04d.jpg",
    "-ss", "00:00:20",  # energetic mid-track section
    "-i", music_path,
    "-i", sfx_ding,
    "-filter_complex",
    "[1:a]volume=0.85,afade=t=out:st=10.5:d=1.5[music];"
    "[2:a]adelay=4200|4200,volume=1.8[sfx];"
    "[music][sfx]amix=inputs=2:duration=first[aout]",
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
print(f"SUCCESS! Rendered master reel 2: {out_mp4} ({os.path.getsize(out_mp4)} bytes)")
