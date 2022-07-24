import { EntitySchema } from 'typeorm';
import { HeroEntity } from './hero.entity';

export const HeroSchema = new EntitySchema<HeroEntity>({
  name: 'Hero',
  target: HeroEntity,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
    },
    //Base stats
    hp: {
      type: String,
    },
    atk: {
      type: String,
    },
    def: {
      type: String,
    },
    spd: {
      type: String,
    },
    // Special stats
    crit_rate: {
      type: String,
    },
    crit_dmg: {
      type: String,
    },
    // L1
    atk_healing: {
      type: String,
    },
    take_dmg_healing: {
      type: String,
    },
    // L2
    dodge: {
      type: String,
    },
    acc: {
      type: String,
    },
    // L3
    cc: {
      type: String,
    },
    //Base stats
    current_hp: {
      type: Number,
    },
    current_atk: {
      type: String,
    },
    current_def: {
      type: String,
    },
    current_spd: {
      type: String,
    },
    // Special stats
    current_crit_rate: {
      type: String,
    },
    current_crit_dmg: {
      type: String,
    },
    // L1
    current_atk_healing: {
      type: String,
    },
    current_take_dmg_healing: {
      type: String,
    },
    // L2
    current_dodge: {
      type: String,
    },
    current_acc: {
      type: String,
    },
    // L3
    current_cc: {
      type: String,
    },
    intrinsic_status: {
      type: String,
    },
    effect_resistance: {
      type: String,
    },
    status: {
      type: String,
    },
    element: {
      type: String,
    },
    position: {
      type: String,
    },
  },
});
