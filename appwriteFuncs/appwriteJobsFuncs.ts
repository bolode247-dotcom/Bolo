import { tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Query } from 'react-native-appwrite';

export const getJobOffers = async (workerId: string) => {
  console.log('workerker skill id: ', workerId);
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
      offerId: offer.$id,
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
) => {
  try {
    // 1️⃣ Always query jobs by industry first
    const baseQueries = [
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
      source: 'recommended',
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
  const workerSkillId = user.skills.$id;
  const industryId = user?.skills?.industry; // single skill id
  const workerRegion = user.locations; // use region
  const isPro = user.worker?.isPro;

  const [offers, recommended, jobsByPlan] = await Promise.all([
    getJobOffers(workerId),
    getRecommendedJobs(workerSkillId, workerRegion, industryId),
    getJobsByPlan(isPro),
  ]);

  const allJobs = [...offers, ...recommended, ...jobsByPlan];

  const uniqueJobs = Object.values(
    allJobs.reduce<Record<string, (typeof allJobs)[number]>>((acc, item) => {
      acc[item.job.id] = item;
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
  search?: string, // 👈 added optional search term
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
          Query.or([
            Query.search('title', s),
            Query.search('description', s),
            Query.search(`skills.name_${lang}`, s),
          ]),
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
          Query.or([
            Query.search('title', s),
            Query.search('description', s),
            Query.search(`skills.name_${lang}`, s),
          ]),
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
