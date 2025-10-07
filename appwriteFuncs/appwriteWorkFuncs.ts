import { tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Query } from 'react-native-appwrite';
import { normalizeWorkerSkills } from './appwriteGenFunc';

export const getWorkersByCategory = async ({
  categoryId,
  locationId,
}: {
  categoryId: string;
  locationId: string | null;
}) => {
  try {
    const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

    // 1️⃣ Fetch all workers
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workerCol,
      queries: [Query.limit(500)],
    });

    let workers = res?.rows || [];

    // 2️⃣ Hydrate workers with user, skills, and location
    workers = await Promise.all(
      workers.map(async (worker: any) => {
        try {
          let skills: any[] = [];
          let location = null;

          // Fetch user
          const user = await tables.getRow({
            databaseId: appwriteConfig.dbId,
            tableId: appwriteConfig.userCol,
            rowId: worker.users,
          });

          // Fetch skill(s)
          if (user.skills) {
            const skill = await tables.getRow({
              databaseId: appwriteConfig.dbId,
              tableId: appwriteConfig.skillsCol,
              rowId: user.skills,
            });
            skills = [
              {
                ...skill,
                name: lang === 'fr' ? skill.name_fr : skill.name_en,
              },
            ];
          }

          // Fetch location
          if (user.locations) {
            location = await tables.getRow({
              databaseId: appwriteConfig.dbId,
              tableId: appwriteConfig.locationsCol,
              rowId: user.locations,
            });
          }

          return {
            ...worker,
            users: {
              ...user,
              skills,
              locations: location,
            },
          };
        } catch (err) {
          console.error('Failed hydrating worker:', worker.$id, err);
          return worker;
        }
      }),
    );

    // 3️⃣ Normalize skills for translation
    workers = workers.map((worker) => ({
      ...worker,
      users: {
        ...worker.users,
        skills:
          worker.users?.skills?.map((s: any) => ({
            ...s,
            name: lang === 'fr' ? s.name_fr : s.name_en,
          })) || [],
      },
    }));

    // 4️⃣ Filter by categoryId (worker type)
    workers = workers.filter((worker) => {
      const skillIds = worker.users?.skills?.map((s: any) => s.$id) || [];
      return skillIds.includes(categoryId);
    });

    // 5️⃣ Optional filter by locationId
    if (locationId) {
      workers = workers.filter(
        (worker) => worker.users?.locations?.$id === locationId,
      );
    }

    return workers;
  } catch (error) {
    console.error('Error fetching workers by category:', error);
    throw error;
  }
};

export const getTopSkills = async () => {
  try {
    const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

    // 1️⃣ Fetch workers (same way as in getTopSkillsAndWorkers)
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workerCol,
      queries: [Query.limit(500)],
    });

    let workers = res?.rows || [];

    // 2️⃣ Hydrate workers with user + skills
    workers = await Promise.all(
      workers.map(async (worker: any) => {
        try {
          let skills: any[] = [];

          // Fetch user
          const user = await tables.getRow({
            databaseId: appwriteConfig.dbId,
            tableId: appwriteConfig.userCol,
            rowId: worker.users,
          });

          // 🔹 Fetch skill (string id)
          if (user.skills) {
            const skill = await tables.getRow({
              databaseId: appwriteConfig.dbId,
              tableId: appwriteConfig.skillsCol,
              rowId: user.skills,
            });
            skills = [
              {
                $id: skill.$id,
                name: lang === 'fr' ? skill.name_fr : skill.name_en,
                icon: skill.icon,
              },
            ];
          }

          return {
            ...worker,
            users: {
              ...user,
              skills,
            },
          };
        } catch (err) {
          console.error('Failed hydrating worker:', worker.$id, err);
          return worker;
        }
      }),
    );

    // 3️⃣ Normalize worker skills
    workers = normalizeWorkerSkills(workers, lang);

    // 4️⃣ Compute top 25 skills
    const topSkills = computeTopSkills25(workers);
    console.log('top skills: ', topSkills);
    return { topSkills };
  } catch (error) {
    console.log('error fetching top skills: ', error);
    throw error;
  }
};

// 🔹 New function (slice 25 instead of 5)
const computeTopSkills25 = (workers: any[]) => {
  const skillCounts: Record<
    string,
    { id: string; name: string; count: number; icon: string }
  > = {};

  for (const worker of workers) {
    const userSkills = worker.users?.skills || [];
    for (const skill of userSkills) {
      if (!skillCounts[skill.$id]) {
        skillCounts[skill.$id] = {
          id: skill.$id,
          name: skill.name,
          count: 0,
          icon: skill.icon || 'help-circle',
        };
      }
      skillCounts[skill.$id].count++;
    }
  }

  return Object.values(skillCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 25);
};

