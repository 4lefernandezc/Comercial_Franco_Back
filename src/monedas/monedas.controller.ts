import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ConvertMonedaDto, ConvertMonedaResponseDto } from './dto/convert-moneda.dto';
import { ApiBearerAuth, ApiTags, ApiParam } from '@nestjs/swagger';
import { Moneda } from './entities/moneda.entity';
import { MonedasService } from './monedas.service';
import { QueryMonedaDto } from './dto/query-moneda.dto';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Monedas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monedas')
export class MonedasController {
  constructor(private readonly monedasService: MonedasService) {}

  @Post()
  create(@Body() createMonedaDto: CreateMonedaDto) {
    return this.monedasService.create(createMonedaDto);
  }

  @Get()
  findAll(@Query() query: QueryMonedaDto) {
    return this.monedasService.findAll(query);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID de la moneda',
    type: Number,
  })
  findOne(@Param('id') id: string) {
    return this.monedasService.findOne(+id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    description: 'ID de la moneda a actualizar',
    type: Number,
  })
  update(@Param('id') id: string, @Body() updateMonedaDto: UpdateMonedaDto) {
    return this.monedasService.update(+id, updateMonedaDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'ID de la moneda a eliminar',
    type: Number,
  })
  remove(@Param('id') id: string) {
    return this.monedasService.remove(+id);
  }

  @Post('convertir')
  async convertirMoneda(
    @Body() convertData: ConvertMonedaDto,
  ): Promise<ConvertMonedaResponseDto> {
    return this.monedasService.convertirMoneda(convertData);
  }
}
