import os
import qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import arabic_reshaper
from bidi.algorithm import get_display

OUT_DIR = "instagram_assets"
os.makedirs(OUT_DIR, exist_ok=True)

# Colors
BG_DARK = (2, 6, 23)          # #020617 Obsidian Deep
BG_CARD = (15, 23, 42)        # #0F172A Slate 900
BG_CARD_LIGHT = (30, 41, 59)  # #1E293B Slate 800
EMERALD_PRIMARY = (16, 185, 129) # #10B981
EMERALD_DARK = (5, 150, 105)     # #059669
AMBER_GOLD = (245, 158, 11)      # #F59E0B
AMBER_LIGHT = (251, 191, 36)     # #FBBF24
TEXT_WHITE = (255, 255, 255)
TEXT_MUTED = (148, 163, 184)     # #94A3B8
BORDER_COLOR = (30, 58, 47)      # Subtle emerald border

# Fonts
FONT_TAHOMA_BOLD = "C:/Windows/Fonts/tahomabd.ttf"
FONT_TAHOMA = "C:/Windows/Fonts/tahoma.ttf"
FONT_SEGOE_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_SEGOE = "C:/Windows/Fonts/segoeui.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def ar(text):
    if not text:
        return ""
    return get_display(arabic_reshaper.reshape(text))

def create_base_canvas(width=1080, height=1350):
    img = Image.new("RGBA", (width, height), BG_DARK)
    draw = ImageDraw.Draw(img)
    
    # Ambient glowing light fields (Oklab simulation)
    # Emerald glow top-right
    glow1 = Image.new("RGBA", (width, height), (0,0,0,0))
    gdraw1 = ImageDraw.Draw(glow1)
    gdraw1.ellipse([width - 350, -100, width + 250, 500], fill=(5, 150, 105, 55))
    glow1 = glow1.filter(ImageFilter.GaussianBlur(140))
    img.alpha_composite(glow1)
    
    # Amber glow bottom-left
    glow2 = Image.new("RGBA", (width, height), (0,0,0,0))
    gdraw2 = ImageDraw.Draw(glow2)
    gdraw2.ellipse([-200, height - 500, 400, height + 100], fill=(245, 158, 11, 40))
    glow2 = glow2.filter(ImageFilter.GaussianBlur(150))
    img.alpha_composite(glow2)
    
    # Fine grid lines (Tech SaaS backdrop)
    draw = ImageDraw.Draw(img)
    for y in range(0, height, 90):
        draw.line([(0, y), (width, y)], fill=(255, 255, 255, 6), width=1)
    for x in range(0, width, 90):
        draw.line([(x, 0), (x, height)], fill=(255, 255, 255, 6), width=1)
        
    return img

def draw_header(draw, img, badge_text_fr, badge_text_ar):
    # Load Logo
    if os.path.exists("public/logo.png"):
        logo = Image.open("public/logo.png").convert("RGBA")
        logo = logo.resize((84, 84), Image.Resampling.LANCZOS)
        img.paste(logo, (70, 60), logo)
    
    # Brand Name
    f_title = get_font(FONT_SEGOE_BOLD, 36)
    draw.text((170, 70), "Fidelity", font=f_title, fill=TEXT_WHITE)
    draw.text((300, 70), "DZ", font=f_title, fill=EMERALD_PRIMARY)
    
    # Official Subtitle
    f_sub = get_font(FONT_SEGOE, 18)
    draw.text((172, 115), "PLATEFORME SAAS N°1 EN ALGÉRIE", font=f_sub, fill=TEXT_MUTED)
    
    # Top Right Dual-Script Pill Badge
    pill_w, pill_h = 420, 52
    pill_x, pill_y = 1080 - 70 - pill_w, 75
    draw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h], radius=26, fill=(15, 40, 30), outline=EMERALD_DARK, width=2)
    
    f_badge = get_font(FONT_TAHOMA_BOLD, 17)
    txt_badge = f"🇩🇿 {badge_text_fr} | {ar(badge_text_ar)}"
    draw.text((pill_x + 20, pill_y + 14), txt_badge, font=f_badge, fill=EMERALD_PRIMARY)

def draw_footer_cta(draw, text_fr, text_ar="الرابط في البايو @fidelity.dz"):
    footer_y = 1230
    draw.rounded_rectangle([60, footer_y, 1020, footer_y + 75], radius=24, fill=(6, 78, 59), outline=EMERALD_PRIMARY, width=2)
    f_cta = get_font(FONT_TAHOMA_BOLD, 22)
    full_cta = f"✨ {text_fr}  •  {ar(text_ar)}"
    draw.text((100, footer_y + 24), full_cta, font=f_cta, fill=TEXT_WHITE)

print("Base helper library configured.")

