import { relations } from "drizzle-orm";
import { accountantClients } from "./accountant-clients";
import { employeeAvailability } from "./employee-availability";
import { employeeAvailabilityExceptions } from "./employee-availability-exceptions";
import { employeeIncompatibilities } from "./employee-incompatibilities";
import { employeeRoles } from "./employee-roles";
import { employeeTimeOff } from "./employee-time-off";
import { employees } from "./employees";
import { importJobs } from "./import-jobs";
import { invitations } from "./invitations";
import { locationRoleShiftTimes } from "./location-role-shift-times";
import { locations } from "./locations";
import { organizationSettings } from "./organization-settings";
import { organizations } from "./organizations";
import { roleShiftTimes } from "./role-shift-times";
import { roles } from "./roles";
import { schedules } from "./schedules";
import { shifts } from "./shifts";
import { shiftRequests } from "./shift-requests";
import { staffingRequirements } from "./staffing-requirements";
import { dailyStaffingOverrides } from "./daily-staffing-overrides";
import { usageTracking } from "./usage-tracking";
import { users } from "./users";

export { organizations } from "./organizations";
export { users, userRoles, type UserRole } from "./users";
export {
  importJobs,
  importJobStatuses,
} from "./import-jobs";
export { invitations, invitationStatuses, type InvitationStatus } from "./invitations";
export {
  accountantClients,
  accountantClientStatuses,
  type AccountantClientStatus,
} from "./accountant-clients";
export { locationRoleShiftTimes, LOCATION_DAY_ALL } from "./location-role-shift-times";
export { locations } from "./locations";
export { roleShiftTimes, DAY_ALL } from "./role-shift-times";
export { roles } from "./roles";
export {
  staffingRequirements,
  shiftPeriods,
  type ShiftPeriod,
} from "./staffing-requirements";
export { dailyStaffingOverrides } from "./daily-staffing-overrides";
export { organizationSettings } from "./organization-settings";
export { employees, contractTypes, type ContractType } from "./employees";
export { employeeRoles } from "./employee-roles";
export {
  employeeAvailability,
  availabilityStatuses,
  type AvailabilityStatus,
} from "./employee-availability";
export { employeeAvailabilityExceptions } from "./employee-availability-exceptions";
export { employeeIncompatibilities } from "./employee-incompatibilities";
export {
  employeeTimeOff,
  timeOffTypes,
  timeOffStatuses,
  type TimeOffType,
  type TimeOffStatus,
} from "./employee-time-off";
export {
  scheduleGenerationJobs,
  jobStatuses,
  type JobStatus,
} from "./schedule-generation-jobs";
export {
  notificationJobs,
  notificationJobStatuses,
  type NotificationJobStatus,
} from "./notification-jobs";
export {
  notifications,
  notificationChannels,
  notificationDeliveryStatuses,
  notificationEventTypes,
  type NotificationChannel,
  type NotificationDeliveryStatus,
  type NotificationEventType,
} from "./notifications";
export {
  reports,
  reportStatuses,
  type ReportStatus,
} from "./reports";
export {
  reportGenerationJobs,
  reportJobStatuses,
  type ReportJobStatus,
} from "./report-generation-jobs";
export { italianHolidays } from "./italian-holidays";
export {
  scheduleTemplates,
  type ScheduleTemplateWeekData,
} from "./schedule-templates";
export {
  schedules,
  scheduleStatuses,
  type ScheduleStatus,
} from "./schedules";
export { shifts, shiftStatuses, type ShiftStatus } from "./shifts";
export {
  shiftRequests,
  shiftRequestTypes,
  shiftRequestStatuses,
  type ShiftRequestType,
  type ShiftRequestStatus,
} from "./shift-requests";
export { usageTracking } from "./usage-tracking";

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  invitations: many(invitations),
  accountantClients: many(accountantClients),
  locations: many(locations),
  roles: many(roles),
  organizationSettings: many(organizationSettings),
  employees: many(employees),
  employeeIncompatibilities: many(employeeIncompatibilities),
  usageTracking: many(usageTracking),
  importJobs: many(importJobs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations),
  invitationsSent: many(invitations),
  accountantClients: many(accountantClients),
  employees: many(employees),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations),
  invitedByUser: one(users),
}));

