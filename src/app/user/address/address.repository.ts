import { EntityRepository, Repository } from 'typeorm';
import AddressEntity from '../../../migrations/entities/address.entity';

@EntityRepository(AddressEntity)
export class AddressRepository extends Repository<AddressEntity> {}
