import { tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { Job, Offer } from '@/types/genTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ID, Query } from 'react-native-appwrite';
import { sendPushNotification } from './appwriteGenFunc';

export const createJob = async (values: Job) => {
  const {
    title,
    description,
    workerId,
    recruiters,
    type,
    minSalary,
    maxSalary,
    paymentType,
    maxApplicants,
    skills,
    locations,
    address,
  } = values;

  try {
    const newJob = await tables.createRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      rowId: ID.unique(),
      data: {
        title,
        description,
        recruiters,
        locations,
        type,
        address,
        minSalary: minSalary ? parseInt(minSalary.toString(), 10) : 0,
        maxSalary: maxSalary ? parseInt(maxSalary.toString(), 10) : 0,
        paymentType: paymentType || 'contract',
        maxApplicants: maxApplicants
          ? parseInt(maxApplicants.toString(), 10)
          : 0,
        skills,
        status: 'active',
        isOffer: workerId ? true : false,
      },
    });

    if (workerId) {
      await tables.createRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.jobOffersCol,
        rowId: ID.unique(),
        data: {
          jobs: newJob.$id,
          workers: workerId,
          recruiters,
          status: 'pending',
        },
      });
    }

    return newJob.$id;
  } catch (error) {
    throw error;
  }
};

export const getJobOffers = async (workerId: string): Promise<Offer[]> => {
  try {
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobOffersCol,
      queries: [
        Query.equal('workers', workerId),
        Query.notEqual('status', 'declined'),
        Query.notEqual('status', 'accepted'),
        Query.select([
          '$id',
          'jobs.$id',
          'jobs.title',
          'jobs.type',
          'jobs.description',
          'jobs.minSalary',
          'jobs.maxSalary',
          'jobs.paymentType',
          'jobs.skills.$id',
          'jobs.skills.icon',
          'jobs.locations.region',
          'jobs.locations.division',
          'jobs.locations.subdivision',
        ]),
      ],
    });

    return res.rows.map((offer) => ({
      id: offer.$id,
      job: {
        id: offer.jobs.$id,
        title: offer.jobs?.title,
        type: offer.jobs?.type,
        description: offer.jobs?.description,
        minSalary: offer.jobs?.minSalary,
        maxSalary: offer.jobs?.maxSalary,
        paymentType: offer.jobs?.paymentType,
        skills: offer.jobs?.skills
          ? {
              id: offer.jobs.skills.$id,
              icon: offer.jobs.skills.icon,
            }
          : null,
        location: offer.jobs?.locations
          ? {
              region: offer.jobs.locations.region,
              division: offer.jobs.locations.division,
              subdivision: offer.jobs.locations.subdivision,
            }
          : null,
      },
    }));
  } catch (err) {
    console.error('Error fetching job offers:', err);
    throw err;
  }
};

export const getRecommendedJobs = async (
  workerSkillId: string,
  workerRegion: string,
  industryId: string,
  isPro: boolean,
) => {
  try {
    const baseQueries = [
      isPro ? Query.orderDesc('$createdAt') : Query.orderAsc('$createdAt'),
      Query.equal('skills.industry', industryId),
      Query.select([
        '$id',
        'title',
        'type',
        'minSalary',
        'maxSalary',
        'paymentType',
        'maxApplicants',
        'applicantsCount',
        'recruiters.logo',
        'recruiters.users.name',
        'skills.$id',
        'skills.icon',
        'locations.region',
        'locations.division',
        'locations.subdivision',
      ]),
      Query.limit(50),
      Query.notEqual('isOffer', true),
    ];

    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      queries: baseQueries,
    });

    if (!res?.rows?.length) return [];

    // 2️⃣ Filter by skills and region
    const filtered = res.rows.filter((job) => {
      const skillMatch = !workerSkillId || job.skills?.$id === workerSkillId;
      const regionMatch =
        !workerRegion || job.locations?.region === workerRegion;
      return skillMatch && regionMatch;
    });

    // 3️⃣ Use fallback (any 5 jobs from same industry)
    const finalJobs =
      filtered.length > 0 ? filtered.slice(0, 5) : res.rows.slice(0, 5);

    // 4️⃣ Format response
    return finalJobs.map((job) => ({
      source: isPro ? 'recent' : 'older',
      id: job.$id,
      job: {
        id: job.$id,
        title: job.title,
        type: job.type,
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        paymentType: job.paymentType,
        createdAt: job.$createdAt,
        maxApplicants: job.maxApplicants,
        applicantsCount: job.applicantsCount,
        recruiter: job.recruiters
          ? {
              name: job.recruiters.users.name,
              logo: job.recruiters.logo,
            }
          : null,
        skills: job.skills
          ? {
              id: job.skills.$id,
              icon: job.skills.icon,
            }
          : null,
        location: job.locations
          ? {
              region: job.locations.region,
              division: job.locations.division,
              subdivision: job.locations.subdivision,
            }
          : null,
      },
    }));
  } catch (err) {
    console.error('Error fetching recommended jobs:', err);
    return [];
  }
};

