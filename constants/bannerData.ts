// bannerData.ts
import { router } from 'expo-router';

export const getWorkerSlides = (t: any, isVerified: boolean) => {
  const slides = [
    {
      title: t('workerSlides.completeProfile.title'),
      description: t('workerSlides.completeProfile.description'),
      button: {
        text: t('workerSlides.completeProfile.button'),
        onPress: () => router.push('/profile'),
      },
    },
    {
      title: t('workerSlides.findJobs.title'),
      description: t('workerSlides.findJobs.description'),
      button: {
        text: t('workerSlides.findJobs.button'),
        onPress: () => router.push('/jobs'),
      },
    },
    {
      title: t('workerSlides.buyCredits.title'),
      description: t('workerSlides.buyCredits.description'),
      button: {
        text: t('workerSlides.buyCredits.button'),
        onPress: () => router.push('/Credits'),
      },
    },
    {
      title: t('workerSlides.verifyAccount.title'),
      description: t('workerSlides.verifyAccount.description'),
      button: {
        text: t('workerSlides.verifyAccount.button'),
        onPress: () => router.push('/Verify'),
      },
    },
  ];

  // 🔥 Automatically remove verification slide if user is verified
  return isVerified
    ? slides.filter((s) => s.title !== t('workerSlides.verifyAccount.title'))
    : slides;
};

export const getRecruiterSlides = (t: any, isVerified: boolean) => {
  const slides = [
    {
      title: t('recruiterSlides.postJob.title'),
      description: t('recruiterSlides.postJob.description'),
      button: {
        text: t('recruiterSlides.postJob.button'),
        onPress: () => router.push('/create'),
      },
    },
    {
      title: t('recruiterSlides.manageCandidates.title'),
      description: t('recruiterSlides.manageCandidates.description'),
      button: {
        text: t('recruiterSlides.manageCandidates.button'),
        onPress: () => router.push('/myJobs'),
      },
    },
    {
      title: t('recruiterSlides.exploreWorkerPosts.title'),
      description: t('recruiterSlides.exploreWorkerPosts.description'),
      button: {
        text: t('recruiterSlides.exploreWorkerPosts.button'),
        onPress: () => router.push('/WorkerPosts'),
      },
    },
    {
      title: t('recruiterSlides.verifyAccount.title'),
      description: t('recruiterSlides.verifyAccount.description'),
      button: {
        text: t('recruiterSlides.verifyAccount.button'),
        onPress: () => router.push('/Verify'),
      },
    },
  ];

  // 🔥 Remove verification slide if recruiter is verified
  return isVerified
    ? slides.filter((s) => s.title !== t('recruiterSlides.verifyAccount.title'))
    : slides;
};
