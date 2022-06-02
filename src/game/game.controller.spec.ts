import { mock } from 'ts-mockito';
import { GameController } from './game.controller';
import { GameService } from './game.service';

describe('GameController', () => {
  let controller: GameController;
  const service: GameService = mock(GameService);

  beforeEach(async () => {
    controller = new GameController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
