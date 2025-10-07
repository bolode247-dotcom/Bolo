import { tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { job } from '@/types/genTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ID, Query } from 'react-native-appwrite';

export interface LocationOption {
  id: string;
  label: string;
}

export const createJob = async (values: job) => {
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
        salary: parseInt(salary ?? '0', 10),
        salaryType: salaryType || 'contract',
        maxApplicants: parseInt(maxApplicants ?? '0', 10),
        skills,
        status: 'active',
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getLocations = async (): Promise<LocationOption[]> => {
  const allLocations: LocationOption[] = [];
  let offset = 0;
  const limit = 100;

  try {
    while (true) {
      const res = await tables.listRows({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.locationsCol,
        queries: [Query.limit(limit), Query.offset(offset)],
      });

      const rows = res?.rows ?? [];
      if (!rows.length) break;

      const mapped = rows.map((row: any) => ({
        id: row.$id,
        label: row.subdivision ?? 'Unknown',
        value: row.$id,
      }));

      allLocations.push(...mapped);

      if (rows.length < limit) break;
      offset += limit;
    }

    return allLocations;
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    return []; // ✅ safe fallback
  }
};

export const getSkills = async (): Promise<LocationOption[]> => {
  const allSkills: LocationOption[] = [];
  let offset = 0;
  const limit = 100;
  const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

  try {
    while (true) {
      const res = await tables.listRows({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.skillsCol,
        queries: [
          Query.limit(limit),
          Query.offset(offset),
          Query.select(['$id', `name_${lang}`]),
        ],
      });

      const rows = res?.rows ?? [];
      if (!rows.length) break;

      const mapped = rows.map((row: any) => ({
        id: row.$id,
        label: row[`name_${lang}`] ?? 'Unknown',
        value: row.$id,
      }));

      allSkills.push(...mapped);

      if (rows.length < limit) break;
      offset += limit;
    }

    return allSkills;
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    return []; // ✅ safe fallback
  }
};
export const formatCameroonPhone = (phone: string) => {
  const trimmed = phone.replace(/\D/g, ''); // remove non-digits
  if (trimmed.startsWith('237')) {
    return `+${trimmed}`;
  }
  if (trimmed.startsWith('6')) {
    return `+237${trimmed}`;
  }
  if (trimmed.startsWith('0')) {
    return `+237${trimmed.slice(1)}`; // remove leading zero
  }
  return `+237${trimmed}`;
};

export const formatName = (fullName: string) => {
  return fullName
    .trim()
    .split(/\s+/) // split by spaces
    .map((word) =>
      word
        .split('-') // handle hyphenated names
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
        )
        .join('-'),
    )
    .join(' ');
};

export const getTopSkillsAndWorkers = async (
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
          let skills: any[] = []; // ✅ declare here
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
            skills = [
              {
                $id: skill.$id, // ✅ keep id
                name: lang === 'fr' ? skill.name_fr : skill.name_en,
                icon: skill.icon, // keep other fields if you need them
              },
            ];
          }

          // 🔹 Fetch location (string id in "locations" field)
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
          return worker; // fallback if hydration fails
        }
      }),
    );

    // 4️⃣ Normalize skills for translation
    workers = normalizeWorkerSkills(workers, lang);

    // 5️⃣ Compute top skills & workers
    const topSkills = computeTopSkills(workers);
    const topWorkers = computeTopWorkers(
      workers,
      recruiterLocation,
      recruiterSkills,
    );

    return { topSkills, topWorkers };
  } catch (error) {
    console.log('error fetching top skills and top workers: ', error);
    throw error;
  }
};

// 🔹 1. Normalize worker skills with translation
export const normalizeWorkerSkills = (workers: any[], lang: string) => {
  return workers.map((worker) => ({
    ...worker,
    users: {
      ...worker.users,
      skills:
        worker.users?.skills?.map((s: any) => ({
          $id: s.$id, // ✅ explicitly keep the id
          name: lang === 'fr' ? s.name_fr || s.name : s.name_en || s.name,
          icon: s.icon,
        })) || [],
    },
  }));
};

// 🔹 2. Build top skills (grouped by skill id)
const computeTopSkills = (workers: any[]) => {
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
    .slice(0, 5);
};

// 🔹 3. Find top workers by location, skills, or jobs
const computeTopWorkers = (
  workers: any[],
  recruiterLocation: any,
  recruiterSkills: string[],
) => {
  const topWorkers: any[] = [];

  // Location match
  for (const worker of workers) {
    if (topWorkers.length >= 2) break;
    const loc = worker.users?.locations;
    if (!loc) continue;

    if (
      (loc.subdivision && recruiterLocation.subdivision === loc.subdivision) ||
      (loc.division && recruiterLocation.division === loc.division) ||
      (loc.region && recruiterLocation.region === loc.region)
    ) {
      topWorkers.push(worker);
    }
  }

  // Skill match
  if (topWorkers.length < 2 && recruiterSkills.length > 0) {
    for (const worker of workers) {
      if (topWorkers.length >= 2) break;
      const workerSkills = worker.users?.skills?.map((s: any) => s.name) || [];
      if (workerSkills.some((s: string) => recruiterSkills.includes(s))) {
        if (!topWorkers.includes(worker)) {
          topWorkers.push(worker);
        }
      }
    }
  }

  // Jobs completed
  if (topWorkers.length < 2) {
    const sortedByJobs = [...workers].sort(
      (a, b) => (b.jobsCompleted || 0) - (a.jobsCompleted || 0),
    );
    for (const worker of sortedByJobs) {
      if (topWorkers.length >= 2) break;
      if (!topWorkers.includes(worker)) {
        topWorkers.push(worker);
      }
    }
  }

  return topWorkers;
};

export const getWorkerJobs = async () => {
  console.log('function triggered');
  return {
    topSkills: [],
    topWorkers: [],
    jobs: [], // workers branch fills this
  };
};
