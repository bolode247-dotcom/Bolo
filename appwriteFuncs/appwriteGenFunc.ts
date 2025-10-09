import { tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { Job } from '@/types/genTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ID, Query } from 'react-native-appwrite';

export interface LocationOption {
  id: string;
  label: string;
}

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

export const getRecommendedWorkers = async (
  recruiterRegion: string,
  recruiterSkillId?: string,
  industryId?: string,
) => {
  try {
    // 1️⃣ Always query by industry first for best performance
    const baseQueries = [
      industryId ? Query.equal('skills.industry', industryId) : null,
      Query.select([
        '$id',
        'users.name',
        'users.avatar',
        'users.email',
        'skills.$id',
        'skills.icon',
        'locations.region',
        'locations.division',
        'locations.subdivision',
      ]),
      Query.limit(100),
    ].filter(Boolean) as any[];

    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workerCol,
      queries: baseQueries,
    });

    if (!res?.rows?.length) return [];

    // 2️⃣ Filter by region and skills
    const filtered = res.rows.filter((worker) => {
      const regionMatch = worker.locations?.region === recruiterRegion;
      const skillMatch =
        !recruiterSkillId || worker.skills?.$id === recruiterSkillId;
      return regionMatch || skillMatch;
    });

    // 3️⃣ Use fallback (workers in same industry)
    const finalWorkers =
      filtered.length > 0 ? filtered.slice(0, 10) : res.rows.slice(0, 10);

    // 4️⃣ Format output
    return finalWorkers.map((worker) => ({
      id: worker.$id,
      name: worker.users?.name,
      avatar: worker.users?.avatar,
      email: worker.users?.email,
      skill: worker.skills
        ? {
            id: worker.skills.$id,
            icon: worker.skills.icon,
          }
        : null,
      location: worker.locations
        ? {
            region: worker.locations.region,
            division: worker.locations.division,
            subdivision: worker.locations.subdivision,
          }
        : null,
    }));
  } catch (error) {
    console.error('Error fetching recommended workers:', error);
    return [];
  }
};

export const getMustHaveSkills = async (recruiterRegion: string) => {
  try {
    const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

    // 1️⃣ Fetch workers and expand users → skills → locations
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workerCol,
      queries: [
        Query.select([
          '$id',
          'users.$id',
          'users.skills.$id',
          'users.skills.name_en',
          'users.skills.name_fr',
          'users.skills.icon',
          'users.locations.region',
        ]),
        Query.limit(100),
      ],
    });

    if (!res?.rows?.length) return [];

    // 2️⃣ Filter workers whose user is in the recruiter's region
    const regionalWorkers = res.rows.filter(
      (worker) => worker.users?.locations?.region === recruiterRegion,
    );

    // 3️⃣ Count skills frequency
    const skillMap: Record<string, { count: number; data: any }> = {};
    for (const worker of regionalWorkers) {
      const skill = worker.users?.skills;
      if (skill?.$id) {
        if (!skillMap[skill.$id]) {
          skillMap[skill.$id] = { count: 0, data: skill };
        }
        skillMap[skill.$id].count++;
      }
    }

    // 4️⃣ Sort and map
    const sortedSkills = Object.values(skillMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((s) => ({
        id: s.data.$id,
        name: lang === 'fr' ? s.data.name_fr : s.data.name_en,
        icon: s.data.icon,
        count: s.count,
      }));

    return sortedSkills;
  } catch (error) {
    console.error('Error fetching must-have skills:', error);
    return [];
  }
};

export const getRecruiterFeed = async (
  recruiterRegion: string,
  recruiterSkillId?: string,
  industryId?: string,
) => {
  const [mustHaveSkills, recommendedWorkers] = await Promise.all([
    getMustHaveSkills(recruiterRegion),
    getRecommendedWorkers(recruiterRegion, recruiterSkillId, industryId),
  ]);

  return { mustHaveSkills, recommendedWorkers };
};