# ==============================================================================
# POST 1: HERO PASS SHOWCASE (1080x1350)
# ==============================================================================
def generate_post_1():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    draw_header(draw, img, "Fidélité Digitale", "بطاقة الوفاء الرقمية")
    
    # Headlines
    f_h1 = get_font(FONT_TAHOMA_BOLD, 44)
    f_h2 = get_font(FONT_SEGOE_BOLD, 36)
    f_sub = get_font(FONT_SEGOE, 22)
    
    draw.text((70, 185), ar("وداعاً لبطاقة الكارطون ❌ .. وبطاقة في هاتف زبونك 📱"), font=f_h1, fill=AMBER_LIGHT)
    draw.text((70, 250), "Adieu le carton froissé. Vos clients gardent leur pass.", font=f_h2, fill=TEXT_WHITE)
    draw.text((70, 305), "Zéro application à télécharger • Scan instantané en caisse • Relance WhatsApp", font=f_sub, fill=TEXT_MUTED)
    
    # HERO CARD CONTAINER
    card_x, card_y, card_w, card_h = 70, 360, 940, 680
    draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=36, fill=BG_CARD, outline=EMERALD_PRIMARY, width=3)
    
    # Inside Card Header
    # Merchant Name
    if os.path.exists("public/logo.png"):
        c_logo = Image.open("public/logo.png").convert("RGBA").resize((64, 64), Image.Resampling.LANCZOS)
        img.paste(c_logo, (card_x + 35, card_y + 35), c_logo)
        
    f_mname = get_font(FONT_SEGOE_BOLD, 28)
    draw.text((card_x + 115, card_y + 38), "Café Didouche • Alger Centre", font=f_mname, fill=TEXT_WHITE)
    f_cat = get_font(FONT_SEGOE, 18)
    draw.text((card_x + 117, card_y + 75), "Salon de thé & Pâtisserie • Programme Fidélité Officiel", font=f_cat, fill=TEXT_MUTED)
    
    # VIP Badge inside Card
    vip_w, vip_h = 160, 42
    draw.rounded_rectangle([card_x + card_w - vip_w - 35, card_y + 40, card_x + card_w - 35, card_y + 40 + vip_h], radius=21, fill=(50, 35, 10), outline=AMBER_GOLD, width=2)
    f_vip = get_font(FONT_SEGOE_BOLD, 17)
    draw.text((card_x + card_w - vip_w - 18, card_y + 51), "★ NIVEAU VIP OR", font=f_vip, fill=AMBER_LIGHT)
    
    # Client info strip
    draw.line([(card_x + 35, card_y + 125), (card_x + card_w - 35, card_y + 125)], fill=(30, 41, 59), width=2)
    f_client = get_font(FONT_SEGOE_BOLD, 20)
    draw.text((card_x + 35, card_y + 145), "Client : Karim Benali (0550 12 34 56)", font=f_client, fill=EMERALD_PRIMARY)
    
    # Progress text
    f_prog = get_font(FONT_SEGOE_BOLD, 20)
    draw.text((card_x + card_w - 280, card_y + 145), "8 / 10 Tampons (80%)", font=f_prog, fill=TEXT_WHITE)
    
    # Progress Bar
    draw.rounded_rectangle([card_x + 35, card_y + 185, card_x + card_w - 35, card_y + 200], radius=8, fill=(30, 41, 59))
    draw.rounded_rectangle([card_x + 35, card_y + 185, card_x + int((card_w - 70) * 0.8), card_y + 200], radius=8, fill=EMERALD_PRIMARY)
    
    # 10 STAMPS GRID (2 rows of 5)
    stamp_start_x = card_x + 50
    stamp_start_y = card_y + 230
    stamp_gap_x = 115
    stamp_gap_y = 115
    stamp_r = 45
    
    f_stamp_num = get_font(FONT_SEGOE_BOLD, 26)
    f_stamp_star = get_font(FONT_TAHOMA_BOLD, 28)
    
    for i in range(10):
        row = i // 5
        col = i % 5
        cx = stamp_start_x + col * stamp_gap_x + stamp_r
        cy = stamp_start_y + row * stamp_gap_y + stamp_r
        
        if i < 8:
            # Active Golden Stamp
            draw.ellipse([cx - stamp_r, cy - stamp_r, cx + stamp_r, cy + stamp_r], fill=(16, 50, 35), outline=EMERALD_PRIMARY, width=3)
            draw.text((cx - 16, cy - 22), "★", font=f_stamp_star, fill=AMBER_LIGHT)
            draw.text((cx - 8, cy + 6), str(i+1), font=get_font(FONT_SEGOE_BOLD, 15), fill=TEXT_MUTED)
        elif i == 8:
            # Stamp 9 Pending
            draw.ellipse([cx - stamp_r, cy - stamp_r, cx + stamp_r, cy + stamp_r], fill=(20, 28, 45), outline=TEXT_MUTED, width=2)
            draw.text((cx - 10, cy - 16), "9", font=f_stamp_num, fill=TEXT_MUTED)
        else:
            # Stamp 10 Gift Target
            draw.ellipse([cx - stamp_r, cy - stamp_r, cx + stamp_r, cy + stamp_r], fill=(60, 40, 10), outline=AMBER_GOLD, width=3)
            draw.text((cx - 14, cy - 20), "🎁", font=f_stamp_star, fill=AMBER_LIGHT)
            draw.text((cx - 18, cy + 8), "CADEAU", font=get_font(FONT_SEGOE_BOLD, 10), fill=AMBER_GOLD)
            
    # Bottom Section of Card: QR Code & Reward Lockup
    bottom_y = card_y + 480
    draw.line([(card_x + 35, bottom_y), (card_x + card_w - 35, bottom_y)], fill=(30, 41, 59), width=2)
    
    # Reward box
    rew_w, rew_h = 560, 140
    draw.rounded_rectangle([card_x + 35, bottom_y + 25, card_x + 35 + rew_w, bottom_y + 25 + rew_h], radius=20, fill=BG_CARD_LIGHT, outline=AMBER_GOLD, width=2)
    draw.text((card_x + 60, bottom_y + 45), "🎁 RÉCOMPENSE À DÉBLOQUER :", font=get_font(FONT_SEGOE_BOLD, 18), fill=AMBER_LIGHT)
    draw.text((card_x + 60, bottom_y + 80), "10ème Café Expresso + Croissant Offert !", font=get_font(FONT_SEGOE_BOLD, 24), fill=TEXT_WHITE)
    draw.text((card_x + 60, bottom_y + 120), "Il ne vous reste que 2 tampons pour en profiter.", font=get_font(FONT_SEGOE, 16), fill=TEXT_MUTED)
    
    # Real QR Code on the right
    qr_data = "https://fidelitydz.vercel.app/card/demo-didouche-77"
    qr_img = qrcode.make(qr_data, box_size=4, border=2).convert("RGBA").resize((140, 140))
    img.paste(qr_img, (card_x + card_w - 180, bottom_y + 25))
    
    f_qr_label = get_font(FONT_SEGOE_BOLD, 12)
    draw.text((card_x + card_w - 195, bottom_y + 172), "SCAN SÉCURISÉ EN CAISSE", font=f_qr_label, fill=TEXT_MUTED)
    
    # Feature Pill Badges below Card
    badges = [
        ("⚡ Scan 1.2s", "سكان في ثانية"),
        ("📱 0 App", "بلا تحميل تطبيق"),
        ("📈 +68% Fidélité", "زبائن يرجعو ديما"),
        ("🔒 Anti-Fraude", "ضد التزوير")
    ]
    bx = 70
    by = 1070
    bw = 220
    for fr_t, ar_t in badges:
        draw.rounded_rectangle([bx, by, bx + bw, by + 75], radius=20, fill=(15, 30, 25), outline=EMERALD_DARK, width=2)
        draw.text((bx + 20, by + 14), fr_t, font=get_font(FONT_SEGOE_BOLD, 18), fill=TEXT_WHITE)
        draw.text((bx + 20, by + 42), ar(ar_t), font=get_font(FONT_TAHOMA_BOLD, 15), fill=EMERALD_PRIMARY)
        bx += bw + 20
        
    draw_footer_cta(draw, "14 Jours d'Essai Gratuit • fidelitydz.com", "جرب مجاناً لمدة 14 يوماً")
    
    out_path = os.path.join(OUT_DIR, "01_hero_pass_showcase.png")
    img.save(out_path, "PNG")
    print(f"Generated: {out_path}")

