import { appwriteConfig } from '@/lib/appwriteConfig';

export const viewImage = (fileId: string) => {
  const endpoint = appwriteConfig.endpoint;
  const bucketId = appwriteConfig.boloBucketCol;
  const projectId = appwriteConfig.projectId;
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
};
