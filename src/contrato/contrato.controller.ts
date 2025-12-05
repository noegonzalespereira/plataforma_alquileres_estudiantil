import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContratoService } from './contrato.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';

@Controller('contrato')
export class ContratoController {
  constructor(private readonly contratoService: ContratoService) {}

  @Post()
  create(@Body() createContratoDto: CreateContratoDto) {
    return this.contratoService.create(createContratoDto);
  }

  @Get()
  findAll() {
    return this.contratoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contratoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContratoDto: UpdateContratoDto) {
    return this.contratoService.update(+id, updateContratoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contratoService.remove(+id);
  }
}
