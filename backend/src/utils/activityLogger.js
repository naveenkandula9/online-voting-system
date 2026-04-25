import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({ action, actor = null, actorRole = 'system', details = {}, req = null }) => {
  try {
    await ActivityLog.create({
      action,
      actor,
      actorRole,
      details,
      ipAddress: req?.ip || '',
    });
  } catch (error) {
    console.error('Activity log failed:', error.message);
  }
};