export const getJobsByPlan = async (isPro: boolean) => {
  try {
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      queries: [
        isPro
          ? Query.orderDesc('$createdAt') // Pro → newest jobs first
          : Query.orderAsc('$createdAt'), // Non-Pro → oldest jobs first
        Query.limit(5),
        Query.notEqual('isOffer', true),
        Query.select([
          '$id',
          'title',
          'type',
          'minSalary',
          'maxSalary',
          'description',
          'paymentType',
          'maxApplicants',
          'applicantsCount',
          'recruiters.logo',
          'recruiters.users.name',
          'skills.$id',
          'skills.icon',
          'locations.region',
          'locations.division',
          'locations.subdivision',
        ]),
      ],
    });

    return res.rows.map((job) => ({
      source: isPro ? 'recent' : 'older',
      id: job.$id,
      job: {
        id: job.$id,
        title: job.title,
        type: job.type,
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        description: job.description,
        paymentType: job.paymentType,
        createdAt: job.$createdAt,
        maxApplicants: job.maxApplicants,
        applicantsCount: job.applicantsCount,
        recruiter: job.recruiters
          ? {
              name: job.recruiters.users.name,
              logo: job.recruiters.logo,
            }
          : null,
        skills: job.skills
          ? {
              id: job.skills.$id,
              icon: job.skills.icon,
            }
          : null,
        location: job.locations
          ? {
              region: job.locations.region,
              division: job.locations.division,
              subdivision: job.locations.subdivision,
            }
          : null,
      },
    }));
  } catch (err) {
    console.error('Error fetching jobs by plan:', err);
    return [];
  }
};

export const getWorkerFeed = async (user: any) => {
  const workerId = user?.workers?.$id;
  const workerSkillId = user?.skills?.$id;
  const industryId = user?.skills?.industry;
  const workerRegion = user?.locations;
  const isPro = user?.workers?.isPro;

  const [offers, recommended, jobsByPlan] = await Promise.all([
    getJobOffers(workerId),
    getRecommendedJobs(workerSkillId, workerRegion, industryId, isPro),
    getJobsByPlan(isPro),
  ]);

  const allJobs = [...offers, ...recommended, ...jobsByPlan];

  const uniqueJobs = Object.values(
    allJobs.reduce<Record<string, (typeof allJobs)[number]>>((acc, item) => {
      const jobId = item?.job?.id;
      if (jobId) {
        acc[jobId] = item;
      }
      return acc;
    }, {}),
  );

  return {
    offers,
    recommended,
    jobsByPlan,
    allJobs: uniqueJobs,
  };
};

