import { ObjectType } from '@nestjs/graphql';
import { Entity } from 'typeorm';
import { MatchInterface } from '../interfaces/match.interface';
import { MatchEntity } from './match.entity';

@ObjectType()
@Entity('elo-matches')
export class EloMatchEntity extends MatchEntity implements MatchInterface {}
