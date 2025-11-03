import { tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { RecruiterFeedData, Skill, Worker } from '@/types/genTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ID, Query } from 'react-native-appwrite';
import { deleteFile, uploadFile } from './appwriteGenFunc';

export const getWorkersBySkillLocation = async (
  skillId: string,
  location?: string,
): Promise<Worker[]> => {
  try {
    const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

    // 1️⃣ Build query
    const baseQueries = [
      Query.select([
        '$id',
        'bio',
        'rating',
        'users.$id',
        'users.name',
        'users.isVerified',
        'users.avatar',
        'users.skills.$id',
        'users.skills.icon',
        'users.skills.name_en',
        'users.skills.name_fr',
        'users.skills.industry',
        'users.locations.region',
        'users.locations.division',
        'users.locations.subdivision',
      ]),
      Query.equal('users.skills.$id', skillId),
    ];

    if (location) {
      baseQueries.push(Query.equal('users.locations.$id', location));
    }

    // 2️⃣ Run query
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workerCol,
      queries: baseQueries,
    });

    // 3️⃣ Format result
    if (!res?.rows?.length) return [];

    return res.rows.map((worker) => ({
      id: worker.$id,
      rating: worker.rating,
      bio: worker.bio,
      name: worker.users?.name,
      avatar: worker.users?.avatar,
      isVerified: worker.users?.isVerified,
      skill: worker.users?.skills
        ? {
            id: worker.users.skills.$id,
            name:
              lang === 'fr'
                ? worker.users.skills.name_fr
                : worker.users.skills.name_en,
            icon: worker.users.skills.icon,
          }
        : null,
      location: worker.users?.locations
        ? {
            region: worker.users.locations.region,
            division: worker.users.locations.division,
            subdivision: worker.users.locations.subdivision,
          }
        : null,
    }));
  } catch (error) {
    console.error('Error fetching recommended workers:', error);
    return [];
  }
};

export const getRecommendedWorkers = async (
  recruiterRegion: string,
  recruiterSkillId?: string,
  industryId?: string,
): Promise<Worker[]> => {
  try {
    const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

    // 1️⃣ Base query (expand user, skill, and location)
    const baseQueries = [
      industryId ? Query.equal('users.skills.industry', industryId) : null,
      Query.select([
        '$id',
        'bio',
        'rating',
        'users.$id',
        'users.name',
        'users.avatar',
        'users.isVerified',
        'users.skills.$id',
        'users.skills.icon',
        'users.skills.name_en',
        'users.skills.name_fr',
        'users.skills.industry',
        'users.locations.region',
        'users.locations.division',
        'users.locations.subdivision',
      ]),
      Query.limit(100),
    ].filter(Boolean) as any[];

    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workerCol,
      queries: baseQueries,
    });

    if (!res?.rows?.length) return [];

    // 2️⃣ Filter by region or skill match
    const filtered = res.rows.filter((worker) => {
      const regionMatch = worker.users?.locations?.region === recruiterRegion;
      const skillMatch =
        !recruiterSkillId || worker.users?.skills?.$id === recruiterSkillId;
      return regionMatch || skillMatch;
    });

    // 3️⃣ Fallback: same industry
    const finalWorkers =
      filtered.length > 0 ? filtered.slice(0, 10) : res.rows.slice(0, 10);

    // 4️⃣ Format result
    return finalWorkers.map((worker) => ({
      id: worker.$id,
      rating: worker.rating,
      bio: worker.bio,
      name: worker.users?.name,
      avatar: worker.users?.avatar,
      isVerified: worker.users?.isVerified,
      skill: worker.users?.skills
        ? {
            id: worker.users.skills.$id,
            name:
              lang === 'fr'
                ? worker.users.skills.name_fr
                : worker.users.skills.name_en,
            icon: worker.users.skills.icon,
          }
        : null,
      location: worker.users?.locations
        ? {
            region: worker.users.locations.region,
            division: worker.users.locations.division,
            subdivision: worker.users.locations.subdivision,
          }
        : null,
    }));
  } catch (error) {
    console.error('Error fetching recommended workers:', error);
    return [];
  }
};