generate_post_1()

# ==============================================================================
# POST 2: CASHIER SCANNER SPEED DEMO (1080x1350)
# ==============================================================================
def generate_post_2():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    draw_header(draw, img, "Scanner Caisse", "ماسح الكاسة السريع")
    
    # Headlines
    f_h1 = get_font(FONT_TAHOMA_BOLD, 44)
    f_h2 = get_font(FONT_SEGOE_BOLD, 36)
    f_sub = get_font(FONT_SEGOE, 22)
    
    draw.text((70, 185), ar("سكان في الكاسة في 1.2 ثانية فقط ⚡"), font=f_h1, fill=AMBER_LIGHT)
    draw.text((70, 250), "Zéro ralentissement de la file d'attente à la caisse.", font=f_h2, fill=TEXT_WHITE)
    draw.text((70, 305), "Fonctionne sur smartphone ou tablette • Caméra instantanée • 0 matériel requis", font=f_sub, fill=TEXT_MUTED)
    
    # SCANNER MOCKUP CONTAINER
    card_x, card_y, card_w, card_h = 70, 360, 940, 680
    draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=36, fill=(10, 15, 30), outline=EMERALD_PRIMARY, width=3)
    
    # Top Scanner Status Bar
    draw.rounded_rectangle([card_x + 35, card_y + 35, card_x + card_w - 35, card_y + 95], radius=16, fill=(15, 23, 42), outline=(30, 41, 59), width=2)
    draw.ellipse([card_x + 60, card_y + 55, card_x + 80, card_y + 75], fill=EMERALD_PRIMARY)
    draw.text((card_x + 95, card_y + 52), "Scanner Caisse PWA • En Ligne (Connecté)", font=get_font(FONT_SEGOE_BOLD, 20), fill=TEXT_WHITE)
    draw.text((card_x + card_w - 240, card_y + 52), "⏱ Temps : 1.2s", font=get_font(FONT_SEGOE_BOLD, 20), fill=AMBER_LIGHT)
    
    # Viewfinder Target Box
    vf_x, vf_y, vf_w, vf_h = card_x + 50, card_y + 120, 400, 360
    draw.rounded_rectangle([vf_x, vf_y, vf_x + vf_w, vf_y + vf_h], radius=24, fill=(5, 10, 20), outline=BORDER_COLOR, width=2)
    
    # Viewfinder corners (Green brackets)
    corner_len = 35
    cw = 4
    # Top-Left
    draw.line([(vf_x + 15, vf_y + 15), (vf_x + 15 + corner_len, vf_y + 15)], fill=EMERALD_PRIMARY, width=cw)
    draw.line([(vf_x + 15, vf_y + 15), (vf_x + 15, vf_y + 15 + corner_len)], fill=EMERALD_PRIMARY, width=cw)
    # Top-Right
    draw.line([(vf_x + vf_w - 15, vf_y + 15), (vf_x + vf_w - 15 - corner_len, vf_y + 15)], fill=EMERALD_PRIMARY, width=cw)
    draw.line([(vf_x + vf_w - 15, vf_y + 15), (vf_x + vf_w - 15, vf_y + 15 + corner_len)], fill=EMERALD_PRIMARY, width=cw)
    # Bottom-Left
    draw.line([(vf_x + 15, vf_y + vf_h - 15), (vf_x + 15 + corner_len, vf_y + vf_h - 15)], fill=EMERALD_PRIMARY, width=cw)
    draw.line([(vf_x + 15, vf_y + vf_h - 15), (vf_x + 15, vf_y + vf_h - 15 - corner_len)], fill=EMERALD_PRIMARY, width=cw)
    # Bottom-Right
    draw.line([(vf_x + vf_w - 15, vf_y + vf_h - 15), (vf_x + vf_w - 15 - corner_len, vf_y + vf_h - 15)], fill=EMERALD_PRIMARY, width=cw)
    draw.line([(vf_x + vf_w - 15, vf_y + vf_h - 15), (vf_x + vf_w - 15, vf_y + vf_h - 15 - corner_len)], fill=EMERALD_PRIMARY, width=cw)
    
    # QR Code inside Viewfinder
    qr_img = qrcode.make("https://fidelitydz.vercel.app/scanner", box_size=5, border=1).convert("RGBA").resize((220, 220))
    img.paste(qr_img, (vf_x + 90, vf_y + 50))
    
    # Green Laser Line
    draw.line([(vf_x + 20, vf_y + 170), (vf_x + vf_w - 20, vf_y + 170)], fill=(16, 185, 129, 230), width=4)
    draw.text((vf_x + 105, vf_y + 300), "ANALYSE OPTIQUE...", font=get_font(FONT_SEGOE_BOLD, 16), fill=EMERALD_PRIMARY)
    
    # Right Side: Verified Customer Card Details
    res_x = card_x + 480
    res_y = card_y + 120
    res_w = card_w - 515
    
    # Verification Badge
    draw.rounded_rectangle([res_x, res_y, res_x + res_w, res_y + 60], radius=16, fill=(16, 60, 40), outline=EMERALD_PRIMARY, width=2)
    draw.text((res_x + 25, res_y + 16), "✅ CLIENT RECONNU EN 1.2s", font=get_font(FONT_SEGOE_BOLD, 19), fill=TEXT_WHITE)
    
    # Customer Details Box
    draw.rounded_rectangle([res_x, res_y + 75, res_x + res_w, res_y + 260], radius=20, fill=BG_CARD_LIGHT, outline=(30, 41, 59), width=2)
    draw.text((res_x + 25, res_y + 95), "Karim Benali", font=get_font(FONT_SEGOE_BOLD, 26), fill=TEXT_WHITE)
    draw.text((res_x + 25, res_y + 135), "Tél : 0550 12 34 56", font=get_font(FONT_SEGOE, 18), fill=TEXT_MUTED)
    draw.text((res_x + 25, res_y + 170), "Solde : 8 / 10 Tampons ★", font=get_font(FONT_SEGOE_BOLD, 22), fill=AMBER_LIGHT)
    draw.text((res_x + 25, res_y + 215), "Dernière visite : Hier à 16:42", font=get_font(FONT_SEGOE, 16), fill=EMERALD_PRIMARY)
    
    # Action Button 1: Add Stamp
    btn_y = res_y + 280
    draw.rounded_rectangle([res_x, btn_y, res_x + res_w, btn_y + 70], radius=20, fill=EMERALD_PRIMARY)
    draw.text((res_x + 55, btn_y + 18), "+1 TAMPON AJOUTÉ !", font=get_font(FONT_SEGOE_BOLD, 22), fill=BG_DARK)
    
    # Action Button 2: Validate Gift
    btn2_y = btn_y + 85
    draw.rounded_rectangle([res_x, btn2_y, res_x + res_w, btn2_y + 65], radius=20, fill=(50, 35, 10), outline=AMBER_GOLD, width=2)
    draw.text((res_x + 45, btn2_y + 18), "🎁 Valider Cadeau 10ème Café", font=get_font(FONT_SEGOE_BOLD, 18), fill=AMBER_LIGHT)
    
    # Bottom Strip inside card
    draw.rounded_rectangle([card_x + 35, card_y + 575, card_x + card_w - 35, card_y + 645], radius=16, fill=(15, 23, 42))
    draw.text((card_x + 60, card_y + 595), "🛡️ Système Anti-Fraude Actif : impossible d'ajouter 2 tampons en moins de 5 minutes.", font=get_font(FONT_SEGOE_BOLD, 17), fill=TEXT_MUTED)
    
    # Hardware Pills
    h_pills = [
        ("📱 Tout Téléphone", "يمشي على أي هاتف"),
        ("⚡ 1.2s Chrono", "فائق السرعة"),
        ("📶 Offline Sync", "يخدم حتى بلا نت"),
        ("🛡️ Anti-Fraude", "حماية الكاشير")
    ]
    bx = 70
    by = 1070
    bw = 220
    for fr_t, ar_t in h_pills:
        draw.rounded_rectangle([bx, by, bx + bw, by + 75], radius=20, fill=(15, 30, 25), outline=EMERALD_DARK, width=2)
        draw.text((bx + 20, by + 14), fr_t, font=get_font(FONT_SEGOE_BOLD, 18), fill=TEXT_WHITE)
        draw.text((bx + 20, by + 42), ar(ar_t), font=get_font(FONT_TAHOMA_BOLD, 15), fill=EMERALD_PRIMARY)
        bx += bw + 20
        
    draw_footer_cta(draw, "Scanner gratuit sur fidelitydz.com", "جرب الماسح مجاناً اليوم")
    
    out_path = os.path.join(OUT_DIR, "02_cashier_scanner_speed.png")
    img.save(out_path, "PNG")
    print(f"Generated: {out_path}")

