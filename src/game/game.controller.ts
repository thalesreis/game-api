import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateGameDto } from './dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GameService } from './game.service';

@ApiTags('Games')
@Controller('games')
export class GameController {
  constructor(private service: GameService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiResponse({ status: 200 })
  getGames() {
    return this.service.getAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiResponse({ status: 200 })
  getGamesById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id/publisher')
  getGamePublisher(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPublisher(id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  createGame(@Body() gameDto: CreateGameDto) {
    return this.service.create(gameDto);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Ok' })
  @ApiResponse({ status: 404, description: 'Not found' })
  updateGame(
    @Param('id', ParseIntPipe) id: number,
    @Body() gameDto: UpdateGameDto,
  ) {
    return this.service.update(id, gameDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiResponse({ status: 404, description: 'Not found' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('trigger-update-process')
  triggerProcess() {
    this.service.triggerUpdateProcess();
  }
}