export const getMustHaveSkills = async (
  recruiterRegion: string,
): Promise<Skill[]> => {
  try {
    const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

    // 1️⃣ Fetch workers with expanded user, skills, and locations
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

    if (!res?.total || !res.rows?.length) return [];

    // 2️⃣ Filter by region (only valid if both region values exist)
    const regionalWorkers = res.rows.filter(
      (worker) =>
        worker?.users?.locations?.region &&
        worker.users.locations.region === recruiterRegion,
    );

    // Helper to count skill frequencies
    const buildSkillMap = (workers: any[]) => {
      const map: Record<string, { count: number; data: any }> = {};
      for (const worker of workers) {
        const skill = worker?.users?.skills;
        if (skill?.$id) {
          if (!map[skill.$id]) map[skill.$id] = { count: 0, data: skill };
          map[skill.$id].count++;
        }
      }
      return map;
    };

    // 3️⃣ Start with regional skills if any
    let skillMap = buildSkillMap(regionalWorkers);

    // 4️⃣ Fallback: if fewer than 5 skills found, expand to all workers
    if (Object.keys(skillMap).length < 5) {
      const allWorkersSkillMap = buildSkillMap(res.rows);
      const allSkills = Object.values(allWorkersSkillMap);

      // Shuffle randomly
      const shuffled = allSkills.sort(() => 0.5 - Math.random());
      // Take 5–10 random unique skills
      const randomSubset = shuffled.slice(0, Math.max(5, 10 - shuffled.length));
      skillMap = Object.fromEntries(randomSubset.map((s) => [s.data.$id, s]));
    }

    // 5️⃣ Sort by frequency and map to Skill[]
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
    console.error('❌ Error fetching must-have skills:', error);
    return [];
  }
};

export const getRecruiterFeed = async (
  user: any,
): Promise<RecruiterFeedData> => {
  const recruiterRegion = user?.locations?.region;
  const recruiterSkillId = user?.skills?.$id;
  const industryId = user?.skills?.industry; // use region
  const [mustHaveSkills, recommendedWorkers] = await Promise.all([
    getMustHaveSkills(recruiterRegion),
    getRecommendedWorkers(recruiterRegion, recruiterSkillId, industryId),
  ]);

  return { mustHaveSkills, recommendedWorkers };
};
export const getWorkerById = async (workerId: string) => {
  try {
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      queries: [
        Query.equal('workers', workerId),
        Query.select(['*', 'skills.*', 'locations.*', 'workers.*']),
      ],
    });

    if (!res.rows.length) throw new Error('worker_not_found');

    return res.rows[0];
  } catch (error) {
    console.log('error getting user by id: ', error);
    throw error;
  }
};

