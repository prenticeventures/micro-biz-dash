import {
  CANVAS_HEIGHT,
  PLAYER_HEIGHT,
  PLAYER_SPAWN_MARGIN_X,
  PLAYER_WIDTH
} from '../constants';
import { EntityType } from '../types';
import { generateLevel } from './levelGenerator';

describe('generateLevel spawn safety', () => {
  it('creates a safe supported spawn point for every level', () => {
    for (let levelIndex = 1; levelIndex <= 5; levelIndex += 1) {
      const level = generateLevel(levelIndex);
      const platforms = level.entities.filter((entity) => entity.type === EntityType.PLATFORM);

      const supportingPlatform = platforms.find((platform) => (
        level.spawnPoint.y + PLAYER_HEIGHT === platform.pos.y &&
        level.spawnPoint.x >= platform.pos.x &&
        level.spawnPoint.x + PLAYER_WIDTH <= platform.pos.x + platform.size.width
      ));

      expect(level.spawnPoint.x).toBeGreaterThanOrEqual(PLAYER_SPAWN_MARGIN_X);
      expect(level.spawnPoint.y).toBeLessThan(CANVAS_HEIGHT);
      expect(supportingPlatform).toBeDefined();
    }
  });

  it('keeps the level 2 spawn clear of the opening floating-platform collision regression', () => {
    const level = generateLevel(2);
    const openingFloatingPlatform = level.entities.find((entity) => (
      entity.type === EntityType.PLATFORM &&
      entity.pos.y < CANVAS_HEIGHT - 40
    ));

    expect(openingFloatingPlatform).toBeDefined();
    expect(level.spawnPoint.x + PLAYER_WIDTH).toBeLessThanOrEqual(openingFloatingPlatform!.pos.x);
  });
});
