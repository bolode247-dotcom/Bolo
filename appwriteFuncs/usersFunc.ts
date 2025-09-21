import { account, tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { currentUser, SignUpPayload } from '@/types/userTypes';
import { ID, Query } from 'react-native-appwrite';

export const createAccount = async (values: SignUpPayload) => {
  const { email, password, fullName, phoneNumber, location, role } = values;

  console.log('Creating account for:', values);

  const name = fullName.toUpperCase();

  try {
    const newAccount = await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });

    // 2️⃣ Create user row
    const newUser = await tables.createRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: ID.unique(),
      data: {
        name,
        phoneNumber,
        locations: location,
        role,
        accountId: newAccount.$id,
        isVerified: false,
        subscription: null,
      },
    });

    // 3️⃣ Determine plan based on role
    let planId: string;
    let remainingJobs: number | null = null;
    let remainingApps: number | null = null;

    if (role === 'worker') {
      planId = appwriteConfig.workerFreePlan;
      remainingApps = 2; // free worker can apply to 2 jobs
      remainingJobs = null; // workers don't post jobs
    } else if (role === 'recruiter') {
      planId = appwriteConfig.recruiterFreePlan;
      remainingJobs = 1; // starts with 0 credits
      remainingApps = null; // recruiters don't apply
    } else {
      throw new Error('Invalid role');
    }

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30); // 30-day default duration

    // 4️⃣ Create subscription row
    const subscription = await tables.createRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.subscriptionsCol,
      rowId: ID.unique(),
      data: {
        users: newUser.$id,
        plans: planId,
        status: 'active',
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
        remainingJobs,
        remainingApps,
        payments: null,
      },
    });

    // 5️⃣ Update user row to link subscription
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: newUser.$id,
      data: { subscription: [subscription.$id] },
    });

    return { newAccount, newUser, subscription };
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    // Get base account and session
    const currentAccount = await account.get();
    const currentSession = await account.getSession({ sessionId: 'current' });

    if (!currentAccount || !currentSession) {
      throw new Error('account_or_session_missing');
    }

    // Fetch the user record by accountId
    const currentUserData = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      queries: [Query.equal('accountId', currentAccount.$id)],
    });

    if (!currentUserData || currentUserData.rows.length === 0) {
      throw new Error('user_not_found');
    }

    const row = currentUserData.rows[0];
    let user: currentUser = {
      accountId: row.accountId,
      userRole: row.role as 'worker' | 'recruiter',
      ...row,
    };

    if (user.userRole === 'worker') {
      const workerData = await tables.listRows({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.workerCol,
        queries: [Query.equal('userId', user.$id)],
      });

      if (workerData.rows.length > 0) {
        user = { ...user, workerProfile: workerData.rows[0] };
      }
    } else if (user.userRole === 'recruiter') {
      const recruiterData = await tables.listRows({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.recruiterCol,
        queries: [Query.equal('userId', user.$id)],
      });

      if (recruiterData.rows.length > 0) {
        user = { ...user, recruiterProfile: recruiterData.rows[0] };
      }
    }

    return { user, session: currentSession };
  } catch (error: any) {
    if (
      error?.message?.includes('role: guests') ||
      error?.message?.includes('missing scope (account)')
    ) {
      throw new Error('invalid_session');
    }
    throw error;
  }
};
