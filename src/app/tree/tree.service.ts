import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { TreeRepository } from './tree.repository';

@Injectable()
/**
 * Tree Service
 */
export class TreeService {
  constructor(
    @InjectRepository(TreeRepository) private treeRepository: TreeRepository,
    private userService: UserService,
  ) {}

  /** Planting tree with 1% balance
   *
   * @param userId
   */
  async planting(userId: number) {
    const user = await this.userService.getById(userId);

    if (user.balance > 0) {
      await this.userService.updateUser(userId, {
        balance: user.balance - user.balance * 0.01,
      });

      const tree = await this.treeRepository.save({
        userId: userId,
        startTime: new Date(),
        status: 0,
        bandit: null,
        startingValue: user.balance * 0.01,
      });
      return tree;
    }
  }

  /** Rob tree
   *
   * @param treeId
   * @param bandit
   */
  async rob(treeId: number, bandit: number) {
    const banditUser = await this.userService.getById(bandit);

    await this.treeRepository.update(treeId, {
      endTime: new Date(),
      status: 1,
      bandit: banditUser.id,
    });
  }

  /** Finished Planting
   *
   * @param treeId
   * @param userId
   */
  async finishedPlanting(treeId: number, userId: number) {
    const tree = await this.treeRepository.findOne({ where: { id: treeId } });

    if (tree.userId !== userId) {
      throw new HttpException(`you don't own this tree`, HttpStatus.NOT_FOUND);
    }

    const startTime = new Date(tree.startTime);
    const endTime = new Date();
    const difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
    const resultInMinutes = Math.floor(difference / 60000 / 10);

    const treeUpdate = await this.treeRepository.update(treeId, {
      endTime: new Date(),
      status: 1,
    });

    const user = await this.userService.getById(userId);
    await this.userService.updateUser(userId, {
      balance: user.balance + resultInMinutes * tree.startingValue,
    });

    return treeUpdate;
  }
}
