import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Teacher, TeacherDocument } from './schemas/teacher.schema';

export interface CreateTeacherDto {
  name: string;
  avatar?: string;
  bio?: string;
}

export interface UpdateTeacherDto {
  name?: string;
  avatar?: string;
  bio?: string;
}

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const existingTeacher = await this.teacherModel
      .findOne({
        name: createTeacherDto.name,
      })
      .exec();

    if (existingTeacher) {
      throw new ConflictException('Tên giảng viên đã tồn tại');
    }

    const teacher = new this.teacherModel(createTeacherDto);
    return teacher.save();
  }

  async findAll(): Promise<Teacher[]> {
    return this.teacherModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Teacher> {
    const teacher = await this.teacherModel.findById(id).exec();

    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giảng viên');
    }

    return teacher;
  }

  async update(
    id: string,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    if (updateTeacherDto.name) {
      const existingTeacher = await this.teacherModel
        .findOne({
          name: updateTeacherDto.name,
          _id: { $ne: id },
        })
        .exec();

      if (existingTeacher) {
        throw new ConflictException('Tên giảng viên đã tồn tại');
      }
    }

    const teacher = await this.teacherModel
      .findByIdAndUpdate(id, updateTeacherDto, { new: true })
      .exec();

    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giảng viên');
    }

    return teacher;
  }

  async remove(id: string): Promise<void> {
    const result = await this.teacherModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Không tìm thấy giảng viên');
    }
  }
}
