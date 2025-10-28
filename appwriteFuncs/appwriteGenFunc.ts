import { storage, tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { Chat, ChatDetails, Message } from '@/types/genTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ID, Query } from 'react-native-appwrite';
export interface LocationOption {
  id: string;
  label: string;
}

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

export const getOrCreateChat = async (
  recruiterId: string,
  workerId: string,
  jobId: string,
) => {
  try {
    // 1️⃣ Check if chat already exists
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.chatsCol,
      queries: [
        Query.equal('participants', recruiterId),
        Query.equal('participants', workerId),
        Query.equal('jobs', jobId),
      ],
    });

    let chat = res?.rows?.[0];

    // 2️⃣ If not found → create new one
    if (!chat) {
      const created = await tables.createRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.chatsCol,
        rowId: ID.unique(),
        data: {
          participants: [recruiterId, workerId],
          recruiters: recruiterId,
          jobs: jobId,
          lastMessage: 'Start a conversation',
          lastMessageAt: new Date().toISOString(),
          unreadByRecruiter: 0,
          unreadBySeeker: 0,
        },
      });

      chat = created;
    }

    return chat;
  } catch (err) {
    console.error('❌ getOrCreateChat error:', err);
    throw err;
  }
};

type ChatPreview = {
  id: string;
  jobId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  participant: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

export const getChats = async (
  userId: string,
  role: 'recruiter' | 'worker',
): Promise<ChatPreview[]> => {
  try {
    // 1️⃣ Get chats where current user is in participants
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.chatsCol,
      queries: [
        Query.search('participants', userId),
        Query.select([
          '$id',
          'participants',
          'jobs.$id',
          'lastMessage',
          'lastMessageAt',
          'recruiters.$id',
          'unreadByRecruiter',
          'unreadBySeeker',
        ]),
      ],
    });

    if (!res?.rows?.length) return [];

    // 2️⃣ Resolve each chat
    const chats = await Promise.all(
      res.rows.map(async (chat): Promise<ChatPreview | null> => {
        const isRecruiter = role === 'recruiter';

        // 🧩 Extract the other participant (not the current user)
        const otherId = chat.participants?.find((p: string) => p !== userId);
        if (!otherId) return null;

        // Determine which table to query for the other participant
        const otherTable = isRecruiter
          ? appwriteConfig.workerCol
          : appwriteConfig.recruiterCol;

        const otherSelectFields = isRecruiter
          ? ['$id', 'users.name', 'users.avatar']
          : ['$id', 'companyName', 'logo', 'users.name', 'users.avatar'];

        // 3️⃣ Fetch participant details
        const otherRes = await tables.listRows({
          databaseId: appwriteConfig.dbId,
          tableId: otherTable,
          queries: [
            Query.equal('$id', otherId),
            Query.select(otherSelectFields),
          ],
        });

        const otherData = otherRes?.rows?.[0];

        // 4️⃣ Graceful fallback for missing fields
        const otherName = isRecruiter
          ? otherData?.users?.name || 'Unknown'
          : otherData?.companyName || otherData?.users?.name || 'Unknown';

        const otherAvatar = isRecruiter
          ? otherData?.users?.avatar || null
          : otherData?.logo || otherData?.users?.avatar || null;

        const unreadCount = isRecruiter
          ? chat.unreadByRecruiter || 0
          : chat.unreadBySeeker || 0;

        return {
          id: chat.$id,
          jobId: chat.jobs.$id,
          lastMessage: chat.lastMessage,
          lastMessageAt: chat.lastMessageAt,
          unreadCount,
          participant: {
            id: otherId,
            name: otherName,
            avatar: otherAvatar,
          },
        };
      }),
    );

    // 5️⃣ Filter & sort
    const validChats = chats.filter((c): c is ChatPreview => c !== null);
    const sortedChats = validChats.sort((a, b) => {
      const dateA = new Date(a.lastMessageAt ?? 0).getTime();
      const dateB = new Date(b.lastMessageAt ?? 0).getTime();
      return dateB - dateA;
    });

    return sortedChats;
  } catch (error) {
    console.error('❌ Error fetching chats:', error);
    return [];
  }
};

/**
 * ✅ Fetch chat + messages safely and flatten fields
 */
export const getChatDetailsWithMessages = async (
  chatId: string,
): Promise<ChatDetails> => {
  try {
    // Step 1️⃣ Fetch the chat with required fields (include unread counts)
    const chatRes = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.chatsCol,
      queries: [
        Query.equal('$id', chatId),
        Query.select([
          '$id',
          'participants',
          'lastMessage',
          'lastMessageAt',
          'unreadByRecruiter',
          'unreadBySeeker',
          '$createdAt',
          '$updatedAt',
        ]),
      ],
    });

    const rawChat = chatRes?.rows?.[0];
    if (!rawChat) throw new Error('Chat not found');

    // 🧩 Flatten and type the chat data
    const chat: Chat = {
      $id: rawChat.$id,
      participants: rawChat.participants ?? [],
      lastMessage: rawChat.lastMessage ?? '',
      lastMessageAt: rawChat.lastMessageAt ?? null,
      unreadByRecruiter: rawChat.unreadByRecruiter ?? 0,
      unreadBySeeker: rawChat.unreadBySeeker ?? 0,
      $createdAt: rawChat.$createdAt,
      $updatedAt: rawChat.$updatedAt,
    };

    // Step 2️⃣ Fetch all messages under this chat
    const msgRes = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.messagesCol,
      queries: [
        Query.equal('chats', chatId),
        Query.orderAsc('$createdAt'),
        Query.select(['$id', 'chats.$id', 'message', 'senderId', '$createdAt']),
      ],
    });

    // 🧩 Flatten and type the messages
    const messages: Message[] = (msgRes?.rows ?? []).map((msg) => ({
      $id: msg.$id,
      chats: msg.chats.$id,
      message: msg.message,
      senderId: msg.senderId,
      $createdAt: msg.$createdAt,
    }));

    return {
      chat,
      participants: chat.participants,
      messages,
    };
  } catch (error) {
    console.error('❌ Error fetching chat & messages:', error);
    throw error;
  }
};

export const uploadFile = async (fileUri: string): Promise<string> => {
  try {
    // Get the file's name
    const fileName = fileUri.split('/').pop() || `file-${Date.now()}`;

    // Fetch the file as a blob
    const response = await fetch(fileUri);
    if (!response.ok) {
      throw new Error('File does not exist or cannot be fetched');
    }
    const blob = await response.blob();

    // Create a new File instance
    const file = new File([blob], fileName);

    // Get the file's size
    const fileSize = file.size;

    // Determine the MIME type based on the file extension
    let fileType = 'application/octet-stream';
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg'))
      fileType = 'image/jpeg';
    else if (fileName.endsWith('.png')) fileType = 'image/png';
    else if (fileName.endsWith('.mp4')) fileType = 'video/mp4';
    else if (fileName.endsWith('.pdf')) fileType = 'application/pdf';

    // Upload the file to Appwrite
    const res = await storage.createFile({
      bucketId: appwriteConfig.boloBucketCol, // replace with your bucket ID
      fileId: ID.unique(), // generate unique ID
      file: {
        uri: fileUri,
        name: fileName,
        type: fileType,
        size: fileSize,
      },
    });

    return res.$id;
  } catch (error) {
    console.log('❌ Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    const res = await storage.deleteFile({
      bucketId: appwriteConfig.boloBucketCol,
      fileId: fileId,
    });
    return res;
  } catch (error) {
    console.log('❌ Error deleting avatar:', error);
    throw error;
  }
};