export const getJobById = async (jobId: string, workerId: string) => {
  const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';
  try {
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      queries: [
        Query.equal('$id', jobId),
        Query.select([
          '$id',
          'title',
          'type',
          'minSalary',
          'maxSalary',
          'paymentType',
          'address',
          'status',
          '$createdAt',
          'maxApplicants',
          'applicantsCount',
          'recruiters.logo',
          'description',
          'recruiters.companyName',
          'recruiters.users.pushToken',
          'recruiters.users.name',
          'recruiters.users.avatar',
          'skills.icon',
          `skills.name_${lang}`,
          'locations.region',
          'locations.division',
          'locations.subdivision',
        ]),
      ],
    });

    if (!res.rows.length) return null; // no job found

    const job = res.rows[0]; // 👈 take the first one
    const offersRes = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobOffersCol,
      queries: [Query.equal('jobs', jobId), Query.equal('workers', workerId)],
    });
    const hasOffer = offersRes.total > 0;
    const offerDoc = hasOffer ? offersRes.rows[0] : null;

    const appRes = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.applicationsCol,
      queries: [Query.equal('jobs', jobId), Query.equal('workers', workerId)],
    });
    const hasApp = appRes.total > 0;
    const appDoc = hasApp ? appRes.rows[0] : null;

    return {
      id: job.$id,
      title: job.title,
      type: job.type,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      address: job.address,
      paymentType: job.paymentType,
      maxApplicants: job.maxApplicants,
      applicantsCount: job.applicantsCount,
      createdAt: job.$createdAt,
      description: job.description,
      status: job.status,
      recruiter: job.recruiters
        ? {
            pushToken: job.recruiters.users.pushToken,
            name: job.recruiters.users.name,
            logo: job.recruiters.logo,
            companyName: job.recruiters.companyName,
            avatar: job.recruiters.users.avatar,
          }
        : null,
      skill: job.skills
        ? {
            icon: job.skills.icon,
            name: job.skills?.[`name_${lang}`],
          }
        : null,
      location: job.locations
        ? {
            region: job.locations.region,
            division: job.locations.division,
            subdivision: job.locations.subdivision,
          }
        : null,
      isOffer: hasOffer,
      offerId: offerDoc?.$id ?? null,
      offerStatus: offerDoc?.status ?? null,
      isApp: hasApp,
      appStatus: appDoc?.status ?? null,
      appId: appDoc?.$id ?? null,
    };
  } catch (error) {
    console.error('Error fetching job by id:', error);
    throw error;
  }
};
export const getMyJobById = async (jobId: string) => {
  const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';
  try {
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      queries: [
        Query.equal('$id', jobId),
        Query.select([
          '$id',
          'title',
          'type',
          'minSalary',
          'maxSalary',
          'paymentType',
          'address',
          'status',
          '$createdAt',
          'maxApplicants',
          'applicantsCount',
          'recruiters.logo',
          'description',
          'recruiters.companyName',
          'recruiters.users.name',
          'recruiters.users.avatar',
          'skills.icon',
          `skills.name_${lang}`,
          'locations.region',
          'locations.division',
          'locations.subdivision',
        ]),
      ],
    });

    if (!res.rows.length) return null;

    const job = res.rows[0];

    return {
      id: job.$id,
      title: job.title,
      type: job.type,
      minSalary: job.minSalary,
      address: job.address,
      maxSalary: job.maxSalary,
      paymentType: job.paymentType,
      maxApplicants: job.maxApplicants,
      applicantsCount: job.applicantsCount,
      createdAt: job.$createdAt,
      description: job.description,
      status: job.status,
      recruiter: job.recruiters
        ? {
            name: job.recruiters.users.name,
            logo: job.recruiters.logo,
            companyName: job.recruiters.companyName,
            avatar: job.recruiters.users.avatar,
          }
        : null,
      skill: job.skills
        ? {
            icon: job.skills.icon,
            name: job.skills?.[`name_${lang}`],
          }
        : null,
      location: job.locations
        ? {
            region: job.locations.region,
            division: job.locations.division,
            subdivision: job.locations.subdivision,
          }
        : null,
    };
  } catch (error) {
    console.error('Error fetching job by id:', error);
    throw error;
  }
};

