import { RoleEnum } from '../auth/role.enum';

export interface UserInterface {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  imagePath?: string;
  role?: RoleEnum;
}
