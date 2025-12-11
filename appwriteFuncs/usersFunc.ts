import { account, tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { SignInPayload, SignUpPayload } from '@/types/userTypes';
import { ID, Query } from 'react-native-appwrite';
import {
  deleteFile,
  formatCameroonPhone,
  formatName,
  uploadFile,
} from './appwriteGenFunc';

export const createAccount = async (values: SignUpPayload) => {
  const { fullName, email, password, phoneNumber, role, location, skills } =
    values;

  const name = formatName(fullName);
  const formattedPhone = formatCameroonPhone(phoneNumber ?? '');

  try {
    // 1️⃣ Create Appwrite account and session
    const newAccount = await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });

    await account.createEmailPasswordSession({ email, password });

    const signupDate = new Date(newAccount.$createdAt);
    const firstJan = new Date(signupDate.getFullYear(), 0, 1);

    // Calculate the number of days since Jan 1
    const numberOfDays = Math.floor(
      (signupDate.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000),
    );

    // Compute cohortWeek consistently (ignoring getDay shift)
    const cohortWeek = Math.ceil((numberOfDays + 1) / 7);

    console.log('✅ cohortWeek:', cohortWeek);

    // 2️⃣ Create user record
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
        skills,
        locations: location,
        recruiters: null,
        workers: null,
        cohortWeek,
      },
    });

    // 3️⃣ Handle based on role
    if (role === 'worker') {
      // Fetch skill record before updating count
      const skillRecord = await tables.getRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.skillsCol,
        rowId: skills,
      });

      const currentCount = skillRecord?.count ?? 0;

      // Create worker row, update skill, and create subscription in parallel
      const workerRowPromise = tables.createRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.workerCol,
        rowId: ID.unique(),
        data: { users: newUser.$id },
      });

      const updateSkillPromise = tables.updateRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.skillsCol,
        rowId: skills,
        data: { count: currentCount + 1 },
      });

      // Run parallel tasks
      const [workerRow] = await Promise.all([
        workerRowPromise,
        updateSkillPromise,
      ]);

      // Link worker row to user
      await tables.updateRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.userCol,
        rowId: newUser.$id,
        data: { workers: workerRow.$id },
      });
    } else if (role === 'recruiter') {
      const recruiterRow = await tables.createRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.recruiterCol,
        rowId: ID.unique(),
        data: { users: newUser.$id },
      });

      await tables.updateRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.userCol,
        rowId: newUser.$id,
        data: { recruiters: recruiterRow.$id },
      });
    } else {
      throw new Error('Invalid role');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error creating account:', error);
    throw error;
  }
};

export const SignInUser = async (values: SignInPayload) => {
  const { email, password } = values;

  try {
    // 1️⃣ Check if account exists in your custom user table
    const res = await tables.listRows({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      queries: [Query.equal('email', email)],
    });

    if (!res.total) {
      throw new Error('No account found. Please create a Bolo account');
    }

    // 2️⃣ Always clear current session if it exists
    try {
      await account.deleteSession({ sessionId: 'current' });
    } catch {
      // No active session found → safe to ignore
    }

    // 3️⃣ Create a new session
    await account.createEmailPasswordSession({ email, password });

    return { success: true };
  } catch (error) {
    console.error('❌ SignIn error:', error);
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

export const updateUserAvatar = async (
  fileUri: string,
  userId: string,
): Promise<string> => {
  try {
    const res = await tables.getRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: userId,
      queries: [Query.select(['$id', 'avatar'])],
    });

    const previousAvatarId = res?.avatar || null;
    if (previousAvatarId) {
      // Delete previous avatar
      await deleteFile(previousAvatarId);
    }
    // Upload new avatar
    const newAvatarId = await uploadFile(fileUri);
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: userId,
      data: { avatar: newAvatarId },
    });
    return newAvatarId;
  } catch (error) {
    console.error('❌ Error updating user avatar:', error);
    throw error;
  }
};

export const removeAvatar = async (userId: string) => {
  try {
    const res = await tables.getRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: userId,
      queries: [Query.select(['$id', 'avatar'])],
    });

    const previousAvatarId = res?.avatar || null;
    if (previousAvatarId) {
      // Delete previous avatar
      await deleteFile(previousAvatarId);
    }
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: userId,
      data: { avatar: null },
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating user avatar:', error);
    throw error;
  }
};

export const updateUserName = async (userId: string, name: string) => {
  try {
    await account.updateName({
      name,
    });

    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: userId,
      data: { name },
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating user name:', error);
    throw error;
  }
};
export const updateUserSkills = async (
  userId: string,
  workerId: string,
  skills: string,
  otherSkill: string,
) => {
  try {
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: userId,
      data: { skills },
    });
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.workerCol,
      rowId: workerId,
      data: { otherSkill },
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating user name:', error);
    throw error;
  }
};

export const updateUserLocation = async (
  userId: string,
  locations: string,
  otherLocation: string,
) => {
  try {
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: userId,
      data: { locations, otherLocation },
    });
  } catch (error) {
    console.error('❌ Error updating user location:', error);
    throw error;
  }
};

export const updateUserBio = async (userId: string, bio: string) => {
  try {
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: userId,
      data: { bio },
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating user bio:', error);
    throw error;
  }
};
export const updateUserPhone = async (userId: string, phoneNumber: string) => {
  try {
    await tables.updateRow({
      databaseId: appwriteConfig.dbId,
      tableId: appwriteConfig.userCol,
      rowId: userId,
      data: { phoneNumber },
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating user bio:', error);
    throw error;
  }
};

export const passwordRecovery = async (email: string) => {
  try {
    await account.createRecovery({
      email,
      url: 'https://bolode247-dotcom.github.io/app-recovery/',
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating user password:', error);
    throw error;
  }
};

export const updatePassword = async (password: string, oldPassword: string) => {
  try {
    await account.updatePassword({ password, oldPassword });
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error updating user password:', error);
    const msg = (error?.message ?? '').toString();
    if (msg.toLowerCase().includes('invalid')) {
      throw new Error('Invalid old password');
    } else {
      throw error;
    }
  }
};

export const logoutUser = async () => {
  try {
    await account.deleteSession({ sessionId: 'current' });
  } catch (error) {
    throw error;
  }
};
