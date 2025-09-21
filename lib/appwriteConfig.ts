export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  bundleName: process.env.EXPO_PUBLIC_APPWRITE_BUNDLE_NAME!,
  packageName: process.env.EXPO_PUBLIC_APPWRITE_PAKAGE_NAME!,

  dbId: process.env.EXPO_PUBLIC_APPWRITE_DB_ID!,
  boloBucketId: process.env.EXPO_PUBLIC_APPWRITE_BOLO_BUCKET_ID!,

  userCol: process.env.EXPO_PUBLIC_APPWRITE_USER_COL_ID!,
  workerCol: process.env.EXPO_PUBLIC_APPWRITE_WORKER_COL_ID!,
  recruiterCol: process.env.EXPO_PUBLIC_APPWRITE_RECRUITER_COL_ID!,
  jobsCol: process.env.EXPO_PUBLIC_APPWRITE_JOBS_COL_ID!,
  applicationsCol: process.env.EXPO_PUBLIC_APPWRITE_APPLICATIONS_COL_ID!,
  industriesCol: process.env.EXPO_PUBLIC_APPWRITE_INDUSTRIES_COL_ID!,
  locationsCol: process.env.EXPO_PUBLIC_APPWRITE_LOCATIONS_COL_ID!,
  skillsCol: process.env.EXPO_PUBLIC_APPWRITE_SKILLS_COL_ID!,
  plansCol: process.env.EXPO_PUBLIC_APPWRITE_PLANS_COL_ID!,
  subscriptionsCol: process.env.EXPO_PUBLIC_APPWRITE_SUBSCRIPTIONS_COL_ID!,
  paymentsCol: process.env.EXPO_PUBLIC_APPWRITE_PAYMENTS_COL_ID!,
  messagesCol: process.env.EXPO_PUBLIC_APPWRITE_MESSAGES_COL_ID!,
  chatsCol: process.env.EXPO_PUBLIC_APPWRITE_CHATS_COL_ID!,
  reviewsCol: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COL_ID!,
  boloCol: process.env.EXPO_PUBLIC_APPWRITE_BOLO_COL_ID!,

  workerFreePlan: process.env.EXPO_PUBLIC_WORKER_FREE_PLAN_ID!,
  workerProPlan: process.env.EXPO_PUBLIC_WORKER_PRO_PLAN_ID!,

  recruiterFreePlan: process.env.EXPO_PUBLIC_RECRUITER_FREE_PLAN_ID!,
  recruiterCreditPlan: process.env.EXPO_PUBLIC_RECRUITER_CREDIT_PLAN_ID!,
  recruiterProPlan: process.env.EXPO_PUBLIC_RECRUITER_PRO_PLAN_ID!,

  featuredJobs: process.env.EXPO_PUBLIC_FEATURED_JOBS!,
  workerTopPosts: process.env.EXPO_PUBLIC_WORKER_TOP_POSTS!,
};