export const accountantClientsRelations = relations(
  accountantClients,
  ({ one }) => ({
    accountantUser: one(users),
    organization: one(organizations),
  })
);

export const locationsRelations = relations(locations, ({ one, many }) => ({
  organization: one(organizations),
  staffingRequirements: many(staffingRequirements),
  dailyStaffingOverrides: many(dailyStaffingOverrides),
  employees: many(employees),
  locationRoleShiftTimes: many(locationRoleShiftTimes),
}));

export const locationRoleShiftTimesRelations = relations(
  locationRoleShiftTimes,
  ({ one }) => ({
    location: one(locations),
    role: one(roles),
  })
);

export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations),
  staffingRequirements: many(staffingRequirements),
  dailyStaffingOverrides: many(dailyStaffingOverrides),
  employeeRoles: many(employeeRoles),
  roleShiftTimes: many(roleShiftTimes),
  locationRoleShiftTimes: many(locationRoleShiftTimes),
}));

export const roleShiftTimesRelations = relations(roleShiftTimes, ({ one }) => ({
  role: one(roles),
}));

export const staffingRequirementsRelations = relations(
  staffingRequirements,
  ({ one }) => ({
    location: one(locations),
    role: one(roles),
  })
);

export const dailyStaffingOverridesRelations = relations(
  dailyStaffingOverrides,
  ({ one }) => ({
    location: one(locations),
    role: one(roles),
  })
);

export const organizationSettingsRelations = relations(
  organizationSettings,
  ({ one }) => ({
    organization: one(organizations),
  })
);

export const employeesRelations = relations(employees, ({ one, many }) => ({
  organization: one(organizations),
  user: one(users),
  preferredLocation: one(locations),
  employeeRoles: many(employeeRoles),
  availability: many(employeeAvailability),
  availabilityExceptions: many(employeeAvailabilityExceptions),
  timeOff: many(employeeTimeOff),
}));

export const employeeRolesRelations = relations(employeeRoles, ({ one }) => ({
  employee: one(employees),
  role: one(roles),
}));

export const employeeAvailabilityRelations = relations(
  employeeAvailability,
  ({ one }) => ({
    employee: one(employees),
  })
);

export const employeeAvailabilityExceptionsRelations = relations(
  employeeAvailabilityExceptions,
  ({ one }) => ({
    employee: one(employees),
  })
);

export const employeeTimeOffRelations = relations(employeeTimeOff, ({ one }) => ({
  employee: one(employees),
  approvedByUser: one(users),
}));

export const employeeIncompatibilitiesRelations = relations(
  employeeIncompatibilities,
  ({ one }) => ({
    organization: one(organizations),
    employeeA: one(employees),
    employeeB: one(employees),
  })
);

export const schedulesRelations = relations(schedules, ({ one, many }) => ({
  organization: one(organizations),
  publishedByUser: one(users),
  shifts: many(shifts),
}));

export const shiftsRelations = relations(shifts, ({ one }) => ({
  schedule: one(schedules),
  organization: one(organizations),
  location: one(locations),
  employee: one(employees),
  role: one(roles),
}));

export const shiftRequestsRelations = relations(shiftRequests, ({ one }) => ({
  organization: one(organizations),
  employee: one(employees),
  shift: one(shifts),
  swapWithEmployee: one(employees),
  reviewedByUser: one(users),
}));

export const usageTrackingRelations = relations(usageTracking, ({ one }) => ({
  organization: one(organizations),
}));

export const importJobsRelations = relations(importJobs, ({ one }) => ({
  organization: one(organizations),
}));
