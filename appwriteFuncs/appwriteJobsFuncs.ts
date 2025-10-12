import { tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { Job, Offer } from '@/types/genTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ID, Query } from 'react-native-appwrite';

export const createJob = async (values: Job) => {
  const {
    title,
    description,
    recruiters,
    type,
    salary,
    salaryType,
    maxApplicants,
    skills,
    locations,
  } = values;

  try {
    await tables.createRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.jobsCol,
      rowId: ID.unique(),
      data: {
        title,
        description,
        recruiters,
        locations,
        type,
        salary: salary ? parseInt(salary.toString(), 10) : 0,
        salaryType: salaryType || 'contract',
        maxApplicants: maxApplicants
          ? parseInt(maxApplicants.toString(), 10)
          : 0,
        skills,
        status: 'active',
      },
    });
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
        Query.select([
          '$id',
          'jobs.$id',
          'jobs.title',
          'jobs.type',
          'jobs.salary',
          'jobs.salaryType',
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
        id: offer.jobs?.$id,
        title: offer.jobs?.title,
        type: offer.jobs?.type,
        salary: offer.jobs?.salary,
        salaryType: offer.jobs?.salaryType,
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
    // 1️⃣ Always query jobs by industry first
    const baseQueries = [
      isPro
        ? Query.orderDesc('$createdAt') // Pro → newest jobs first
        : Query.orderAsc('$createdAt'),
      Query.equal('skills.industry', industryId),
      Query.select([
        '$id',
        'title',
        'type',
        'salary',
        'salaryType',
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
        salary: job.salary,
        salaryType: job.salaryType,
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
        Query.select([
          '$id',
          'title',
          'type',
          'salary',
          'salaryType',
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
        salary: job.salary,
        salaryType: job.salaryType,
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
  const isPro = user?.worker?.isPro;

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

export const getJobById = async (jobId: string) => {
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
          'salary',
          'salaryType',
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

    if (!res.rows.length) return null; // no job found

    const job = res.rows[0]; // 👈 take the first one

    return {
      id: job.$id,
      title: job.title,
      type: job.type,
      salary: job.salary,
      salaryType: job.salaryType,
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
      'salary',
      'salaryType',
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
      const randomQueries = [Query.select(baseSelect), Query.limit(10)];
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
      salary: job.salary,
      salaryType: job.salaryType,
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
      instructions: app.instructions || null,
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
}; // adjust paths

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
      throw new Error(
        'Maximum number of applicants reached. The job is now closed.',
      );
    }

    // 5️⃣ Create new application
    await tables.createRow({
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
          'salary',
          'salaryType',
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

    if (!res?.total || !res.rows?.length) return [];

    return res.rows.map((job) => ({
      id: job.$id,
      title: job.title,
      type: job.type,
      salary: job.salary,
      salaryType: job.salaryType,
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
}

interface ApplicantInfo {
  id: string;
  workerId: string;
  name: string;
  avatar: string | null;
  isPro: boolean;
  skill: string;
  status: string;
  reason: string;
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
        Query.select(['$id', 'reason', 'status', 'workers.$id']),
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
          skill: worker?.users?.skills?.[`name_${lang}`],
          status: app.status,
          reason: app.reason,
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
