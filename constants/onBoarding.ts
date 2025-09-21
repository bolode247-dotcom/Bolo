import { useTranslation } from 'react-i18next';
import images from './images';

export const useOnBoardingData = () => {
  const { t } = useTranslation();
  return [
    {
      id: 1,
      title: t('onboarding.slides.0.title'),
      description: t('onboarding.slides.0.description'),
      image: images.onboading3,
    },
    {
      id: 2,
      title: t('onboarding.slides.1.title'),
      description: t('onboarding.slides.1.description'),
      image: images.onboading2,
    },
    {
      id: 3,
      title: t('onboarding.slides.2.title'),
      description: t('onboarding.slides.2.description'),
      image: images.onboading1,
    },
  ];
};
