import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveRequisitionDto {
  @ApiProperty({
    description:
      'Comentarios opcionales de la Gerencia al aprobar la requisición (Nivel 2 - Aprobación Final). Se recomienda agregar observaciones si hay condiciones especiales.',
    example: 'Aprobado por gerencia, proceder con la compra',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Los comentarios deben ser texto' })
  comments?: string;
}

export class RejectRequisitionDto {
  @ApiProperty({
    description:
      'Comentarios OBLIGATORIOS de la Gerencia al rechazar la requisición (Nivel 2 - Aprobación Final). Debe explicar claramente el motivo del rechazo (ej: presupuesto insuficiente, no prioritario, materiales innecesarios, etc.)',
    example:
      'Presupuesto insuficiente para esta requisición en el trimestre actual. Solicitar nuevamente en Q2.',
    type: String,
    required: true,
  })
  @IsString({ message: 'Los comentarios deben ser texto' })
  @IsNotEmpty({ message: 'Los comentarios son obligatorios al rechazar' })
  comments: string;
}