export const getJobsByRegionOrSkill = async (
  region: string,
  skillId: string,
  search?: string,
) => {
  const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

  try {
    // 🧭 Base queries
    const baseSelect = [
      '$id',
      'title',
      'type',
      'minSalary',
      'maxSalary',
      'paymentType',
      'status',
      '$createdAt',
      'maxApplicants',
      'applicantsCount',
      'recruiters.logo',
      'description',
      'recruiters.companyName',
      'recruiters.users.name',
      'recruiters.users.avatar',
      'skills.icon',
      `skills.name_${lang}`,
      'locations.region',
      'locations.division',
      'locations.subdivision',
    ];

    let jobs = [];

    // 🧭 Step 1: Query by region (and search if provided)
    const regionQueries = [
      Query.equal('locations.region', region),
      Query.select(baseSelect),
      Query.limit(10),
      Query.notEqual('isOffer', true),
    ];
    if (search && search.trim()) {
      const s = search.trim();
      regionQueries.push(
        Query.or([Query.search('title', s), Query.search('description', s)]),
      );
    }

    const regionRes = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      queries: regionQueries,
    });

    jobs = regionRes.rows;

    // 🧮 Step 2: If fewer than 5 jobs, query by skillId (and search if provided)
    if (jobs.length < 5 && skillId) {
      const skillQueries = [
        Query.equal('skills', skillId),
        Query.select(baseSelect),
        Query.limit(10),
        Query.notEqual('isOffer', true),
      ];
      if (search && search.trim()) {
        const s = search.trim();
        skillQueries.push(
          Query.or([Query.search('title', s), Query.search('description', s)]),
        );
      }

      const skillRes = await tables.listRows({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.jobsCol,
        queries: skillQueries,
      });

      const existingIds = new Set(jobs.map((j) => j.$id));
      jobs = [...jobs, ...skillRes.rows.filter((j) => !existingIds.has(j.$id))];
    }

    // 🎲 Step 3: If still fewer than 5, fetch random jobs (optionally matching search)
    if (jobs.length < 5) {
      const randomQueries = [
        Query.select(baseSelect),
        Query.limit(10),
        Query.notEqual('isOffer', true),
      ];
      if (search && search.trim()) {
        const s = search.trim();
        randomQueries.push(
          Query.or([Query.search('title', s), Query.search('description', s)]),
        );
      }

      const randomRes = await tables.listRows({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.jobsCol,
        queries: randomQueries,
      });

      const existingIds = new Set(jobs.map((j) => j.$id));
      const remaining = randomRes.rows.filter((j) => !existingIds.has(j.$id));

      // Randomize order slightly
      const shuffled = remaining.sort(() => 0.5 - Math.random());
      jobs = [...jobs, ...shuffled.slice(0, 5 - jobs.length)];
    }

    if (!jobs.length) return [];

    // 🧱 Step 4: Format & return jobs
    return jobs.map((job) => ({
      id: job.$id,
      title: job.title,
      type: job.type,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      paymentType: job.paymentType,
      maxApplicants: job.maxApplicants,
      applicantsCount: job.applicantsCount,
      createdAt: job.$createdAt,
      description: job.description,
      status: job.status,
      recruiter: job.recruiters
        ? {
            name: job.recruiters.users.name,
            logo: job.recruiters.logo,
            companyName: job.recruiters.companyName,
            avatar: job.recruiters.users.avatar,
          }
        : null,
      skill: job.skills
        ? {
            icon: job.skills.icon,
            name: job.skills?.[`name_${lang}`],
          }
        : null,
      location: job.locations
        ? {
            region: job.locations.region,
            division: job.locations.division,
            subdivision: job.locations.subdivision,
          }
        : null,
    }));
  } catch (error) {
    console.error('Error fetching jobs by region or skill:', error);
    throw error;
  }
};

