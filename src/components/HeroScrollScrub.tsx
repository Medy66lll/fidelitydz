'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, ArrowRight, Zap, QrCode } from 'lucide-react';

export default function HeroScrollScrub() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const preloaderRef = useRef<HTMLDivElement | null>(null);

  const [hasRealVideo, setHasRealVideo] = useState(false);
  const [videoVisible, setVideoVisible] = useState(true);
  const [preloaderDone, setPreloaderDone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const video = videoRef.current;
    const preloader = preloaderRef.current;
    if (!container || !video) return;

    // =========================================================================
    // PHASE 2 : Lenis Smooth Scroll connecté à GSAP ScrollTrigger + gsap.ticker
    // =========================================================================
    const lenis = new Lenis({
      duration: 1.15,
      easing: (x: number) => Math.min(1, 1.001 - Math.pow(2, -10 * x)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    // =========================================================================
    // PHASE 5 : Preloader rideau minimaliste FidelityDZ
    // =========================================================================
    let preloaderTl: gsap.core.Timeline | null = null;
    if (preloader) {
      preloaderTl = gsap.timeline({
        onComplete: () => {
          setPreloaderDone(true);
          ScrollTrigger.refresh();
        },
      });
      preloaderTl
        .fromTo(
          preloader.querySelector('.fdy-preloader-brand'),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
        )
        .fromTo(
          preloader.querySelector('.fdy-preloader-line'),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, ease: 'power2.inOut' },
          '-=0.25'
        )
        .to(preloader, {
          yPercent: -100,
          duration: 0.8,
          ease: 'power4.inOut',
          delay: 0.1,
        });
    }

    // =========================================================================
    // PHASE 2 & PHASE 4 : Scroll-Scrub + Mobile MatchMedia + 3 Sections Révélées
    // =========================================================================
    let ctx: gsap.Context | null = null;

    const initScrollAnimations = (videoDuration: number) => {
      if (ctx) ctx.revert();

      ctx = gsap.context(() => {
        // Masquer proprement la vidéo fixed une fois la section 300vh dépassée
        ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: 'bottom top',
          onEnter: () => setVideoVisible(true),
          onEnterBack: () => setVideoVisible(true),
          onLeave: () => setVideoVisible(false),
        });

        // PHASE 4 : Révélation élégante des 3 blocs de texte (start 'top 82%', ease 'power3.out')
        const revealBlocks = gsap.utils.toArray<HTMLElement>('.fdy-reveal-block');
        revealBlocks.forEach((block) => {
          gsap.fromTo(
            block,
            { opacity: 0, y: 44 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: block,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

        // PHASE 2 : gsap.matchMedia — Desktop (Scroll-Scrub) vs Mobile <= 768px (Boucle ambiante)
        const mm = gsap.matchMedia();

        mm.add('(min-width: 769px)', () => {
          video.pause();
          video.loop = false;

          if (videoDuration > 0 && Number.isFinite(videoDuration)) {
            const scrubState = { time: 0 };
            gsap.to(scrubState, {
              time: videoDuration,
              ease: 'none',
              scrollTrigger: {
                trigger: container,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3,
                onUpdate: () => {
                  if (video.readyState >= 1) {
                    const clamped = Math.max(0, Math.min(videoDuration, scrubState.time));
                    if (Math.abs(video.currentTime - clamped) > 0.01) {
                      video.currentTime = clamped;
                    }
                  }
                },
              },
            });
          }

          return () => {
            video.pause();
          };
        });

        mm.add('(max-width: 768px)', () => {
          video.loop = true;
          video.play().catch(() => {});
          return () => {
            video.pause();
            video.loop = false;
          };
        });
      }, container);

      ScrollTrigger.refresh();
    };

    const handleLoadedMetadata = () => {
      setHasRealVideo(true);
      video.pause();
      video.currentTime = 0;
      initScrollAnimations(video.duration || 0);
    };

    const handleVideoError = () => {
      setHasRealVideo(false);
      initScrollAnimations(0);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleVideoError);

    if (video.readyState >= 1 && video.duration) {
      handleLoadedMetadata();
    } else {
      // Initialise immédiatement les animations de texte même avant l'arrivée de public/hero.mp4
      initScrollAnimations(0);
    }

    // PHASE 5 : ScrollTrigger.refresh() après le chargement complet des polices
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleVideoError);
      if (preloaderTl) preloaderTl.kill();
      if (ctx) ctx.revert();
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

  const sections = [
    {
      index: isAr ? '01 — تجربة فورية بدون تطبيق' : '01 — Expérience Client Instantanée',
      title: isAr
        ? 'مسح QR واحد عند الصندوق. بدون أي تطبيق.'
        : 'Un simple scan QR en caisse. Zéro application.',
      body: isAr
        ? 'يمسح زبونك ملصق الـ QR على الكاونتر ويدخل رقمه 05 / 06 / 07 ليحصل على بطاقة الولاء الرقمية فوراً على هاتفه في 5 ثوانٍ.'
        : "Votre client scanne votre affiche au comptoir, saisit son numéro 05 / 06 / 07 et obtient sa carte VIP digitale sur iPhone ou Android en 5 secondes. Fini les cartes en carton perdues.",
      tags: ['05 / 06 / 07', 'PWA sans téléchargement', 'FR & AR'],
    },
    {
      index: isAr ? '02 — صندوق آمن وحماية من التلاعب' : '02 — Caisse Blindée & Anti-Fraude',
      title: isAr
        ? 'رمز PIN للكاشير، حماية التوقيت ووضع بدون إنترنت.'
        : 'Code PIN Caissier, Cooldown & Mode Hors-Ligne.',
      body: isAr
        ? 'افصل صلاحيات المدير عن الكاشير برمز PIN مخصص للماسح فقط، مع مؤقت لمنع التكرار ومزامنة تلقائية حتى عند انقطاع 4G.'
        : 'Séparez votre accès Gérant de vos employés avec un Code PIN Caissier dédié au scanner. Le délai anti-fraude bloque les doubles scans et la synchronisation hors-ligne sécurise chaque passage.',
      tags: ['PIN Caissier vs Gérant', 'Cooldown Anti-Fraude', 'Offline Sync'],
    },
    {
      index: isAr ? '03 — تذكير واتساب ودفع محلي' : '03 — Croissance & Paiement Local',
      title: isAr
        ? 'تذكير واتساب بضغطة زر واشتراك بالدينار الجزائري.'
        : 'Relance WhatsApp 1-Clic & Paiement en Dinars.',
      body: isAr
        ? 'استرجع الزبائن الغائبين (+30 يوماً) وهنئ أصحاب الهدايا عبر واتساب بضغطة واحدة. اشتراك واضح بـ 3900 دج/شهر عبر بريدي موب، CCP أو Chargily Pay.'
        : 'Filtrez vos clients inactifs (+30 jours), vos VIP ou cadeaux prêts et relancez-les sur WhatsApp en un clic. Abonnement clair à 3 900 DZD/mois via BaridiMob, CCP ou Chargily Pay.',
      tags: ['WhatsApp 1-Clic', 'Export Excel / CSV', 'BaridiMob • CCP • Chargily'],
    },
  ];

  return (
    <>
      {/* PHASE 5 : Preloader Rideau FidelityDZ */}
      {!preloaderDone && (
        <div
          ref={preloaderRef}
          className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center gap-4 pointer-events-auto"
          aria-label="Chargement FidelityDZ"
        >
          <div className="fdy-preloader-brand flex items-center gap-3.5 opacity-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Fidelity<span className="text-emerald-400">DZ</span>
            </span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-400/90 font-semibold">
            {isAr ? 'منصة بطاقات الولاء الأولى في الجزائر' : 'N°1 de la Fidélité Digitale en Algérie'}
          </p>
          <div className="w-36 h-0.5 bg-white/10 rounded-full overflow-hidden mt-1">
            <div className="fdy-preloader-line w-full h-full bg-gradient-to-r from-emerald-500 to-emerald-300 origin-left" />
          </div>
        </div>
      )}

      {/* PHASE 1 : Vidéo en position fixed, plein écran, object-fit: cover, DERRIÈRE le contenu */}
      <div
        className={`fixed inset-0 w-full h-screen z-0 overflow-hidden bg-slate-950 transition-opacity duration-500 pointer-events-none ${
          videoVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        {/* Vidéo officielle public/hero.mp4 (muted, playsInline, preload="auto", lecture pilotée au scroll) */}
        <video
          ref={videoRef}
          src="/hero.mp4"
          muted
          playsInline
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            hasRealVideo ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Fond cinématique émeraude de secours tant que public/hero.mp4 n'est pas encore déposé */}
        {!hasRealVideo && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(16,185,129,0.22),rgba(2,6,23,0.94)_62%)]" />
        )}

        {/* Overlay dégradé sombre pour la lisibilité */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 72% 48%, rgba(2,6,23,0.12) 0%, rgba(2,6,23,0.68) 68%, rgba(2,6,23,0.9) 100%), linear-gradient(180deg, rgba(2,6,23,0.62) 0%, rgba(2,6,23,0.22) 45%, rgba(2,6,23,0.88) 100%)',
          }}
        />
      </div>

      {/* CONTENEUR SCROLLABLE (~300vh) PAR-DESSUS LA VIDÉO */}
      <div ref={containerRef} className="relative z-10 min-h-[300vh] w-full text-white">
        {/* PHASE 1 : Titre centré simple par-dessus la vidéo */}
        <section className="h-screen flex flex-col items-center justify-center text-center px-6 pt-16 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md">
            <span>🇩🇿</span>
            <span>{isAr ? 'منصة بطاقات الولاء الأولى في الجزائر' : 'N°1 de la Fidélité Digitale en Algérie'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.06] max-w-4xl drop-shadow-[0_10px_30px_rgba(0,0,0,0.65)]">
            {isAr ? (
              <>
                بطاقة ولاء رقمية لمتجرك{' '}
                <span className="text-emerald-400">بدون تطبيق</span>
              </>
            ) : (
              <>
                La Carte de Fidélité Digitale{' '}
                <span className="text-emerald-400">N°1 en Algérie</span>
              </>
            )}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            {isAr
              ? 'اربط زبائنك بمتجرك عبر رمز QR ورقم الهاتف فقط — تذكير واتساب، حماية الصندوق ودفع محلي.'
              : 'Sans application à télécharger pour vos clients. QR Code en caisse, tampons instantanés, relances WhatsApp et paiement BaridiMob / CCP / Chargily.'}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] w-full sm:w-auto"
            >
              <Sparkles className="w-5 h-5" />
              <span>{t('start_free')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 text-white font-bold text-base border border-white/15 backdrop-blur-md transition-all w-full sm:w-auto"
            >
              <Zap className="w-5 h-5 text-emerald-400" />
              <span>{t('see_demo')}</span>
            </a>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            <span>{isAr ? 'مرّر للأسفل' : 'Scrollez'}</span>
            <div className="w-0.5 h-8 bg-gradient-to-b from-emerald-400 to-transparent animate-pulse" />
          </div>
        </section>

        {/* PHASE 4 : 3 SECTIONS QUI RÉVÈLENT PAR-DESSUS LA VIDÉO (CÔTÉ SOMBRE + SCRIM DÉGRADÉ-VERS-TRANSPARENT) */}
        {sections.map((sec, idx) => (
          <section
            key={idx}
            className="min-h-[72vh] flex items-center px-6 sm:px-12 lg:px-24 py-16"
          >
            <article className="fdy-reveal-block relative max-w-xl p-6 sm:p-10 isolate">
              {/* Scrim radial dégradé-vers-transparent derrière le bloc (jamais de boîte opaque à bord net) */}
              <div
                aria-hidden="true"
                className="absolute -inset-12 sm:-inset-16 -z-10 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 88% 78% at 30% 50%, rgba(2,6,23,0.86) 0%, rgba(2,6,23,0.56) 48%, rgba(2,6,23,0) 100%)',
                }}
              />
              <span className="inline-block text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-400 mb-3">
                {sec.index}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white mb-4 drop-shadow">
                {sec.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {sec.body}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {sec.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold text-emerald-200 bg-emerald-500/15 border border-emerald-400/25 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          </section>
        ))}
      </div>
    </>
  );
}
