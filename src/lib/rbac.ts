import { Role } from "@prisma/client";

// Role hierarchy — higher index = more permissions
const ROLE_HIERARCHY: Role[] = [
    Role.MEMBER,
    Role.TRAINER,
    Role.MANAGER,
    Role.ADMIN,
    Role.SUPER_ADMIN,
];

export function hasRole(userRole: Role, requiredRole: Role): boolean {
    return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(requiredRole);
}

// Roles that can invite other users
export const CAN_INVITE: Role[] = [Role.ADMIN, Role.SUPER_ADMIN];

// Roles an ADMIN can assign (can't create SUPER_ADMIN)
export const ASSIGNABLE_ROLES: Role[] = [
    Role.MEMBER,
    Role.TRAINER,
    Role.MANAGER,
    Role.ADMIN,
];
