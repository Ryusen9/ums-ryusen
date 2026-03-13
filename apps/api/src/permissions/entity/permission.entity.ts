import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from '../../roles/entity/roles.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  key!: string;

  @Column({ nullable: true })
  description!: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];
}