generate_post_2()


# ==============================================================================
# POST 3: WHATSAPP 1-CLICK RETENTION (1080x1350)
# ==============================================================================
def generate_post_3():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    draw_header(draw, img, "Relance WhatsApp", "استرجاع الزبائن الغائبين")
    
    # Headlines
    f_h1 = get_font(FONT_TAHOMA_BOLD, 42)
    f_h2 = get_font(FONT_SEGOE_BOLD, 36)
    f_sub = get_font(FONT_SEGOE, 22)
    
    draw.text((70, 185), ar("زبائنك ما بانوش هذا الشهر؟ رجّعهم بالواتساب 💬"), font=f_h1, fill=AMBER_LIGHT)
    draw.text((70, 250), "Relancez automatiquement vos clients inactifs en 1 clic.", font=f_h2, fill=TEXT_WHITE)
    draw.text((70, 305), "Détection automatique des +30 jours • Messages personnalisés • +68% de retour", font=f_sub, fill=TEXT_MUTED)
    
    # CONTAINER
    card_x, card_y, card_w, card_h = 70, 360, 940, 680
    draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=36, fill=BG_CARD, outline=(37, 211, 102), width=3)
    
    # Alert Banner Top
    draw.rounded_rectangle([card_x + 35, card_y + 35, card_x + card_w - 35, card_y + 115], radius=20, fill=(50, 15, 15), outline=(239, 68, 68), width=2)
    draw.text((card_x + 60, card_y + 50), "⚠️ ALERTE DASHBOARD FIDELITYDZ :", font=get_font(FONT_SEGOE_BOLD, 18), fill=(248, 113, 113))
    draw.text((card_x + 60, card_y + 78), "38 Clients n'ont pas visité votre boutique depuis plus de 30 jours !", font=get_font(FONT_SEGOE_BOLD, 22), fill=TEXT_WHITE)
    
    # WhatsApp Chat Simulation Box
    wa_x, wa_y, wa_w, wa_h = card_x + 35, card_y + 140, card_w - 70, 340
    draw.rounded_rectangle([wa_x, wa_y, wa_x + wa_w, wa_y + wa_h], radius=24, fill=(10, 25, 20), outline=(37, 211, 102), width=2)
    
    # WhatsApp Top Header
    draw.rounded_rectangle([wa_x, wa_y, wa_x + wa_w, wa_y + 65], radius=24, fill=(18, 140, 126))
    draw.text((wa_x + 25, wa_y + 18), "💬 WhatsApp Direct • Message Envoyé à Karim B. (0550 12 34 56)", font=get_font(FONT_SEGOE_BOLD, 20), fill=TEXT_WHITE)
    
    # WhatsApp Bubble
    bub_x, bub_y, bub_w, bub_h = wa_x + 40, wa_y + 90, wa_w - 80, 220
    draw.rounded_rectangle([bub_x, bub_y, bub_x + bub_w, bub_y + bub_h], radius=20, fill=(32, 44, 51), outline=(37, 211, 102), width=2)
    
    msg_ar1 = "سلام خونا كريم 👋 توحشناك عندنا في مقهى ديدوش !"
    msg_ar2 = "راه بقالك 2 أختام وتدي القهوة العاشرة + كرواسون باطل 🎁"
    msg_ar3 = "أرواح مرحبا بيك في أي وقت! بطاقتك ورصيدك راه يستنى فيك."
    
    draw.text((bub_x + 35, bub_y + 25), ar(msg_ar1), font=get_font(FONT_TAHOMA_BOLD, 24), fill=TEXT_WHITE)
    draw.text((bub_x + 35, bub_y + 75), ar(msg_ar2), font=get_font(FONT_TAHOMA_BOLD, 23), fill=AMBER_LIGHT)
    draw.text((bub_x + 35, bub_y + 125), ar(msg_ar3), font=get_font(FONT_TAHOMA, 21), fill=TEXT_MUTED)
    draw.text((bub_x + bub_w - 180, bub_y + 175), "Envoyé à 11:24 ✓✓", font=get_font(FONT_SEGOE, 15), fill=(37, 211, 102))
    
    # Result Metric Box
    res_y = card_y + 510
    draw.rounded_rectangle([card_x + 35, res_y, card_x + card_w - 35, res_y + 130], radius=20, fill=BG_CARD_LIGHT, outline=EMERALD_PRIMARY, width=2)
    draw.text((card_x + 60, res_y + 25), "📈 RÉSULTAT CONSTATÉ CHEZ NOS COMMERÇANTS :", font=get_font(FONT_SEGOE_BOLD, 18), fill=EMERALD_PRIMARY)
    draw.text((card_x + 60, res_y + 60), "+68% des clients inactifs reviennent dans les 7 jours suivant la relance.", font=get_font(FONT_SEGOE_BOLD, 22), fill=TEXT_WHITE)
    draw.text((card_x + 60, res_y + 95), "Sans faire de publicité payante • Directement sur leur WhatsApp personnel.", font=get_font(FONT_SEGOE, 17), fill=TEXT_MUTED)
    
    # Feature Pills
    badges = [
        ("💬 WhatsApp 1-Clic", "واتساب بنقرة واحدة"),
        ("🎯 Ciblage Inactifs", "الزبائن الغائبين"),
        ("🎁 Rappel Cadeau", "تذكير بالهدية"),
        ("📈 +68% Retour", "نسبة رجوع عالية")
    ]
    bx = 70
    by = 1070
    bw = 220
    for fr_t, ar_t in badges:
        draw.rounded_rectangle([bx, by, bx + bw, by + 75], radius=20, fill=(15, 30, 25), outline=EMERALD_DARK, width=2)
        draw.text((bx + 20, by + 14), fr_t, font=get_font(FONT_SEGOE_BOLD, 18), fill=TEXT_WHITE)
        draw.text((bx + 20, by + 42), ar(ar_t), font=get_font(FONT_TAHOMA_BOLD, 15), fill=EMERALD_PRIMARY)
        bx += bw + 20
        
    draw_footer_cta(draw, "Module WhatsApp inclus • fidelitydz.com", "جرب رسائل الواتساب مجاناً")
    
    out_path = os.path.join(OUT_DIR, "03_whatsapp_retention_machine.png")
    img.save(out_path, "PNG")
    print(f"Generated: {out_path}")