export const getApplicationsByWorkerId = async (workerId: string) => {
  try {
    // Step 1: Fetch applications with jobs and recruiter references
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.applicationsCol,
      queries: [
        Query.equal('workers', workerId),
        Query.select([
          '$id',
          '$createdAt',
          'status',
          'instructions',
          'interview.$id',
          'interview.time',
          'interview.date',
          'interview.instructions',
          'interview.status',
          'jobs.$id',
          'jobs.title',
          'jobs.recruiters.$id', // only recruiter ID reference
          'jobs.recruiters.companyName', // only recruiter ID reference
        ]),
      ],
    });

    // Step 2: Collect recruiter IDs
    const recruiterIds = Array.from(
      new Set(
        res.rows.map((app: any) => app.jobs?.recruiters?.$id).filter(Boolean),
      ),
    );

    // Step 3: Fetch recruiter users from users table
    const usersMap: Record<string, string> = {};

    if (recruiterIds.length) {
      const usersRes = await tables.listRows({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.userCol,
        queries: [Query.equal('recruiters', recruiterIds)],
      });

      usersRes.rows.forEach((user: any) => {
        if (user.recruiters) {
          usersMap[user.recruiters] = user.name || 'Unknown Recruiter';
        }
      });
    }

    return res.rows.map((app: any) => ({
      id: app.$id,
      createdAt: app.$createdAt,
      status: app.status,
      interview: app.interview
        ? {
            id: app.interview.$id,
            time: app.interview.time,
            date: app.interview.date,
            instructions: app.interview.instructions,
            status: app.interview.status,
          }
        : null,
      job: app.jobs
        ? {
            id: app.jobs.$id,
            title: app.jobs.title,
            recruiter: {
              name: usersMap[app.jobs.recruiters?.$id] || 'Unknown Recruiter',
              companyName:
                app.jobs.recruiters?.companyName || 'Unknown Company',
            },
          }
        : null,
    }));
  } catch (error) {
    console.error('Error fetching applications by workerId:', error);
    throw error;
  }
};

export const applyForJob = async (
  jobId: string,
  workerId: string,
  reason: string,
) => {
  try {
    // 1️⃣ Check if user already applied
    const existing = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.applicationsCol,
      queries: [Query.equal('jobs', jobId), Query.equal('workers', workerId)],
    });

    if (existing.total > 0) {
      throw new Error('You have already applied for this job.');
    }

    // 2️⃣ Fetch job details
    const job = await tables.getRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      rowId: jobId,
    });

    if (!job) {
      throw new Error('Job not found.');
    }

    const { applicantsCount = 0, maxApplicants = 0, status } = job;

    // 3️⃣ Check if job is still open
    if (status === 'closed') {
      sendPushNotification({
        type: 'application_submitted',
        jobId,
        receiverId: job.recruiters?.$id, // notify recruiter
        message: `Job "${job.title}" is already closed.`,
      });
      throw new Error('This job is already closed.');
    }

    // 4️⃣ Check if max applicants reached
    if (applicantsCount >= maxApplicants) {
      // Close the job if not already closed
      await tables.updateRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.jobsCol,
        rowId: jobId,
        data: { status: 'closed' },
      });

      // Notify recruiter in a unified way
      sendPushNotification({
        type: 'admin_notification',
        receiverId: job.recruiters?.$id,
        message: `Maximum number of applicants reached for job "${job.title}". The job is now closed.`,
      });

      throw new Error(
        'Maximum number of applicants reached. The job is now closed.',
      );
    }

    // 5️⃣ Create new application
    const newApplication = await tables.createRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.applicationsCol,
      rowId: ID.unique(),
      data: {
        jobs: jobId,
        workers: workerId,
        reason,
        status: 'applied',
      },
    });

    // 6️⃣ Increment applicant count
    const newApplicantCount = applicantsCount + 1;
    const shouldClose = newApplicantCount >= maxApplicants;

    const updatedJob = await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      rowId: jobId,
      data: {
        applicantsCount: newApplicantCount,
        status: shouldClose ? 'closed' : 'active',
      },
    });

    // 7️⃣ Notify recruiter of new application (fire-and-forget)
    sendPushNotification({
      type: 'application_submitted',
      applicationId: newApplication.$id,
      jobId,
      receiverId: job.recruiters?.$id,
      message: `New applicant for job "${job.title}".`,
    });

    // 8️⃣ If max applicants reached now, notify recruiter
    if (shouldClose) {
      sendPushNotification({
        type: 'admin_notification',
        receiverId: job.recruiters?.$id,
        message: `Job "${job.title}" has reached maximum applicants and is now closed.`,
      });
    }

    return updatedJob;
  } catch (error) {
    console.error('❌ Error applying for job:', error);
    throw error;
  }
};

