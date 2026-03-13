import { AppDataSource } from '../../database/data-source';
import { faker } from '@faker-js/faker';
import { Permission } from '../../permissions/entity/permission.entity';
import { Role } from '../../roles/entity/roles.entity';
import { Tenant } from '../../tenants/entity/tenants.entity';
import { User } from '../../users/entity/users.entity';

function fromEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : undefined;
}

const DEFAULT_TENANT = {
  id: fromEnv('SEED_DEFAULT_TENANT_ID'),
  name: fromEnv('SEED_DEFAULT_TENANT_NAME') ?? 'Default Tenant',
  slug: fromEnv('SEED_DEFAULT_TENANT_SLUG') ?? 'default',
  status: fromEnv('SEED_DEFAULT_TENANT_STATUS') ?? 'active',
};

const DEFAULT_PERMISSIONS = [
  {
    key: 'users.read',
    description: 'Read users',
  },
  {
    key: 'users.write',
    description: 'Create or update users',
  },
  {
    key: 'roles.read',
    description: 'Read roles',
  },
  {
    key: 'roles.write',
    description: 'Create or update roles',
  },
  {
    key: 'permissions.read',
    description: 'Read permissions',
  },
];

const DEFAULT_ROLE = {
  name: fromEnv('SEED_SUPER_ROLE_NAME') ?? 'Administrator',
  description: fromEnv('SEED_SUPER_ROLE_DESCRIPTION') ?? 'Full access role',
};

const DEFAULT_ADMIN = {
  email: fromEnv('SEED_SUPER_EMAIL') ?? faker.internet.email().toLowerCase(),
  firstName: fromEnv('SEED_SUPER_FIRST_NAME') ?? faker.person.firstName(),
  lastName: fromEnv('SEED_SUPER_LAST_NAME') ?? faker.person.lastName(),
  password: fromEnv('SEED_SUPER_PASSWORD') ?? faker.internet.password(),
  emailVerified: true,
};

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  try {
    await AppDataSource.transaction(async (manager) => {
      const tenantRepo = manager.getRepository(Tenant);
      const permissionRepo = manager.getRepository(Permission);
      const roleRepo = manager.getRepository(Role);
      const userRepo = manager.getRepository(User);

      let tenant = DEFAULT_TENANT.id
        ? await tenantRepo.findOne({
            where: { id: DEFAULT_TENANT.id },
          })
        : null;

      if (!tenant) {
        tenant = await tenantRepo.findOne({
          where: { slug: DEFAULT_TENANT.slug },
        });
      }

      if (!tenant) {
        tenant = tenantRepo.create({
          id: DEFAULT_TENANT.id,
          name: DEFAULT_TENANT.name,
          slug: DEFAULT_TENANT.slug,
          status: DEFAULT_TENANT.status,
        });
      } else {
        tenant.name = DEFAULT_TENANT.name;
        tenant.slug = DEFAULT_TENANT.slug;
        tenant.status = DEFAULT_TENANT.status;
      }

      tenant = await tenantRepo.save(tenant);

      await permissionRepo.upsert([...DEFAULT_PERMISSIONS], {
        conflictPaths: ['key'],
        skipUpdateIfNoValuesChanged: true,
      });

      const permissions = await permissionRepo.find({
        where: DEFAULT_PERMISSIONS.map((permission) => ({
          key: permission.key,
        })),
      });

      let role = await roleRepo.findOne({
        where: {
          name: DEFAULT_ROLE.name,
          tenant: { id: tenant.id },
        },
        relations: {
          tenant: true,
          permissions: true,
        },
      });

      if (!role) {
        role = roleRepo.create({
          ...DEFAULT_ROLE,
          tenant,
          permissions,
        });
      } else {
        role.description = DEFAULT_ROLE.description;
        role.permissions = permissions;
        role.tenant = tenant;
      }

      role = await roleRepo.save(role);

      let adminUser = await userRepo.findOne({
        where: { email: DEFAULT_ADMIN.email },
        relations: {
          tenant: true,
          roles: true,
        },
      });

      if (!adminUser) {
        adminUser = userRepo.create({
          ...DEFAULT_ADMIN,
          tenant,
          roles: [role],
        });
      } else {
        adminUser.firstName = DEFAULT_ADMIN.firstName;
        adminUser.lastName = DEFAULT_ADMIN.lastName;
        adminUser.password = DEFAULT_ADMIN.password;
        adminUser.emailVerified = DEFAULT_ADMIN.emailVerified;
        adminUser.tenant = tenant;
        adminUser.roles = [role];
      }

      adminUser = await userRepo.save(adminUser);

      console.log('Seed completed successfully');
      console.log(`Tenant: ${tenant.slug} (${tenant.id})`);
      console.log(`Role: ${role.name} (${role.id})`);
      console.log(`Super admin: ${adminUser.email} (${adminUser.id})`);
    });
  } finally {
    await AppDataSource.destroy();
  }
}

void seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
