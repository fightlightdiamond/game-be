import { ObjectType } from '@nestjs/graphql';
import { Entity } from 'typeorm';
import { MatchInterface } from '../interfaces/match.interface';
import { MatchEntity } from './match.entity';

@ObjectType()
@Entity('rob-matches')
export class RobMatchEntity extends MatchEntity implements MatchInterface {}