export const getWorkersBySkillRegion = async (
  region?: string,
  skillId?: string,
  search?: string,
) => {
  const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

  try {
    // --- Fields to select from USERS ---
    const userSelect = [
      '$id',
      'name',
      'avatar',
      'role',
      'locations.region',
      'locations.division',
      'locations.subdivision',
      'skills.$id',
      'skills.icon',
      `skills.name_${lang}`,
      'workers.$id',
      'workers.bio',
      'workers.payRate',
      'workers.$createdAt',
    ];

    const queries: any[] = [Query.select(userSelect), Query.limit(30)];

    queries.push(Query.equal('role', 'worker'));

    if (region) queries.push(Query.equal('locations.region', region));

    if (skillId) queries.push(Query.equal('skills', skillId));

    const userRes = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      queries,
    });

    let workers = userRes.rows.map((user: any) => ({
      id: user.workers?.$id,
      name: user.name,
      avatar: user.avatar,
      bio: user.workers?.bio ?? null,
      payRate: user.workers?.payRate ?? null,
      rating: user.workers?.rating ?? null,
      createdAt: user.workers?.$createdAt ?? null,
      skill: user.skills
        ? {
            id: user.skills.$id,
            icon: user.skills.icon,
            name: user.skills[`name_${lang}`],
          }
        : null,
      location: user.locations
        ? {
            region: user.locations.region,
            division: user.locations.division,
            subdivision: user.locations.subdivision,
          }
        : null,
    }));

    if (workers.length < 5) {
      const moreQueries: any[] = [
        Query.select(userSelect),
        Query.limit(20),
        Query.equal('role', 'worker'),
      ];
      const moreRes = await tables.listRows({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.userCol,
        queries: moreQueries,
      });

      const seen = new Set(workers.map((w) => w.id));
      for (const user of moreRes.rows) {
        if (seen.has(user.$id)) continue;
        seen.add(user.$id);

        workers.push({
          id: user.workers?.$id,
          name: user.name,
          avatar: user.avatar,
          bio: user.workers?.bio ?? null,
          payRate: user.workers?.payRate ?? null,
          rating: user.workers?.rating ?? null,
          createdAt: user.workers?.$createdAt ?? null,
          skill: user.skills
            ? {
                id: user.skills.$id,
                icon: user.skills.icon,
                name: user.skills[`name_${lang}`],
              }
            : null,
          location: user.locations
            ? {
                region: user.locations.region,
                division: user.locations.division,
                subdivision: user.locations.subdivision,
              }
            : null,
        });
      }
    }

    return workers;
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }
};

export const getWorkersBySearch = async (search?: string) => {
  const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';
  console.log('🔍 Search function triggered with:', search);

  try {
    const userSelect = [
      '$id',
      'name',
      'avatar',
      'role',
      'locations.region',
      'locations.division',
      'locations.subdivision',
      'skills.$id',
      'skills.icon',
      `skills.name_${lang}`,
      'workers.$id',
      'workers.bio',
      'workers.payRate',
      'workers.rating',
      'workers.$createdAt',
    ];

    let matchedSkillIds: string[] = [];
    const s = search?.trim();
    if (s) {
      console.log('🔎 resolving skill ids for search:', s);
      matchedSkillIds = await getSkillIdsByName(s);
      console.log('🔎 matchedSkillIds:', matchedSkillIds);
    }

    // Base query for workers
    const baseQueries = [
      Query.select(userSelect),
      Query.limit(30),
      Query.equal('role', 'worker'),
    ];

    // Add name text search if possible
    if (s) {
      console.log('✅ adding Query.search for name:', s);
      baseQueries.push(Query.search('name', s));
    }

    let userRes;

    // If we have matched skill IDs, use OR queries for them
    if (matchedSkillIds.length > 0) {
      console.log('🎯 Searching by skill relation (manual merge logic)');

      const queryResults = await Promise.all(
        matchedSkillIds.map((id) => {
          console.log('searching by skill id:', id);
          return tables.listRows({
            databaseId: appwriteConfig.dbId,
            tableId: appwriteConfig.userCol,
            queries: [...baseQueries],
          });
        }),
      );

      console.log('Query results', queryResults[0].rows);
      // Merge results and remove duplicates
      const allUsers = queryResults.flatMap((res) => res.rows || []);
      const uniqueUsers = Object.values(
        allUsers.reduce((acc, user) => ({ ...acc, [user.$id]: user }), {}),
      );

      userRes = { rows: uniqueUsers };
    } else {
      userRes = await tables.listRows({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.userCol,
        queries: baseQueries,
      });
    }

    console.log('📦 raw user rows returned:', userRes.rows?.length ?? 0);

    let workers = userRes.rows.map((user: any) => ({
      id: user.workers?.$id,
      name: user.name,
      avatar: user.avatar,
      bio: user.workers?.bio ?? null,
      payRate: user.workers?.payRate ?? null,
      rating: user.workers?.rating ?? null,
      createdAt: user.workers?.$createdAt ?? null,
      skill: user.skills
        ? {
            id: user.skills.$id,
            icon: user.skills.icon,
            name: user.skills[`name_${lang}`],
          }
        : null,
      location: user.locations
        ? {
            region: user.locations.region,
            division: user.locations.division,
            subdivision: user.locations.subdivision,
          }
        : null,
    }));

    // Fallback if too few results
    if (workers.length < 5) {
      console.log('🔁 Fewer than 5 results, fetching generic workers...');
      const moreRes = await tables.listRows({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.userCol,
        queries: [
          Query.select(userSelect),
          Query.limit(10),
          Query.equal('role', 'worker'),
        ],
      });

      console.log('📦 Additional generic results:', moreRes.rows?.length || 0);

      const seen = new Set(workers.map((w) => w.id));
      for (const user of moreRes.rows) {
        if (seen.has(user.workers?.$id)) continue;
        seen.add(user.workers?.$id);

        workers.push({
          id: user.workers?.$id,
          name: user.name,
          avatar: user.avatar,
          bio: user.workers?.bio ?? null,
          payRate: user.workers?.payRate ?? null,
          rating: user.workers?.rating ?? null,
          createdAt: user.workers?.$createdAt ?? null,
          skill: user.skills
            ? {
                id: user.skills.$id,
                icon: user.skills.icon,
                name: user.skills[`name_${lang}`],
              }
            : null,
          location: user.locations
            ? {
                region: user.locations.region,
                division: user.locations.division,
                subdivision: user.locations.subdivision,
              }
            : null,
        });
      }
    }

    console.log('✅ Final worker count:', workers.length);
    return workers;
  } catch (error) {
    console.error('❌ Error fetching workers:', error);
    throw error;
  }
};

