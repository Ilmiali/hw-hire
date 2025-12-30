export interface OrgMembership {
  id: string; // Document ID (orgId)
  name: string;
  role: string;
  joinedAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber: string;
  accountId: string;
  accounts: string[];
  orgMemberships: OrgMembership[];
}
