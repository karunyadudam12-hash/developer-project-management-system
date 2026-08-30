import { ROLES, type Role } from './roles';

export function isAdmin(role: Role): boolean {
  return role === ROLES.ADMIN;
}

export function isManager(role: Role): boolean {
  return role === ROLES.MANAGER;
}

export function isStaff(role: Role): boolean {
  return role === ROLES.STAFF;
}

export function isAdminOrManager(role: Role): boolean {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
}