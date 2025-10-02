// bannerData.ts
import { router } from 'expo-router';

export const workerSlides = [
  {
    title: 'Complétez votre profil',
    description: 'Ajoutez vos compétences pour obtenir plus d’offres.',
    button: { text: 'Compléter', onPress: () => router.push('/profile') },
  },
  {
    title: 'Achetez du crédit',
    description: 'Rechargez pour postuler à plus d’emplois.',
    button: { text: 'Acheter crédit', onPress: () => router.push('/credits') },
  },
  {
    title: 'Soyez actif',
    description: 'Restez disponible pour recevoir des notifications.',
  },
];

export const recruiterSlides = [
  {
    title: 'Publiez une offre',
    description: 'Attirez les meilleurs travailleurs en quelques minutes.',
    button: { text: 'Publier', onPress: () => router.push('/postJob') },
  },
  {
    title: 'Achetez du crédit',
    description: 'Rechargez pour contacter plus de candidats.',
    button: { text: 'Acheter crédit', onPress: () => router.push('/credits') },
  },
  {
    title: 'Gérez vos candidats',
    description: 'Suivez et sélectionnez facilement vos candidats.',
  },
];
