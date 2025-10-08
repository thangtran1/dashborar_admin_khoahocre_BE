import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Teacher, TeacherSchema } from '../teachers/schemas/teacher.schema';
import {
  Category,
  CategorySchema,
} from '../categories/schemas/category.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [SeederController],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