export const getSkillIdsByName = async (
  searchTerm: string,
): Promise<string[]> => {
  try {
    const queries = [
      Query.search('name_en', searchTerm),
      Query.search('name_fr', searchTerm),
    ];

    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.skillsCol,
      queries: [
        Query.or(queries), // combine all localized searches
        Query.limit(20),
      ],
    });

    console.log('skills fetched ', res.rows);

    return res.rows.map((skill) => skill.$id);
  } catch (err) {
    console.error('Error fetching skill IDs by name:', err);
    return [];
  }
};

export const getWorkSample = async (userId: string) => {
  try {
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workSampleCol,
      queries: [Query.equal('workers', userId), Query.orderDesc('$createdAt')],
    });

    return res.rows.map((workSample) => {
      return {
        $id: workSample.$id,
        caption: workSample.caption,
        image: workSample.image,
        createdAt: workSample.$createdAt,
      };
    });
  } catch (error) {
    console.error('❌ Error fetching work samples:', error);
    throw error;
  }
};

export const addWorkSample = async (
  workerId: string,
  caption: string,
  image: string,
) => {
  try {
    const imageId = await uploadFile(image);
    await tables.createRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workSampleCol,
      rowId: ID.unique(),
      data: {
        workers: workerId,
        caption: caption,
        image: imageId,
      },
    });
  } catch (error) {
    console.error('❌ Error updating work sample:', error);
    throw error;
  }
};

export const updateWorkSampleCaption = async (
  workSampleId: string,
  caption: string,
) => {
  try {
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workSampleCol,
      rowId: workSampleId,
      data: {
        caption: caption,
      },
    });
  } catch (error) {
    console.error('❌ Error updating work sample caption:', error);
    throw error;
  }
};

export const updateWorkSampleImage = async (
  postId: string,
  uri: string,
  image: string,
) => {
  try {
    await deleteFile(image);
    const imageId = await uploadFile(uri);
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workSampleCol,
      rowId: postId,
      data: {
        image: imageId,
      },
    });
  } catch (error) {
    console.error('❌ Error updating work sample image:', error);
    throw error;
  }
};

export const deleteWorkSample = async (postId: string, image: string) => {
  try {
    await deleteFile(image);
    await tables.deleteRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workSampleCol,
      rowId: postId,
    });
  } catch (error) {
    console.error('❌ Error deleting work sample:', error);
    throw error;
  }
};
