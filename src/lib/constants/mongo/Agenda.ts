import { IJobParameters } from '@hokify/agenda'
import { Filter } from 'mongodb'

type DBQuery = Filter<IJobParameters<unknown>>

/**
 * Creates a query to get all active reminders created by a user with the given `userId`. These
 * are reminders that meet the following criteria:
 *
 * - The reminder is of type `normal` (a one-time reminder) and has never been run.
 * - The reminder is of type `single` (a recurring reminder) and is still running on a schedule.
 *
 * @param userId The Discord User ID of the user who created the reminders.
 *
 * @returns A MongoDB query.
 */
export function getUserActiveRemindersQuery(userId: string): DBQuery {
  /** A MongoDB query that gets all active reminders, one-time or recurring. */
  const ActiveJobsQuery: DBQuery = getAllActiveRemindersQuery()

  /** A MongoDB query that gets all reminders created by the user with the given `userId`. */
  const CurrentUserQuery: DBQuery = { 'data.userId': userId }

  return { $and: [ActiveJobsQuery, CurrentUserQuery] }
}

/**
 * Creates a query to get all active reminders for all users. These are reminders that meet the
 * following criteria:
 *
 * - The reminder is of type `normal` (a one-time reminder) and has never been run.
 * - The reminder is of type `single` (a recurring reminder) and is still running on a schedule.
 *
 * @returns A MongoDB query.
 */
export function getAllActiveRemindersQuery(): DBQuery {
  /** A MongoDB query that gets all reminders that are of type `normal` and have never been run. */
  const OneTimeJobsQuery: DBQuery = {
    $and: [{ type: 'normal' }, { lastRunAt: { $exists: false } }],
  }

  /** A MongoDB query that gets all recurring reminders. */
  const RecurringJobsQuery: DBQuery = { type: 'single' }

  /** A MongoDB query that gets all active reminders, one-time or recurring. */
  const ActiveJobsQuery: DBQuery = {
    $or: [OneTimeJobsQuery, RecurringJobsQuery],
  }

  return ActiveJobsQuery
}

export enum JobNames {
  RecurringReminder = 'recurring-reminder',
  ScheduledReminder = 'scheduled-message',
}