generate_post_3()


# ==============================================================================
# POST 4: PRICING AND ALGERIAN PAYMENT TRUST (1080x1350)
# ==============================================================================
def generate_post_4():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    draw_header(draw, img, "Tarifs & Paiement DZ", "الأسعار والدفع في الجزائر")
    
    # Headlines
    f_h1 = get_font(FONT_TAHOMA_BOLD, 42)
    f_h2 = get_font(FONT_SEGOE_BOLD, 36)
    f_sub = get_font(FONT_SEGOE, 22)
    
    draw.text((70, 185), ar("عرض شامل وواضح لمحلك | 3,900 دج شهرياً 💳"), font=f_h1, fill=AMBER_LIGHT)
    draw.text((70, 250), "Pas de commission sur vos ventes. Sans frais cachés.", font=f_h2, fill=TEXT_WHITE)
    draw.text((70, 305), "14 jours d'essai gratuit offerts • Paiement BaridiMob, Edahabia, CIB & CCP", font=f_sub, fill=TEXT_MUTED)
    
    # PRICING CARD
    card_x, card_y, card_w, card_h = 70, 360, 940, 680
    draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=36, fill=BG_CARD, outline=EMERALD_PRIMARY, width=3)
    
    # Top Ribbon
    draw.rounded_rectangle([card_x + 35, card_y + 35, card_x + 35 + 340, card_y + 85], radius=25, fill=(16, 60, 40), outline=EMERALD_PRIMARY, width=2)
    draw.text((card_x + 60, card_y + 48), "🎉 14 JOURS D'ESSAI GRATUIT", font=get_font(FONT_SEGOE_BOLD, 18), fill=TEXT_WHITE)
    
    # Price Heading
    draw.text((card_x + 35, card_y + 115), "3 900 DZD", font=get_font(FONT_SEGOE_BOLD, 64), fill=TEXT_WHITE)
    draw.text((card_x + 395, card_y + 145), "/ mois (Tout Compris)", font=get_font(FONT_SEGOE_BOLD, 26), fill=TEXT_MUTED)
    
    # Features List
    features = [
        "✓ Jusqu'à 100 cartes clients actives (avec file d'attente auto)",
        "✓ 100 Notifications push promotionnelles par semaine",
        "✓ 2 Appareils connectés en simultané (Gérant + Caisse)",
        "✓ Jusqu'à 3 Offres promotionnelles actives en même temps",
        "✓ 1 Point de vente principal inclus (multi-locaux sur demande)",
        "✓ QR Code de comptoir haute définition prêt à imprimer",
        "✓ Support technique dédié 7j/7 sur WhatsApp Algérie"
    ]
    fy = card_y + 215
    for f in features:
        draw.text((card_x + 40, fy), f, font=get_font(FONT_SEGOE_BOLD, 20), fill=TEXT_WHITE)
        fy += 42
        
    # Algerian Payment Badges Box
    pay_y = card_y + 515
    draw.rounded_rectangle([card_x + 35, pay_y, card_x + card_w - 35, pay_y + 130], radius=20, fill=BG_CARD_LIGHT, outline=BORDER_COLOR, width=2)
    draw.text((card_x + 55, pay_y + 20), "💳 PAIEMENTS 100% ALGÉRIENS SÉCURISÉS :", font=get_font(FONT_SEGOE_BOLD, 18), fill=AMBER_LIGHT)
    
    # Badges
    p_badges = ["الذهبية Edahabia", "CIB", "بريدي موب BaridiMob", "Chargily Pay", "Algérie Poste CCP"]
    px = card_x + 55
    for b in p_badges:
        draw.rounded_rectangle([px, pay_y + 58, px + 155, pay_y + 105], radius=12, fill=(15, 40, 30), outline=EMERALD_DARK, width=2)
        draw.text((px + 12, pay_y + 70), b, font=get_font(FONT_TAHOMA_BOLD, 14), fill=TEXT_WHITE)
        px += 170
        
    # Feature Pills below
    b_pills = [
        ("💳 3,900 DZD", "اشتراك واضح"),
        ("🆓 14j Gratuit", "تجربة بدون التزام"),
        ("🔒 0 Risque", "ضمان 30 يوماً"),
        ("⚡ 60s Inscription", "تسجيل في دقيقة")
    ]
    bx = 70
    by = 1070
    bw = 220
    for fr_t, ar_t in b_pills:
        draw.rounded_rectangle([bx, by, bx + bw, by + 75], radius=20, fill=(15, 30, 25), outline=EMERALD_DARK, width=2)
        draw.text((bx + 20, by + 14), fr_t, font=get_font(FONT_SEGOE_BOLD, 18), fill=TEXT_WHITE)
        draw.text((bx + 20, by + 42), ar(ar_t), font=get_font(FONT_TAHOMA_BOLD, 15), fill=EMERALD_PRIMARY)
        bx += bw + 20
        
    draw_footer_cta(draw, "Inscrivez votre commerce sur fidelitydz.com", "سجل محلك الآن في 60 ثانية")
    
    out_path = os.path.join(OUT_DIR, "04_pricing_and_trust.png")
    img.save(out_path, "PNG")
    print(f"Generated: {out_path}")

