import { account, tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { currentUser, SignInPayload, SignUpPayload } from '@/types/userTypes';
import { ID, Query } from 'react-native-appwrite';
import { formatCameroonPhone } from './appwriteGenFunc';

export const createAccount = async (values: SignUpPayload) => {
  const { fullName, email, password, phoneNumber, role } = values;

  const name = fullName.toUpperCase();
  const formattedPhone = formatCameroonPhone(phoneNumber ?? '');

  try {
    const newAccount = await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });

    let existingSession = null;
    try {
      existingSession = await account.getSession({ sessionId: 'current' });
      await account.deleteSession({ sessionId: 'current' });
    } catch {
      // No active session found — safe to ignore
    }

    const tocken = await account.createEmailToken({
      userId: newAccount.$id,
      email,
    });

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
        subscription: null,
      },
    });

    let planId: string;
    let remainingJobs: number | null = null;
    let remainingApps: number | null = null;

    if (role === 'worker') {
      planId = appwriteConfig.workerFreePlan;
      remainingApps = 2;
      remainingJobs = null;
    } else if (role === 'recruiter') {
      planId = appwriteConfig.recruiterFreePlan;
      remainingJobs = 1;
      remainingApps = null;
    } else {
      throw new Error('Invalid role');
    }

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30);

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

    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: newUser.$id,
      data: { subscription: [subscription.$id] },
    });

    return { user: { ...newUser, newAccount }, userId: tocken.userId };
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
      throw new Error("Account doesn't exist. Please create an account");
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
// export const createAccount = async (values: SignUpPayload) => {
//   const { fullName, phoneNumber, location, role } = values;

//   console.log('Creating account for:', values);

//   const name = fullName.toUpperCase();
//   const formattedPhone = formatCameroonPhone(phoneNumber ?? '');

//   try {
//     const tocken = await account.createPhoneToken({
//       userId: ID.unique(),
//       phone: formattedPhone,
//     });

//     const newUser = await tables.createRow({
//       databaseId: appwriteConfig.dbId,
//       tableId: appwriteConfig.userCol,
//       rowId: ID.unique(),
//       data: {
//         name,
//         phoneNumber: formattedPhone,
//         locations: location,
//         role,
//         accountId: tocken.userId,
//         isVerified: false,
//         subscription: null,
//       },
//     });

//     let planId: string;
//     let remainingJobs: number | null = null;
//     let remainingApps: number | null = null;

//     if (role === 'worker') {
//       planId = appwriteConfig.workerFreePlan;
//       remainingApps = 2; // free worker can apply to 2 jobs
//       remainingJobs = null; // workers don't post jobs
//     } else if (role === 'recruiter') {
//       planId = appwriteConfig.recruiterFreePlan;
//       remainingJobs = 1; // starts with 0 credits
//       remainingApps = null; // recruiters don't apply
//     } else {
//       throw new Error('Invalid role');
//     }

//     const today = new Date();
//     const endDate = new Date();
//     endDate.setDate(today.getDate() + 30);

//     // 4️⃣ Create subscription row
//     const subscription = await tables.createRow({
//       databaseId: appwriteConfig.dbId,
//       tableId: appwriteConfig.subscriptionsCol,
//       rowId: ID.unique(),
//       data: {
//         users: newUser.$id,
//         plans: planId,
//         status: 'active',
//         startDate: today.toISOString(),
//         endDate: endDate.toISOString(),
//         remainingJobs,
//         remainingApps,
//         payments: null,
//       },
//     });

//     await tables.updateRow({
//       databaseId: appwriteConfig.dbId,
//       tableId: appwriteConfig.userCol,
//       rowId: newUser.$id,
//       data: { subscription: [subscription.$id] },
//     });

//     return { user: { ...newUser, tocken }, userId: tocken.userId };
//   } catch (error) {
//     console.error('Error creating account:', error);
//     throw error;
//   }
// }

export const sendOTP = async (email: string) => {
  try {
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
      throw new Error('No user found with this email. Please create account.');
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
        queries: [Query.equal('users', user.$id)],
      });

      if (workerData.rows.length > 0) {
        user = { ...user, workerProfile: workerData.rows[0] };
      }
    } else if (user.userRole === 'recruiter') {
      const recruiterData = await tables.listRows({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.recruiterCol,
        queries: [Query.equal('users', user.$id)],
      });

      if (recruiterData.rows.length > 0) {
        user = { ...user, recruiterProfile: recruiterData.rows[0] };
      }
    }

    return { user, session: currentSession, account: currentAccount };
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
