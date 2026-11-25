import React from 'react';

export default function JsonLdSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://fidelitydz.vercel.app/#software',
        'name': 'FidelityDZ',
        'url': 'https://fidelitydz.vercel.app',
        'email': 'fidelitydz.service@gmail.com',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Web, Android, iOS',
        'offers': [
          {
            '@type': 'Offer',
            'name': 'Essai Gratuit 14 Jours',
            'price': '0',
            'priceCurrency': 'DZD',
            'description': 'Essai gratuit 14 jours sans carte bancaire requise'
          },
          {
            '@type': 'Offer',
            'name': 'Abonnement Mensuel Tout Compris',
            'price': '3900',
            'priceCurrency': 'DZD',
            'description': '100 cartes fidélité actives, 100 notifications push/semaine, 2 appareils simultanés, 3 offres actives, 1 point de vente',
            'priceSpecification': {
              '@type': 'UnitPriceSpecification',
              'price': '3900',
              'priceCurrency': 'DZD',
              'unitText': 'MONTH'
            }
          }
        ],
        'description':
          "Plateforme SaaS algÃ©rienne de cartes de fidÃ©litÃ© digitales pour commerces, restaurants et coffee shops. ZÃ©ro tÃ©lÃ©chargement d'application pour les clients.",
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.9',
          'reviewCount': '148'
        }
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://fidelitydz.vercel.app/#faq',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': "Est-ce que mes clients doivent tÃ©lÃ©charger une application ?",
            'acceptedAnswer': {
              '@type': 'Answer',
              'text':
                "Non, absolument pas. La carte de fidÃ©litÃ© digitale FidelityDZ s'ouvre directement dans le navigateur du smartphone (iPhone ou Android) par simple scan du QR code. Le client peut l'ajouter Ã  son Ã©cran d'accueil en 3 secondes."
            }
          },
          {
            '@type': 'Question',
            'name': "Quels sont les modes de paiement acceptÃ©s en AlgÃ©rie ?",
            'acceptedAnswer': {
              '@type': 'Answer',
              'text':
                "Nous acceptons les paiements 100% algÃ©riens en Dinars (DZD) : carte Edahabia et carte CIB en ligne via Chargily Pay, ainsi que les virements directs BaridiMob et versements CCP."
            }
          },
          {
            '@type': 'Question',
            'name': "Quel matÃ©riel est nÃ©cessaire en caisse pour scanner ?",
            'acceptedAnswer': {
              '@type': 'Answer',
              'text':
                "Aucun matÃ©riel spÃ©cial n'est requis. Le commerÃ§ant ou le serveur utilise simplement son smartphone ou sa tablette ordinaire en se connectant Ã  l'application scanner ultra-rapide FidelityDZ."
            }
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
