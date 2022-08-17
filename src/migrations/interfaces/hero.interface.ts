export interface IHero {
  name: string;
  //Base stats
  hp: number;
  atk: number;
  def: number;
  spd: number;
  // Special stats
  crit_rate?: number;
  crit_dmg?: number;
  // L1
  atk_healing?: number;
  take_dmg_healing?: number;
  // L2
  dodge?: number;
  acc?: number;
  // L3
  cc?: number;

  intrinsic_status?: number;
  // action
  // attack: (targetEntity: IHero) => IHero[];
  // intrinsic_skill: (targetEntity: IHero) => void;
  effect_resistance?: number;
  status?: number;
  element?: string;
  position?: string;
  img?: string;
}
