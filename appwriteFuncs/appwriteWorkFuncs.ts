import { tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { RecruiterFeedData, Worker } from '@/types/genTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ID, Query } from 'react-native-appwrite';
import { deleteFile, uploadFile } from './appwriteGenFunc';

export const getWorkersBySkillLocation = async (
  skillId: string,
  location?: string,
): Promise<Worker[]> => {
  try {
    const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

    // 1️⃣ Build base queries
    const baseQueries = [
      Query.select([
        '$id',
        'rating',
        'isPro', // ensure you have this at top level
        'users.$id',
        'users.name',
        'users.bio',
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

      // ⚡ prioritize pros server-side
      Query.orderDesc('isPro'),
      Query.limit(50), // limit to top 50 for performance
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

    if (!res?.rows?.length) return [];

    // 3️⃣ Map results
    const workers = res.rows.map((worker) => ({
      id: worker.$id,
      bio: worker.users?.bio,
      rating: worker.rating,
      isPro: worker.isPro,
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

    // 4️⃣ Client-side fine sorting
    // Verified pros first, then pros, then verified, then others
    return workers.sort((a, b) => {
      const scoreA =
        (a.isPro ? 2 : 0) + (a.isVerified ? 1 : 0) + (a.rating ?? 0) / 10;
      const scoreB =
        (b.isPro ? 2 : 0) + (b.isVerified ? 1 : 0) + (b.rating ?? 0) / 10;
      return scoreB - scoreA;
    });
  } catch (error) {
    console.error('❌ Error fetching recommended workers:', error);
    return [];
  }
};

export const getRecommendedWorkers = async (
  recruiterRegion: string,
  recruiterSkillId: string,
  industryId: string,
  limit = 25,
): Promise<Worker[]> => {
  try {
    const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';
    let workers: any[] = [];

    // Common SELECT fields
    const selectFields = [
      '$id',
      'rating',
      'isPro',
      'users.*',
      'users.bio',
      'users.skills.*',
      'users.locations.*',
    ];

    // Helper: run a query
    const fetchWorkers = async (queries: any[]) => {
      const res = await tables.listRows({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.workerCol,
        queries,
      });
      return res?.rows || [];
    };

    // 1️⃣ FIRST: Fetch by same industry
    const industryWorkers = await fetchWorkers([
      Query.equal('users.skills.industry', industryId),
      Query.select(selectFields),
      Query.limit(limit),
      Query.orderDesc('isPro'),
    ]);

    // Filter by region match first
    let industryMatches = industryWorkers.filter(
      (w) => w.users?.locations?.region === recruiterRegion,
    );

    // Add fallback if not enough
    if (industryMatches.length < limit) {
      // Include same industry, any region
      industryMatches = [
        ...industryMatches,
        ...industryWorkers.filter(
          (w) => !industryMatches.some((m) => m.$id === w.$id),
        ),
      ];
    }

    workers = industryMatches;

    // 2️⃣ FALLBACK: If still not enough, fetch same region any industry
    if (workers.length < limit) {
      const regionWorkers = await fetchWorkers([
        Query.equal('users.locations.region', recruiterRegion),
        Query.select(selectFields),
        Query.limit(limit),
        Query.orderDesc('isPro'),
      ]);

      const seen = new Set(workers.map((w) => w.$id));
      for (const w of regionWorkers) {
        if (!seen.has(w.$id)) {
          workers.push(w);
          seen.add(w.$id);
        }
        if (workers.length >= limit) break;
      }
    }

    // 3️⃣ FINAL FALLBACK: Random (still respecting industry)
    if (workers.length < limit) {
      const randomWorkers = await fetchWorkers([
        Query.select(selectFields),
        Query.limit(limit * 2),
      ]);

      const seen = new Set(workers.map((w) => w.$id));
      const shuffled = randomWorkers.sort(() => 0.5 - Math.random());
      for (const w of shuffled) {
        if (!seen.has(w.$id)) {
          workers.push(w);
          seen.add(w.$id);
        }
        if (workers.length >= limit) break;
      }
    }

    // 4️⃣ SMART SORTING (Pro > Verified > Same Skill > Same Region > Rating)
    const sorted = workers.sort((a, b) => {
      const score = (w: any) => {
        const skillMatch = w.users?.skills?.$id === recruiterSkillId ? 1 : 0;
        const regionMatch =
          w.users?.locations?.region === recruiterRegion ? 1 : 0;
        return (
          (w.isPro ? 3 : 0) +
          (w.users?.isVerified ? 2 : 0) +
          skillMatch +
          regionMatch +
          (w.rating ?? 0) / 10
        );
      };
      return score(b) - score(a);
    });

    // 5️⃣ Format result
    return sorted.slice(0, limit).map((worker) => ({
      id: worker.$id,
      rating: worker.rating,
      bio: worker.users?.bio,
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
    console.error('❌ Error fetching recommended workers:', error);
    return [];
  }
};

export const getRecruiterFeed = async (
  user: any,
): Promise<RecruiterFeedData> => {
  const recruiterRegion = user?.locations?.region;
  const recruiterSkillId = user?.skills?.$id;
  const industryId = user?.skills?.industry;
  const [mustHaveSkills, recommendedWorkers, recommendedPosts] =
    await Promise.all([
      getTopSkills(5),
      getRecommendedWorkers(recruiterRegion, recruiterSkillId, industryId, 2),
      getRecommendedWorkerPosts(
        recruiterRegion,
        recruiterSkillId,
        industryId,
        1,
      ),
    ]);

  return { mustHaveSkills, recommendedWorkers, recommendedPosts };
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

export const getInterview = async (interviewId: string) => {
  if (!interviewId) return null;

  try {
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.interviewCol,
      queries: [Query.equal('$id', interviewId)],
    });

    if (!res.rows.length) return null; // no interview found

    const interview = res.rows[0];

    return {
      id: interview.$id,
      time: interview.time,
      instructions: interview.instructions,
      date: interview.date,
      status: interview.status,
    };
  } catch (error: any) {
    console.log('error getting interview: ', error);
    throw error;
  }
};

export const updateInterviewStatus = async (
  interviewId: string,
  status: string,
) => {
  try {
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.interviewCol,
      rowId: interviewId,
      data: { status },
    });
  } catch (error: any) {
    console.log('error updating interview status: ', error);
    throw error;
  }
};

export const getWorkersBySkillRegion = async (
  region?: string,
  skillId?: string,
) => {
  const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';

  try {
    // --- Fields to select from USERS ---
    const userSelect = [
      '$id',
      'name',
      'avatar',
      'role',
      'isVerified',
      'locations.region',
      'locations.division',
      'locations.subdivision',
      'skills.$id',
      'skills.icon',
      `skills.name_${lang}`,
      'workers.$id',
      'bio',
      'workers.isPro',
      'workers.payRate',
      'workers.$createdAt',
    ];

    const queries: any[] = [Query.select(userSelect), Query.limit(25)];

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
      bio: user.bio ?? null,
      isPro: user.workers?.isPro ?? false,
      isVerified: user.isVerified ?? false,
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
          bio: user.bio ?? null,
          isPro: user.workers?.isPro ?? false,
          isVerified: user.isVerified ?? false,
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
      'bio',
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
      bio: user.bio ?? null,
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
          bio: user.bio ?? null,
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
        id: workSample.$id,
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
export const getRecommendedWorkerPosts = async (
  recruiterRegion: string,
  recruiterSkillId: string,
  industryId: string,
  limit = 10,
) => {
  try {
    // 1️⃣ Get recommended workers
    const recommendedWorkers = await getRecommendedWorkers(
      recruiterRegion,
      recruiterSkillId,
      industryId,
      limit,
    );

    if (!recommendedWorkers.length) return [];

    // 2️⃣ Extract worker IDs
    const workerIds = recommendedWorkers.map((w) => w.id);

    // 3️⃣ Fetch posts for those workers
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workSampleCol,
      queries: [
        Query.equal('workers', workerIds),
        Query.orderDesc('$createdAt'),
        Query.limit(limit * 2),
      ],
    });

    // 4️⃣ Sort posts by worker recommendation order
    const workerRank: Map<string, number> = new Map(
      recommendedWorkers.map((w, i) => [w.id, i]),
    );

    const posts = res.rows
      .filter((post) => workerRank.has(post.workers))
      .sort(
        (a, b) =>
          (workerRank.get(a.workers) ?? Number.MAX_SAFE_INTEGER) -
          (workerRank.get(b.workers) ?? Number.MAX_SAFE_INTEGER),
      )
      .map((post) => {
        const worker = recommendedWorkers.find((w) => w.id === post.workers);
        return {
          id: post.$id,
          caption: post.caption,
          image: post.image,
          createdAt: post.$createdAt,
          workerId: post.workers,
          worker: worker,
        };
      });

    return posts.slice(0, limit);
  } catch (error) {
    console.error('❌ Error fetching recommended worker posts:', error);
    return [];
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

export const getTopSkills = async (limit = 25) => {
  const lang = (await AsyncStorage.getItem('appLanguage')) || 'en';
  try {
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.skillsCol,
      queries: [
        Query.orderDesc('count'),
        Query.greaterThan('count', 0),
        Query.limit(limit),
      ],
    });
    return res.rows.map((skill) => {
      return {
        id: skill.$id,
        icon: skill.icon,
        name: skill[`name_${lang}`],
        count: skill.count,
      };
    });
  } catch (error) {
    console.error('❌ Error fetching top skills:', error);
    throw error;
  }
};
