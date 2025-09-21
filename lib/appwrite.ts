import {
  Account,
  Client,
  Functions,
  Storage,
  TablesDB,
} from 'react-native-appwrite';
import { appwriteConfig } from './appwriteConfig';

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const account = new Account(client);
const tables = new TablesDB(client);
const storage = new Storage(client);
const functions = new Functions(client);

export { account, client, functions, storage, tables };
