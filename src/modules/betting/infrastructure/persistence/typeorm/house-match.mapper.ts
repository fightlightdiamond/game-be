import { HouseFighter } from '../../../domain/house-fighter';
import { HouseMatch, StoredResult } from '../../../domain/house-match';
import { columnToPhase, phaseToColumn } from './phase-column';

export type MatchRow = {
  id: number;
  hero_info: unknown;
  turns: unknown;
  start_time: string | null;
  turn_number: number;
  status: number;
  winner: number;
  loser: number;
};

export type MatchColumns = {
  heroInfo: string;
  turns: string;
  openedAt: string;
  turnNumber: number;
  status: number;
  winner: number;
  loser: number;
};

export function toMatchColumns(match: HouseMatch): MatchColumns {
  return {
    heroInfo: JSON.stringify(match.fighters),
    turns: JSON.stringify(match.storedTurns),
    openedAt: match.openedAt,
    turnNumber: match.storedTurnNumber,
    status: phaseToColumn(match.currentPhase),
    winner: match.storedWinnerId,
    loser: match.storedLoserId,
  };
}

export function rowToMatch(row: MatchRow): HouseMatch {
  const stored: StoredResult = {
    winnerId: Number(row.winner),
    loserId: Number(row.loser),
    turns: asArray(parseJson(row.turns)),
    turnNumber: Number(row.turn_number),
  };
  return HouseMatch.reconstitute(
    row.id,
    columnToPhase(Number(row.status)),
    asFighters(parseJson(row.hero_info)),
    stored,
    row.start_time ?? '',
  );
}

function parseJson(value: unknown): unknown {
  if (typeof value === 'string') {
    return JSON.parse(value);
  }
  return value;
}

function asArray(value: unknown): object[] {
  return Array.isArray(value) ? value : [];
}

function asFighters(value: unknown): HouseFighter[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((fighter) => ({
    id: Number(fighter.id),
    name: String(fighter.name),
    element: String(fighter.element),
    position: String(fighter.position),
  }));
}