export const withdrawApp = async (appId: string, jobId: string) => {
  try {
    await tables.deleteRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.applicationsCol,
      rowId: appId,
    });

    const job = await tables.getRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      rowId: jobId,
    });

    if (!job) {
      throw new Error('Job not found.');
    }

    console.log('applicants count: ', job.applicantsCount);
    console.log('max applicants: ', job.maxApplicants);

    const { applicantsCount = 0, maxApplicants = 0, status } = job;

    const newApplicantCount = Math.max(applicantsCount - 1, 0);
    console.log('new applicants count: ', newApplicantCount);

    const shouldReopen =
      status === 'closed' && newApplicantCount < maxApplicants;

    // 5️⃣ Update the job
    const updatedJob = await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      rowId: jobId,
      data: {
        applicantsCount: newApplicantCount,
        status: shouldReopen ? 'active' : status,
      },
    });

    return updatedJob;
  } catch (error) {
    console.error('❌ Error withdrawing application:', error);
    throw error;
  }
};

export const acceptOffer = async (offerId: string) => {
  try {
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobOffersCol,
      rowId: offerId,
      data: { status: 'accepted' },
    });
  } catch (error) {
    console.error('❌ Error accepting offer:', error);
    throw error;
  }
};

export const rejectOffer = async (offerId: string, reason: string) => {
  try {
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobOffersCol,
      rowId: offerId,
      data: { status: 'declined', reason },
    });
  } catch (error) {
    console.error('❌ Error rejecting offer:', error);
    throw error;
  }
};

export const getJobsByRecruiterId = async (recruiterId: string) => {
  const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';
  try {
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      queries: [
        Query.equal('recruiters', recruiterId),
        Query.select([
          '$id',
          'title',
          'type',
          'minSalary',
          'maxSalary',
          'paymentType',
          'status',
          '$createdAt',
          'maxApplicants',
          'applicantsCount',
          'recruiters.logo',
          'description',
          'recruiters.companyName',
          'recruiters.users.name',
          'recruiters.users.avatar',
          'skills.icon',
          `skills.name_${lang}`,
          'locations.region',
          'locations.division',
          'locations.subdivision',
        ]),
        Query.orderDesc('$createdAt'),
      ],
    });

    if (!res?.total || !res.rows?.length) return [];

    return res.rows.map((job) => ({
      id: job.$id,
      title: job.title,
      type: job.type,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      paymentType: job.paymentType,
      maxApplicants: job.maxApplicants,
      applicantsCount: job.applicantsCount,
      createdAt: job.$createdAt,
      description: job.description,
      status: job.status,
      recruiter: job.recruiters
        ? {
            name: job.recruiters.users.name,
            logo: job.recruiters.logo,
            companyName: job.recruiters.companyName,
            avatar: job.recruiters.users.avatar,
          }
        : null,
      skill: job.skills
        ? {
            icon: job.skills.icon,
            name: job.skills?.[`name_${lang}`],
          }
        : null,
      location: job.locations
        ? {
            region: job.locations.region,
            division: job.locations.division,
            subdivision: job.locations.subdivision,
          }
        : null,
    }));
  } catch (error) {
    console.error('❌ Error getting jobs by recruiter ID:', error);
    throw error;
  }
};

export const deleteJob = async (jobId: string) => {
  if (!jobId) return;
  try {
    await tables.deleteRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      rowId: jobId,
    });
  } catch (error) {
    console.error('❌ Error deleting job:', error);
    throw error;
  }
};

export const togleJobStatus = async (jobId: string, status: string) => {
  try {
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      rowId: jobId,
      data: {
        status,
      },
    });
  } catch (error) {
    console.error('❌ Error toggling job status:', error);
    throw error;
  }
};

// 🔹 Define clear types for safety
interface ApplicantApplication {
  id: string;
  workerId: string;
  reason: string;
  status: string;
  interview: string | null;
}

interface ApplicantInfo {
  id: string;
  workerId: string;
  name: string;
  avatar: string | null;
  isPro: boolean;
  skill: string;
  pushToken: string;
  status: string;
  reason: string;
  interview: string | null;
  location: {
    subdivision: string;
    division: string;
    region: string;
  };
}

