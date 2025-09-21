import { tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
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

    console.log('locations fetched successfully ');

    return allLocations;
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    throw new Error('Failed to fetch locations');
  }
};
