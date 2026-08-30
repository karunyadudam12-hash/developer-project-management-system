import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  type Permission,
} from './permissions';

import type { Role } from './roles';

export function hasPermission(
  role: Role,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(
  role: Role,
  permissions: readonly Permission[]
): boolean {
  return permissions.some((permission) =>
    hasPermission(role, permission)
  );
}

export function hasAllPermissions(
  role: Role,
  permissions: readonly Permission[]
): boolean {
  return permissions.every((permission) =>
    hasPermission(role, permission)
  );
}