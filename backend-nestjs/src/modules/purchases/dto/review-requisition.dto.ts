import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewRequisitionDto {
  @ApiProperty({
    description:
      'Decisión del Director sobre la requisición (Nivel 1 - Revisión)\n\n' +
      '**Opciones:**\n' +
      '- **approve**: Aprobar la requisición (pasa a Gerencia para aprobación final)\n' +
      '- **reject**: Rechazar la requisición (vuelve al creador con comentarios)',
    enum: ['approve', 'reject'],
    example: 'approve',
    type: String,
    required: true,
  })
  @IsIn(['approve', 'reject'], {
    message: 'La decisión debe ser "approve" o "reject"',
  })
  decision: 'approve' | 'reject';

  @ApiProperty({
    description:
      'Comentarios del Director sobre la revisión. Opcional al aprobar, recomendado al rechazar para justificar la decisión.',
    example: 'Requisición aprobada, materiales necesarios para el proyecto',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Los comentarios deben ser texto' })
  comments?: string;
}