generate_post_4()


# ==============================================================================
# POST 5: OLD CARTON VS DIGITAL PASS COMPARISON (1080x1350)
# ==============================================================================
def generate_post_5():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    draw_header(draw, img, "Comparatif 2026", "مقارنة الكارطون والفيديلتي")
    
    # Headlines
    f_h1 = get_font(FONT_TAHOMA_BOLD, 42)
    f_h2 = get_font(FONT_SEGOE_BOLD, 36)
    f_sub = get_font(FONT_SEGOE, 22)
    
    draw.text((70, 185), ar("كارطة الكارطون VS بطاقة FidelityDZ الرقمية 🥊"), font=f_h1, fill=AMBER_LIGHT)
    draw.text((70, 250), "Pourquoi 80% des commerces passent au digital en Algérie.", font=f_h2, fill=TEXT_WHITE)
    draw.text((70, 305), "Le match décisif entre l'ancienne méthode et la fidélisation sur smartphone", font=f_sub, fill=TEXT_MUTED)
    
    # 2 COLUMNS CONTAINER
    col_w = 455
    col_h = 680
    c1_x = 70
    c2_x = 555
    top_y = 360
    
    # Left Column: Old Paper Card (Red/Dark)
    draw.rounded_rectangle([c1_x, top_y, c1_x + col_w, top_y + col_h], radius=32, fill=(25, 15, 20), outline=(239, 68, 68), width=3)
    draw.text((c1_x + 30, top_y + 35), "❌ CARTE EN CARTON", font=get_font(FONT_SEGOE_BOLD, 26), fill=(248, 113, 113))
    draw.text((c1_x + 30, top_y + 75), ar("بطاقة الكارطون القديمة"), font=get_font(FONT_TAHOMA_BOLD, 20), fill=TEXT_MUTED)
    draw.line([(c1_x + 30, top_y + 115), (c1_x + col_w - 30, top_y + 115)], fill=(60, 25, 30), width=2)
    
    c1_points = [
        ("80% Perdues ou Oubliées", "الزبون ينساها في دار"),
        ("0 Coordonnées Client", "ما عندكش نيميرو تيليفونو"),
        ("Lenteur en Caisse", "تضيع الوقت بالستيلو والطابع"),
        ("Facile à Falsifier", "تزوير وسرقة الأختام"),
        ("Coût Récurrent d'Impression", "مصاريف طباعة دائمة"),
        ("Image Ancienne & Dépassée", "صورة غير احترافية للمحل")
    ]
    py = top_y + 140
    for p_fr, p_ar in c1_points:
        draw.text((c1_x + 30, py), f"❌ {p_fr}", font=get_font(FONT_SEGOE_BOLD, 18), fill=TEXT_WHITE)
        draw.text((c1_x + 60, py + 28), ar(p_ar), font=get_font(FONT_TAHOMA, 15), fill=(248, 113, 113))
        py += 80
        
    # Right Column: FidelityDZ Digital Pass (Emerald/Gold)
    draw.rounded_rectangle([c2_x, top_y, c2_x + col_w, top_y + col_h], radius=32, fill=(10, 28, 20), outline=EMERALD_PRIMARY, width=3)
    draw.text((c2_x + 30, top_y + 35), "✅ PASS FIDELITYDZ", font=get_font(FONT_SEGOE_BOLD, 26), fill=EMERALD_PRIMARY)
    draw.text((c2_x + 30, top_y + 75), ar("بطاقة الوفاء الرقمية الحديثة"), font=get_font(FONT_TAHOMA_BOLD, 20), fill=AMBER_LIGHT)
    draw.line([(c2_x + 30, top_y + 115), (c2_x + col_w - 30, top_y + 115)], fill=(20, 60, 45), width=2)
    
    c2_points = [
        ("100% dans le Smartphone", "ديما معاه في التيليفون"),
        ("Numéro WhatsApp Enregistré", "تتواصل معاه وقت ما تحب"),
        ("Scan en 1.2s en Caisse", "سكان فائق السرعة بلا تضياع"),
        ("QR Crypté Anti-Fraude", "نظام مشفر ضد أي تلاعب"),
        ("0 Papier, 100% Écologique", "اقتصاد تام في مصاريف الطباعة"),
        ("Image Moderne & Prestigieuse", "محل عصري مثل دبي وأوروبا")
    ]
    py = top_y + 140
    for p_fr, p_ar in c2_points:
        draw.text((c2_x + 30, py), f"✅ {p_fr}", font=get_font(FONT_SEGOE_BOLD, 18), fill=TEXT_WHITE)
        draw.text((c2_x + 60, py + 28), ar(p_ar), font=get_font(FONT_TAHOMA, 15), fill=EMERALD_PRIMARY)
        py += 80
        
    # Bottom Strip
    b_pills = [
        ("🏆 +68% Rétention", "زيادة الزبائن الأوفياء"),
        ("⚡ 1.2s Scan", "سرعة قياسية"),
        ("📱 0 App", "بلا تحميل تطبيق"),
        ("🎁 14j Gratuit", "تجربة مجانية")
    ]
    bx = 70
    by = 1070
    bw = 220
    for fr_t, ar_t in b_pills:
        draw.rounded_rectangle([bx, by, bx + bw, by + 75], radius=20, fill=(15, 30, 25), outline=EMERALD_DARK, width=2)
        draw.text((bx + 20, by + 14), fr_t, font=get_font(FONT_SEGOE_BOLD, 18), fill=TEXT_WHITE)
        draw.text((bx + 20, by + 42), ar(ar_t), font=get_font(FONT_TAHOMA_BOLD, 15), fill=EMERALD_PRIMARY)
        bx += bw + 20
        
    draw_footer_cta(draw, "Modernisez votre commerce sur fidelitydz.com", "عصرن تجارتك اليوم في 60 ثانية")
    
    out_path = os.path.join(OUT_DIR, "05_comparison_carton_vs_digital.png")
    img.save(out_path, "PNG")
    print(f"Generated: {out_path}")

