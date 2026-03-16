export class AuthUserResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  emailVerified!: boolean;
  tenantId?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
