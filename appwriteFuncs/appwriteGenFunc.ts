import { tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Query } from 'react-native-appwrite';

export interface LocationOption {
  id: string;
  label: string;
}

export const getLocations = async (): Promise<LocationOption[]> => {
  const allLocations: LocationOption[] = [];
  let offset = 0;
  const limit = 100; // Fetch 100 at a time

  try {
    while (true) {
      const res = await tables.listRows({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.locationsCol,
        queries: [Query.limit(limit), Query.offset(offset)],
      });

      // console.log('Raw Appwrite response:', res);

      const rows = res?.rows ?? [];
      if (!rows.length) break;

      // Map rows into picker-friendly objects
      const mapped = rows.map((row: any) => ({
        id: row.$id,
        label: row.subdivision ?? 'Unknown',
        value: row.$id,
      }));

      allLocations.push(...mapped);

      if (rows.length < limit) break; // stop when fewer rows than limit
      offset += limit;
    }

    return allLocations;
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    throw new Error('Failed to fetch locations');
  }
};

export const getSkills = async (): Promise<LocationOption[]> => {
  const allSkills: LocationOption[] = [];
  let offset = 0;
  const limit = 100; // Fetch 100 at a time

  const lang = await AsyncStorage.getItem('appLanguage');

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

      // console.log('Raw Appwrite response:', res);

      const rows = res?.rows ?? [];
      if (!rows.length) break;

      // Map rows into picker-friendly objects
      const mapped = rows.map((row: any) => {
        const label = row[`name_${lang}`] ?? 'Unknown';
        return {
          id: row.$id,
          label,
          value: row.$id,
        };
      });

      allSkills.push(...mapped);

      if (rows.length < limit) break; // stop when fewer rows than limit
      offset += limit;
    }

    console.log('Skills fetched successfully ');

    return allSkills;
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    throw new Error('Failed to fetch skills');
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
  console.log('location id: ', recruiterLocationId);
  try {
    // 0️⃣ Get user language
    const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

    // 1️⃣ Fetch the recruiter location document
    const recruiterLocation = await tables.getRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.locationsCol,
      rowId: recruiterLocationId,
    });

    // 2️⃣ Fetch workers with expanded users/skills/locations
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workerCol,
      queries: [
        Query.limit(500),
        Query.orderDesc('$createdAt'),
        Query.select(['*', 'users.*', 'users.skills.*', 'users.locations.*']),
      ],
    });

    let workers = res?.rows || [];

    // 🔄 Transform each worker's skills → add unified `name`
    workers = workers.map((worker: any) => ({
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

    // 3️⃣ Build top skills
    const skillCounts: Record<
      string,
      { id: string; count: number; icon?: string }
    > = {};

    for (const worker of workers) {
      const userSkills = worker.users?.skills || [];
      if (userSkills.length === 0) continue;

      for (const skill of userSkills) {
        if (!skillCounts[skill.name]) {
          skillCounts[skill.name] = {
            id: skill.$id,
            count: 0,
            icon: skill.icon,
          };
        }
        skillCounts[skill.name].count++;
      }
    }

    const topSkills = Object.entries(skillCounts)
      .map(([name, { id, count, icon }]) => ({
        id,
        name,
        workers: count,
        icon,
      }))
      .sort((a, b) => b.workers - a.workers)
      .slice(0, 5);

    // 4️⃣ Pick top 2 workers by location → skills → jobs
    const topWorkers: any[] = [];

    for (const worker of workers) {
      if (topWorkers.length >= 2) break;

      const loc = worker.users?.locations;
      let locationMatch = false;

      if (loc) {
        if (
          loc.subdivision &&
          recruiterLocation.subdivision === loc.subdivision
        )
          locationMatch = true;
        else if (loc.division && recruiterLocation.division === loc.division)
          locationMatch = true;
        else if (loc.region && recruiterLocation.region === loc.region)
          locationMatch = true;
      }

      if (locationMatch) {
        topWorkers.push(worker);
      }
    }

    // Fallback to skill match
    if (topWorkers.length < 2 && recruiterSkills.length > 0) {
      for (const worker of workers) {
        if (topWorkers.length >= 2) break;
        const workerSkills =
          worker.users?.skills?.map((s: any) => s.name) || [];
        if (workerSkills.some((s: string) => recruiterSkills.includes(s))) {
          if (!topWorkers.includes(worker)) {
            topWorkers.push(worker);
          }
        }
      }
    }

    // Fallback to most jobs completed
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

    return { topSkills, topWorkers };
  } catch (error) {
    console.log('error fetching top skills and top workers: ', error);
    throw error;
  }
};

export const getWorkerJobs = async () => {
  console.log('function triggered');
  return {
    topSkills: [],
    topWorkers: [],
    jobs: [], // workers branch fills this
  };
};
