import { account, tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { SignInPayload, SignUpPayload } from '@/types/userTypes';
import { ID, Query } from 'react-native-appwrite';
import { formatCameroonPhone, formatName } from './appwriteGenFunc';

export const createAccount = async (values: SignUpPayload) => {
  const { fullName, email, password, phoneNumber, role, location, skills } =
    values;

  const name = formatName(fullName);
  const formattedPhone = formatCameroonPhone(phoneNumber ?? '');

  try {
    // 1️⃣ Create Appwrite account
    const newAccount = await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });

    await account.createEmailPasswordSession({ email, password });

    const newUser = await tables.createRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: ID.unique(),
      data: {
        name,
        phoneNumber: formattedPhone,
        email,
        role,
        accountId: newAccount.$id,
        isVerified: false,
        skills: [skills],
        locations: location,
        recruiters: null,
        workers: null,
      },
    });

    console.log('after user creation: ', newUser);

    if (role === 'recruiter') {
      const recruiterRow = await tables.createRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.recruiterCol,
        rowId: ID.unique(),
        data: { users: newUser.$id },
      });
      console.log('after recruiter creation: ', recruiterRow);
      await tables.updateRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.userCol,
        rowId: newUser.$id,
        data: { recruiters: recruiterRow.$id },
      });
      console.log('after user update: ');
    } else if (role === 'worker') {
      const workerRow = await tables.createRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.workerCol,
        rowId: ID.unique(),
        data: { users: newUser.$id },
      });
      console.log('after worker creation: ', workerRow);
      await tables.updateRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.userCol,
        rowId: newUser.$id,
        data: { workers: workerRow.$id },
      });
      console.log('after worker update: ');
    } else {
      throw new Error('Invalid role');
    }

    console.log('Reached before subscription creation');

    // 5️⃣ Setup subscription
    let planId: string;
    let remainingJobs: number | null = null;
    let remainingApps: number | null = null;

    if (role === 'worker') {
      planId = appwriteConfig.workerFreePlan;
      remainingApps = 2;
    } else {
      planId = appwriteConfig.recruiterFreePlan;
      remainingJobs = 1;
    }

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30);

    try {
      await tables.createRow({
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
      console.log('✅ Subscription row created successfully');
    } catch (subscriptionError) {
      console.log('Error creating subscription for user:', subscriptionError);
      throw subscriptionError;
    }

    const userId = await sendOTP(email);

    return { user: { ...newUser, newAccount }, userId };
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

export const SignInUser = async (values: SignInPayload) => {
  const { email, password } = values;

  try {
    // 1️⃣ Check if email exists in your user table userId
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      queries: [Query.equal('email', email)],
    });

    if (!res.total) {
      throw new Error('No account found. Please create an account');
    }

    // 2️⃣ Try to get an existing session
    let existingSession = null;
    try {
      existingSession = await account.getSession({ sessionId: 'current' });
    } catch {
      // No active session found — safe to ignore
    }

    // 3️⃣ If a session exists, check verification
    if (existingSession) {
      await account.deleteSession({ sessionId: 'current' });
      await account.createEmailPasswordSession({ email, password });
      const currentUser = await getCurrentUser();
      if (!currentUser.account.emailVerification) {
        const otpResponse = await sendOTP(email);
        return {
          userId: otpResponse,
          email,
          unverified: true,
        };
      }
      // ✅ Already verified → return user
      return currentUser;
    }

    // 4️⃣ No session → create a new one
    await account.createEmailPasswordSession({ email, password });

    // 5️⃣ Fetch the user again and check verification
    const currentUser = await getCurrentUser();
    if (!currentUser.account.emailVerification) {
      const otpResponse = await sendOTP(email);
      return {
        userId: otpResponse,
        email,
        unverified: true,
      };
    }

    // ✅ Verified user → return
    return currentUser;
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

export const updateUserDetails = async (
  userId: string,
  locations: string,
  skills: string,
) => {
  console.log('values: ', location, skills);
  try {
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: userId,
      data: { locations, skills: [skills] },
    });
    return { success: true };
  } catch (error: any) {
    const msg = error?.message || '';

    if (msg.includes('locations')) {
      throw new Error('Invalid location. Select a valid location');
    }

    if (msg.includes('skills')) {
      throw new Error('Invalid profession. Select a valid location');
    }

    console.error('Failed update user', error);

    throw new Error('Oops!. Failed to update user details');
  }
};

export const sendOTP = async (email: string) => {
  try {
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      queries: [Query.equal('email', email)],
    });
    if (!res.total) {
      console.log('No uer');
      throw new Error(
        'No account found with this email. Please create an account.',
      );
    }
    const token = await account.createEmailToken({
      userId: ID.unique(),
      email,
    });

    console.log('✅ OTP tocken sent:', email);

    const userId = token.userId;
    return userId;
  } catch (error) {
    console.log('❌ Failed to send OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

export const OtpVerification = async (
  userId: string,
  verificationCode: string,
) => {
  try {
    try {
      const existingSession = await account.getSession({
        sessionId: 'current',
      });
      if (existingSession) {
        await account.deleteSession({ sessionId: 'current' });
      }
    } catch {
      // ignore if no session
    }
    const session = await account.createSession({
      userId,
      secret: verificationCode,
    });
    return session;
  } catch (error) {
    console.error('Phone verification failed:', error);
    throw new Error('Invalid verification code');
  }
};

export const forgotPassword = async (email: string) => {
  console.log('forgot password');
  try {
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      queries: [Query.equal('email', email)],
    });

    if (!res.total) {
      console.log('No uer');
      throw new Error('No account found. Please create account.');
    }

    let existingSession = null;
    try {
      existingSession = await account.getSession({ sessionId: 'current' });
    } catch {
      // No active session found — safe to ignore
    }

    if (existingSession) await account.deleteSession({ sessionId: 'current' });

    const otpResponse = sendOTP(email);
    return otpResponse;
  } catch (error) {
    console.error('Email verification failed:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    // 1️⃣ Get base account and session
    const currentAccount = await account.get();
    const currentSession = await account.getSession({ sessionId: 'current' });

    if (!currentAccount || !currentSession) {
      throw new Error('account_or_session_missing');
    }

    // 2️⃣ Fetch user record from users table WITH expansions
    const userRes = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      queries: [
        Query.equal('accountId', currentAccount.$id),
        Query.select([
          '*', // all user fields
          'skills.*', // expand skills
          'locations.*', // expand locations
          'workers.*', // expand worker relation if exists
          'recruiters.*', // expand recruiter relation if exists
        ]),
      ],
    });

    if (!userRes || userRes.rows.length === 0) {
      throw new Error('user_not_found');
    }

    const baseUser = userRes.rows[0];
    let fullUser: any = { ...baseUser, accountId: baseUser.accountId };

    // 3️⃣ Flatten recruiter or worker if present
    if (baseUser.userRole === 'worker' && baseUser.worker) {
      fullUser = { ...baseUser, ...baseUser.worker };
      delete fullUser.worker;
    } else if (baseUser.userRole === 'recruiter' && baseUser.recruiter) {
      fullUser = { ...baseUser, ...baseUser.recruiter };
      delete fullUser.recruiter;
    }

    return { user: fullUser, session: currentSession, account: currentAccount };
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
