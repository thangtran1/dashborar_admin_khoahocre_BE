import { PartialType } from '@nestjs/mapped-types';
import { CreateMaintenanceDto } from './create-maintenance.dto';

export class UpdateMaintenanceDto extends PartialType(CreateMaintenanceDto) {}