// 🚀 Build Recommended Workers (max 25)
const computeRecommendedWorkers = (
  workers: any[],
  recruiter: any,
  recruiterSkills: string[], // list of skill ids
) => {
  const recommended: any[] = [];
  const usedIds = new Set<string>();

  const addWorkers = (list: any[], count: number) => {
    for (const worker of list) {
      if (recommended.length >= 25) break;
      if (!usedIds.has(worker.$id)) {
        recommended.push(worker);
        usedIds.add(worker.$id);
      }
      if (recommended.length >= count) break;
    }
  };

  // 1️⃣ From same industry
  if (recruiterSkills?.length > 0) {
    const industryWorkers = workers.filter((w) => {
      const wIndustry = w.users?.skills?.industry;
      return recruiter.industry && wIndustry === recruiter.industry;
    });
    addWorkers(industryWorkers, recommended.length + 5);
  }

  // 2️⃣ From same skill(s)
  if (recruiterSkills?.length > 0) {
    const skillWorkers = workers.filter((w) =>
      recruiterSkills.includes(w.users?.skills?.$id),
    );
    addWorkers(skillWorkers, recommended.length + 5);
  }

  // 3️⃣ From same region
  if (recruiter.locations?.region) {
    const regionWorkers = workers.filter(
      (w) => w.users?.locations?.region === recruiter.locations.region,
    );
    addWorkers(regionWorkers, recommended.length + 5);
  }

  // 4️⃣ From same subdivision
  if (recruiter.locations?.subdivision) {
    const subdivisionWorkers = workers.filter(
      (w) =>
        w.users?.locations?.subdivision === recruiter.locations.subdivision,
    );
    addWorkers(subdivisionWorkers, recommended.length + 5);
  }

  // 5️⃣ Most jobs completed
  const topByJobs = [...workers].sort(
    (a, b) => (b.jobsCompleted || 0) - (a.jobsCompleted || 0),
  );
  addWorkers(topByJobs, recommended.length + 5);

  // 6️⃣ Fill remaining up to 25
  if (recommended.length < 25) {
    for (const worker of workers) {
      if (recommended.length >= 25) break;
      if (!usedIds.has(worker.$id)) {
        recommended.push(worker);
        usedIds.add(worker.$id);
      }
    }
  }

  return recommended;
};

export const getRecommendedWorkers = async (
  recruiterLocationId: string,
  recruiterSkills: string[] = [],
) => {
  try {
    const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

    // 1️⃣ Fetch recruiter location
    const recruiterLocation = await tables.getRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.locationsCol,
      rowId: recruiterLocationId,
    });

    // 2️⃣ Fetch workers (without deep expansion, just base worker records)
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workerCol,
      queries: [Query.limit(500)],
    });

    let workers = res?.rows || [];

    // 3️⃣ Hydrate workers with user, skills, and location
    workers = await Promise.all(
      workers.map(async (worker: any) => {
        try {
          let skills: any[] = []; // always an array
          let location = null;

          // Fetch user
          const user = await tables.getRow({
            databaseId: appwriteConfig.dbId,
            tableId: appwriteConfig.userCol,
            rowId: worker.users, // worker.users holds the userId
          });

          // 🔹 Fetch skill (string id)
          if (user.skills) {
            const skill = await tables.getRow({
              databaseId: appwriteConfig.dbId,
              tableId: appwriteConfig.skillsCol,
              rowId: user.skills,
            });

            skills.push({
              $id: skill.$id,
              name: lang === 'fr' ? skill.name_fr : skill.name_en,
              icon: skill.icon,
              industry: skill.industry,
            });
          }

          // 🔹 Fetch location
          if (user.locations) {
            location = await tables.getRow({
              databaseId: appwriteConfig.dbId,
              tableId: appwriteConfig.locationsCol,
              rowId: user.locations,
            });
          }

          return {
            ...worker,
            users: {
              ...user,
              skills, // ✅ always array
              locations: location,
            },
          };
        } catch (err) {
          console.error('Failed hydrating worker:', worker.$id, err);
          return worker; // fallback if hydration fails
        }
      }),
    );

    // 4️⃣ Normalize skills for translation
    workers = normalizeWorkerSkills(workers, lang);

    // 5️⃣ Compute top skills & workers
    const topWorkers = computeRecommendedWorkers(
      workers,
      recruiterLocation,
      recruiterSkills,
    );

    return topWorkers;
  } catch (error) {
    console.log('error fetching top skills and top workers: ', error);
    throw error;
  }
};

export const getWorkerById = async (workerId: string) => {
  console.log('user id: ', workerId);
  try {
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      queries: [
        Query.equal('$id', workerId),
        Query.select([
          '*',
          'skills.*',
          'locations.*',
          'workers.*',
          'recruiters.*',
        ]),
      ],
    });

    if (!res.rows.length) throw new Error('worker_not_found');

    console.log('worker: ', res.rows[0].locations);

    return res.rows[0];
  } catch (error) {
    console.log('error getting user by id: ', error);
    throw error;
  }
};