export const getApplicantsByJobId = async (
  jobId: string,
): Promise<ApplicantInfo[]> => {
  const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

  try {
    // 1️⃣ Fetch all applications linked to this job
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.applicationsCol,
      queries: [
        Query.equal('jobs', jobId),
        Query.select([
          '$id',
          'reason',
          'status',
          'workers.$id',
          'interview.$id',
        ]),
      ],
    });

    if (!res?.rows?.length) return [];

    // 2️⃣ Sanitize & type application data
    const applications: ApplicantApplication[] = res.rows
      .filter((a) => !!a?.$id && !!a?.workers?.$id)
      .map((a) => ({
        id: a.$id,
        workerId: a.workers.$id,
        reason: a?.reason || '',
        status: a?.status || 'applied',
        interview: a?.interview?.$id || null,
      }));

    if (!applications.length) return [];

    // 3️⃣ Fetch worker data for each application (keep 1:1 mapping)
    const results = await Promise.all(
      applications.map(async (app) => {
        const workerRes = await tables.listRows({
          databaseId: appwriteConfig.dbId,
          tableId: appwriteConfig.workerCol,
          queries: [
            Query.equal('$id', app.workerId),
            Query.select([
              '$id',
              'isPro',
              'users.name',
              'users.avatar',
              'users.locations.subdivision',
              'users.locations.division',
              'users.locations.region',
              'users.pushToken',
              `users.skills.name_${lang}`,
            ]),
          ],
        });

        const worker = workerRes?.rows?.[0];
        if (!worker) return null;

        return {
          id: app.id,
          workerId: app.workerId,
          name: worker?.users?.name,
          avatar: worker?.users?.avatar,
          isPro: worker?.isPro ?? false,
          pushToken: worker?.users?.pushToken || null,
          skill: worker?.users?.skills?.[`name_${lang}`],
          status: app.status,
          reason: app.reason,
          interview: app.interview,
          location: {
            subdivision: worker?.users?.locations?.subdivision,
            division: worker?.users?.locations?.division,
            region: worker?.users?.locations?.region,
          },
        } as ApplicantInfo;
      }),
    );

    // ✅ Strongly typed version
    const filteredResults: ApplicantInfo[] = results
      .filter((r): r is ApplicantInfo => r !== null && r !== undefined)
      .sort((a, b) => {
        if (a.isPro && !b.isPro) return -1; // Pro first
        if (!a.isPro && b.isPro) return 1;
        return 0;
      });

    return filteredResults;
  } catch (error) {
    console.error('❌ Error fetching applicants:', error);
    return [];
  }
};

export const updateApplicantStatus = async (
  applicationId: string,
  newStatus: string,
) => {
  try {
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.applicationsCol,
      rowId: applicationId,
      data: { status: newStatus },
    });

    return true;
  } catch (error) {
    console.error('❌ Error updating applicant status:', error);
    return false;
  }
};

export const scheduleInterview = async (
  applicationId: string,
  instructions: string,
  time: string,
  date: string,
  status?: string,
) => {
  try {
    // 1️⃣ Fetch application to check if interview exists
    const appRes = await tables.getRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.applicationsCol,
      rowId: applicationId,
    });

    const existingInterviewId = appRes?.interview;

    // 2️⃣ If an interview already exists → return it
    if (existingInterviewId) {
      console.log('Interview already exists:', existingInterviewId);
      return existingInterviewId;
    }

    // 3️⃣ Create NEW interview
    const newInterview = await tables.createRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.interviewCol,
      rowId: ID.unique(),
      data: {
        instructions,
        time,
        date,
        status: status || 'pending',
      },
    });

    // 4️⃣ Attach it to the application
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.applicationsCol,
      rowId: applicationId,
      data: { interview: newInterview.$id },
    });

    return newInterview.$id;
  } catch (error) {
    console.error('❌ Error scheduling interview:', error);
    return false;
  }
};

export const updateInterview = async (
  interviewId: string,
  instructions: string,
  time: string,
  date: string,
) => {
  try {
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.interviewCol,
      rowId: interviewId,
      data: {
        instructions,
        time,
        date,
      },
    });

    return true;
  } catch (error) {
    console.error('❌ Error updating interview:', error);
    return false;
  }
};
