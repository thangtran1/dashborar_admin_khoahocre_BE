import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import {
  Category,
  CategoryDocument,
} from '../categories/schemas/category.schema';
import { Teacher, TeacherDocument } from '../teachers/schemas/teacher.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { GetCoursesDto } from './dto/get-courses.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    // Check if slug already exists
    const existingCourse = await this.courseModel
      .findOne({
        slug: createCourseDto.slug,
      })
      .exec();

    if (existingCourse) {
      throw new BadRequestException('Slug đã tồn tại, hãy dùng slug khác.');
    }

    // Validate categories
    if (createCourseDto.categories && createCourseDto.categories.length > 0) {
      const validCategories = await this.categoryModel
        .find({
          code: { $in: createCourseDto.categories },
        })
        .exec();

      const validCodes = validCategories.map((cat) => cat.code);
      const invalidCodes = createCourseDto.categories.filter(
        (code) => !validCodes.includes(code),
      );

      if (invalidCodes.length > 0) {
        throw new BadRequestException(
          `Một số danh mục khóa học không tồn tại trong hệ thống: ${invalidCodes.join(', ')}`,
        );
      }
    }

    // Validate teachers
    if (createCourseDto.teacherIds && createCourseDto.teacherIds.length > 0) {
      const validTeachers = await this.teacherModel
        .find({
          _id: { $in: createCourseDto.teacherIds },
        })
        .exec();

      const validIds = validTeachers.map((teacher) =>
        (teacher._id as any).toString(),
      );
      const invalidIds = createCourseDto.teacherIds.filter(
        (id) => !validIds.includes(id),
      );

      if (invalidIds.length > 0) {
        throw new BadRequestException(
          `Một số giáo viên không tồn tại trong hệ thống: ${invalidIds.join(', ')}`,
        );
      }
    }

    const course = new this.courseModel({
      ...createCourseDto,
      categoryCodes: createCourseDto.categories || [],
      teacherIds: createCourseDto.teacherIds || [],
    });

    return course.save();
  }

  async findAll(getCoursesDto: GetCoursesDto) {
    const { page = 1, limit = 12, category, search } = getCoursesDto;
    const pageNumber = Math.max(page, 1);
    const pageSize = Math.min(Math.max(limit, 1), 100);

    const filter: any = { isActive: true };

    // Category filter
    if (category) {
      const categories = category.split(',').map((c) => c.trim());
      filter.categoryCodes = { $in: categories };
    }

    // Search filter
    if (search && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: { $regex: searchRegex } },
        { subtitle: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    const total = await this.courseModel.countDocuments(filter);
    const courses = await this.courseModel
      .find(filter)
      .select(
        'title subtitle slug price oldPrice discountCode image isFree level updatedAt categoryCodes',
      )
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const data = courses.map((course) => ({
      id: (course._id as any).toString(),
      slug: course.slug,
      title: course.title,
      subTitle: course.subtitle,
      price: course.price,
      oldPrice: course.oldPrice,
      discountCode: course.discountCode,
      thumbnail: course.image,
      isFree: course.isFree,
      level: course.level,
      updatedAt: course.updatedAt,
      categories: course.categoryCodes,
    }));

    return {
      success: true,
      message: 'Lấy danh sách thành công',
      data,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findBySlug(slug: string) {
    const course = await this.courseModel.findOne({ slug }).exec();

    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học.');
    }

    // Get related data
    const [categories, teachers] = await Promise.all([
      this.categoryModel.find({ code: { $in: course.categoryCodes } }).exec(),
      this.teacherModel.find({ _id: { $in: course.teacherIds } }).exec(),
    ]);

    const data = {
      id: (course._id as any).toString(),
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      price: course.price,
      oldPrice: course.oldPrice,
      discountCode: course.discountCode,
      image: course.image,
      isFree: course.isFree,
      isActive: course.isActive,
      isFeatured: course.isFeatured,
      level: course.level,
      viewCount: course.viewCount,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      introduce: course.introduce,
      contents: course.contents,
      categories: categories.map((cat) => ({
        code: cat.code,
        name: cat.name,
      })),
      teachers: teachers,
    };

    return { data };
  }

  async updateBySlug(slug: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.courseModel.findOne({ slug }).exec();

    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại.');
    }

    // Validate categories if provided
    if (updateCourseDto.categories && updateCourseDto.categories.length > 0) {
      const validCategories = await this.categoryModel
        .find({
          code: { $in: updateCourseDto.categories },
        })
        .exec();

      const validCodes = validCategories.map((cat) => cat.code);
      const invalidCodes = updateCourseDto.categories.filter(
        (code) => !validCodes.includes(code),
      );

      if (invalidCodes.length > 0) {
        throw new BadRequestException(
          `Một số danh mục khóa học không tồn tại trong hệ thống: ${invalidCodes.join(', ')}`,
        );
      }
    }

    // Validate teachers if provided
    if (updateCourseDto.teacherIds && updateCourseDto.teacherIds.length > 0) {
      const validTeachers = await this.teacherModel
        .find({
          _id: { $in: updateCourseDto.teacherIds },
        })
        .exec();

      const validIds = validTeachers.map((teacher) =>
        (teacher._id as any).toString(),
      );
      const invalidIds = updateCourseDto.teacherIds.filter(
        (id) => !validIds.includes(id),
      );

      if (invalidIds.length > 0) {
        throw new BadRequestException(
          `Một số giáo viên không tồn tại trong hệ thống: ${invalidIds.join(', ')}`,
        );
      }
    }

    const updateData: any = { ...updateCourseDto };

    if (updateCourseDto.categories) {
      updateData.categoryCodes = updateCourseDto.categories;
    }

    if (updateCourseDto.teacherIds) {
      updateData.teacherIds = updateCourseDto.teacherIds;
    }

    const updatedCourse = await this.courseModel
      .findOneAndUpdate({ slug }, updateData, { new: true })
      .exec();

    return {
      message: 'Cập nhật khóa học thành công.',
      course: updatedCourse,
    };
  }

  async deleteBySlug(slug: string) {
    const course = await this.courseModel.findOne({ slug }).exec();

    if (!course) {
      throw new NotFoundException('Khóa học không tồn tại');
    }

    await this.courseModel.findByIdAndDelete(course._id).exec();

    return {
      success: true,
      message: 'Xóa khóa học thành công',
    };
  }
}
