import { IsEnum, IsOptional } from 'class-validator';

export enum UserStatsRange {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class QueryUserStatsDto {
  @IsEnum(UserStatsRange)
  @IsOptional()
  period?: UserStatsRange = UserStatsRange.WEEK; // default: tuần
}