generate_post_5()


# ==============================================================================
# 5 HIGHLIGHT COVERS (1080x1920)
# ==============================================================================
def generate_highlights():
    covers = [
        ("highlight_1_concept.png", "C'EST QUOI ?", "💡", "فكرة المنصة"),
        ("highlight_2_scanner.png", "EN CAISSE", "⚡", "ماسح الكاسة"),
        ("highlight_3_avis.png", "AVIS CLIENTS", "⭐", "آراء التجار"),
        ("highlight_4_tarifs.png", "TARIF 3900 DA", "💳", "الأسعار والدفع"),
        ("highlight_5_essai.png", "ESSAI 14J", "🎁", "تجربة مجانية")
    ]
    
    for filename, title_fr, icon_emoji, title_ar in covers:
        img = create_base_canvas(1080, 1920)
        draw = ImageDraw.Draw(img)
        
        # Center Circle for Instagram Profile Highlight
        cx, cy = 540, 960
        r_outer = 320
        r_inner = 280
        
        # Glowing Golden/Emerald Rings
        draw.ellipse([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer], fill=(16, 50, 35), outline=EMERALD_PRIMARY, width=6)
        draw.ellipse([cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner], fill=BG_CARD, outline=AMBER_GOLD, width=4)
        
        # Center Emoji / Icon
        f_emoji = get_font(FONT_TAHOMA_BOLD, 120)
        draw.text((cx - 65, cy - 130), icon_emoji, font=f_emoji, fill=TEXT_WHITE)
        
        # Center Text
        f_title = get_font(FONT_SEGOE_BOLD, 38)
        draw.text((cx - 130, cy + 30), title_fr, font=f_title, fill=TEXT_WHITE)
        
        f_sub = get_font(FONT_TAHOMA_BOLD, 28)
        draw.text((cx - 85, cy + 90), ar(title_ar), font=f_sub, fill=AMBER_LIGHT)
        
        # Top Logo Brand
        if os.path.exists("public/logo.png"):
            logo = Image.open("public/logo.png").convert("RGBA").resize((110, 110), Image.Resampling.LANCZOS)
            img.paste(logo, (cx - 55, 320), logo)
            
        draw.text((cx - 95, 450), "FidelityDZ", font=get_font(FONT_SEGOE_BOLD, 36), fill=TEXT_WHITE)
        draw.text((cx - 150, 500), "STORY À LA UNE OFFICIELLE", font=get_font(FONT_SEGOE, 18), fill=TEXT_MUTED)
        
        out_path = os.path.join(OUT_DIR, filename)
        img.save(out_path, "PNG")
        print(f"Generated Highlight: {out_path}")

generate_highlights()
print("All Instagram Assets Generated Successfully!")
