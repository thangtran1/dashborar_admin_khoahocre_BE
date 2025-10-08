import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Teacher, TeacherDocument } from '../teachers/schemas/teacher.schema';
import {
  Category,
  CategoryDocument,
} from '../categories/schemas/category.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  async seedAll(): Promise<void> {
    try {
      this.logger.log('Bắt đầu seed dữ liệu...');

      await this.seedUsers();
      await this.seedTeachers();
      await this.seedCategories();
      await this.seedCourses();

      this.logger.log('Hoàn thành seed dữ liệu!');
    } catch (error) {
      this.logger.error('Lỗi khi seed dữ liệu:', error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      this.logger.log('Bắt đầu xóa dữ liệu...');

      await this.userModel.deleteMany({});
      await this.teacherModel.deleteMany({});
      await this.categoryModel.deleteMany({});
      await this.courseModel.deleteMany({});

      this.logger.log('Hoàn thành xóa dữ liệu!');
    } catch (error) {
      this.logger.error('Lỗi khi xóa dữ liệu:', error);
      throw error;
    }
  }

  private async seedUsers(): Promise<void> {
    const hashedPassword = await bcrypt.hash('123123', 10);

    const users = [
      {
        email: 'thangtrandz04@gmail.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'admin',
      },
      {
        email: 'user1@khoahocre.com',
        name: 'Nguyễn Văn A',
        password: hashedPassword,
        role: 'user',
      },
      {
        email: 'user2@khoahocre.com',
        name: 'Trần Thị B',
        password: hashedPassword,
        role: 'user',
      },
      {
        email: 'user3@khoahocre.com',
        name: 'Lê Văn C',
        password: hashedPassword,
        role: 'user',
      },
      {
        email: 'user4@khoahocre.com',
        name: 'Phạm Thị D',
        password: hashedPassword,
        role: 'user',
      },
    ];

    for (const user of users) {
      const existingUser = await this.userModel.findOne({ email: user.email });
      if (!existingUser) {
        await this.userModel.create(user);
        this.logger.log(`Đã tạo user: ${user.email}`);
      } else {
        this.logger.log(`User đã tồn tại: ${user.email}`);
      }
    }
  }

  private async seedTeachers(): Promise<void> {
    const teachers = [
      {
        name: 'Nguyễn Văn A',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        bio: 'Giảng viên có hơn 10 năm kinh nghiệm trong lĩnh vực lập trình web. Chuyên gia về React, Node.js và MongoDB.',
      },
      {
        name: 'Trần Thị B',
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        bio: 'Chuyên gia về UI/UX Design với hơn 8 năm kinh nghiệm. Đã thiết kế giao diện cho nhiều ứng dụng nổi tiếng.',
      },
      {
        name: 'Lê Minh C',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        bio: 'Full-stack developer với kinh nghiệm 12 năm. Chuyên về Python, Django và các công nghệ AI/ML.',
      },
      {
        name: 'Phạm Thị D',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        bio: 'Mobile developer chuyên về React Native và Flutter. Đã phát triển hơn 50 ứng dụng di động.',
      },
      {
        name: 'Hoàng Văn E',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        bio: 'DevOps Engineer với chứng chỉ AWS và Azure. Chuyên về containerization và CI/CD.',
      },
    ];

    for (const teacher of teachers) {
      const existingTeacher = await this.teacherModel.findOne({
        name: teacher.name,
      });
      if (!existingTeacher) {
        await this.teacherModel.create(teacher);
        this.logger.log(`Đã tạo teacher: ${teacher.name}`);
      } else {
        this.logger.log(`Teacher đã tồn tại: ${teacher.name}`);
      }
    }
  }

  private async seedCategories(): Promise<void> {
    const categories = [
      {
        code: 'web-development',
        name: 'Lập trình Web',
      },
      {
        code: 'mobile-development',
        name: 'Lập trình Mobile',
      },
      {
        code: 'data-science',
        name: 'Khoa học Dữ liệu',
      },
      {
        code: 'ui-ux-design',
        name: 'Thiết kế UI/UX',
      },
      {
        code: 'devops',
        name: 'DevOps',
      },
      {
        code: 'cybersecurity',
        name: 'An ninh mạng',
      },
      {
        code: 'ai-ml',
        name: 'Trí tuệ nhân tạo',
      },
      {
        code: 'blockchain',
        name: 'Blockchain',
      },
    ];

    for (const category of categories) {
      const existingCategory = await this.categoryModel.findOne({
        code: category.code,
      });
      if (!existingCategory) {
        await this.categoryModel.create(category);
        this.logger.log(`Đã tạo category: ${category.name}`);
      } else {
        this.logger.log(`Category đã tồn tại: ${category.name}`);
      }
    }
  }

  private async seedCourses(): Promise<void> {
    // Lấy danh sách teachers và categories
    const teachers = await this.teacherModel.find();
    const categories = await this.categoryModel.find();

    if (teachers.length === 0 || categories.length === 0) {
      this.logger.warn('Không có teachers hoặc categories để tạo courses');
      return;
    }

    this.logger.log(
      `Tìm thấy ${teachers.length} teachers và ${categories.length} categories`,
    );

    // Đảm bảo có ít nhất 4 teachers và 4 categories
    if (teachers.length < 4) {
      this.logger.warn(
        `Cần ít nhất 4 teachers, hiện có ${teachers.length}. Tạo thêm teachers...`,
      );
      // Tạo thêm teachers nếu cần
      const additionalTeachers = [
        {
          name: 'Nguyễn Văn F',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'Giảng viên bổ sung với kinh nghiệm đa dạng.',
        },
        {
          name: 'Trần Thị G',
          avatar:
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          bio: 'Giảng viên bổ sung với chuyên môn sâu.',
        },
      ];

      for (const teacher of additionalTeachers) {
        const existingTeacher = await this.teacherModel.findOne({
          name: teacher.name,
        });
        if (!existingTeacher) {
          await this.teacherModel.create(teacher);
        }
      }

      // Lấy lại danh sách teachers
      const updatedTeachers = await this.teacherModel.find();
      teachers.splice(0, teachers.length, ...updatedTeachers);
    }

    if (categories.length < 4) {
      this.logger.warn(
        `Cần ít nhất 4 categories, hiện có ${categories.length}. Tạo thêm categories...`,
      );
      // Tạo thêm categories nếu cần
      const additionalCategories = [
        {
          code: 'web-development',
          name: 'Lập trình Web',
        },
        {
          code: 'mobile-development',
          name: 'Lập trình Mobile',
        },
        {
          code: 'data-science',
          name: 'Khoa học Dữ liệu',
        },
        {
          code: 'ui-ux-design',
          name: 'Thiết kế UI/UX',
        },
      ];

      for (const category of additionalCategories) {
        const existingCategory = await this.categoryModel.findOne({
          code: category.code,
        });
        if (!existingCategory) {
          await this.categoryModel.create(category);
        }
      }

      // Lấy lại danh sách categories
      const updatedCategories = await this.categoryModel.find();
      categories.splice(0, categories.length, ...updatedCategories);
    }

    const courses = [
      {
        title: 'React.js từ cơ bản đến nâng cao',
        subtitle: 'Học React.js một cách toàn diện',
        slug: 'react-js-tu-co-ban-den-nang-cao',
        description:
          'Khóa học React.js toàn diện từ cơ bản đến nâng cao, bao gồm hooks, context, redux và nhiều hơn nữa.',
        price: 299000,
        oldPrice: 599000,
        discountCode: 'REACT2024',
        image:
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
        isFree: false,
        isActive: true,
        isFeatured: true,
        level: 'intermediate',
        viewCount: 1250,
        categoryCodes: [categories[0]?.code || 'web-development'],
        teacherIds: [teachers[0]?._id],
        introduce: {
          title: 'React.js từ cơ bản đến nâng cao',
          subtitle: 'Học React.js một cách toàn diện',
          reasons: [
            'Hiểu rõ về React.js và cách hoạt động',
            'Sử dụng thành thạo React Hooks',
            'Quản lý state với Context API và Redux',
            'Tối ưu hóa performance của ứng dụng',
            'Deploy ứng dụng React lên production',
          ],
        },
        contents: [
          {
            title: 'Giới thiệu về React',
            items: [
              {
                title: 'React là gì?',
              },
              {
                title: 'Cài đặt môi trường phát triển',
              },
            ],
          },
          {
            title: 'Components và JSX',
            items: [
              {
                title: 'Tạo component đầu tiên',
              },
              {
                title: 'Props và State',
              },
            ],
          },
        ],
      },
      {
        title: 'Node.js Backend Development',
        subtitle: 'Xây dựng API với Node.js và Express',
        slug: 'nodejs-backend-development',
        description:
          'Học cách xây dựng API backend mạnh mẽ với Node.js, Express và MongoDB.',
        price: 399000,
        oldPrice: 799000,
        image:
          'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop',
        isFree: false,
        isActive: true,
        isFeatured: true,
        level: 'intermediate',
        viewCount: 980,
        categoryCodes: [categories[0]?.code || 'web-development'],
        teacherIds: [teachers[1]?._id],
        introduce: {
          title: 'Node.js Backend Development',
          subtitle: 'Xây dựng API với Node.js và Express',
          reasons: [
            'Xây dựng RESTful API với Express.js',
            'Kết nối và làm việc với MongoDB',
            'Authentication và Authorization',
            'Testing API với Jest',
            'Deploy API lên cloud',
          ],
        },
        contents: [
          {
            title: 'Giới thiệu Node.js',
            items: [
              {
                title: 'Node.js là gì?',
              },
              {
                title: 'Event Loop và Asynchronous Programming',
              },
            ],
          },
        ],
      },
      {
        title: 'UI/UX Design Fundamentals',
        subtitle: 'Thiết kế giao diện người dùng chuyên nghiệp',
        slug: 'ui-ux-design-fundamentals',
        description:
          'Học các nguyên tắc thiết kế UI/UX cơ bản và cách tạo ra trải nghiệm người dùng tốt.',
        price: 199000,
        image:
          'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop',
        isFree: false,
        isActive: true,
        isFeatured: false,
        level: 'beginner',
        viewCount: 750,
        categoryCodes: [
          categories[3]?.code || categories[0]?.code || 'ui-ux-design',
        ],
        teacherIds: [teachers[1]?._id],
        introduce: {
          title: 'UI/UX Design Fundamentals',
          subtitle: 'Thiết kế giao diện người dùng chuyên nghiệp',
          reasons: [
            'Nguyên tắc thiết kế UI/UX',
            'Sử dụng Figma để thiết kế',
            'Tạo wireframe và prototype',
            'User research và testing',
            'Design system và component library',
          ],
        },
        contents: [
          {
            title: 'Giới thiệu UI/UX',
            items: [
              {
                title: 'UI vs UX - Sự khác biệt',
              },
            ],
          },
        ],
      },
      {
        title: 'Python cho Data Science',
        subtitle: 'Phân tích dữ liệu với Python',
        slug: 'python-cho-data-science',
        description:
          'Học Python để phân tích dữ liệu, tạo visualization và machine learning cơ bản.',
        price: 499000,
        oldPrice: 999000,
        discountCode: 'PYTHON2024',
        image:
          'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop',
        isFree: false,
        isActive: true,
        isFeatured: true,
        level: 'intermediate',
        viewCount: 1100,
        categoryCodes: [
          categories[2]?.code || categories[0]?.code || 'data-science',
        ],
        teacherIds: [teachers[2]?._id],
        introduce: {
          title: 'Python cho Data Science',
          subtitle: 'Phân tích dữ liệu với Python',
          reasons: [
            'Sử dụng Pandas để xử lý dữ liệu',
            'Tạo visualization với Matplotlib và Seaborn',
            'Machine Learning cơ bản với Scikit-learn',
            'Phân tích thống kê',
            'Làm việc với Jupyter Notebook',
          ],
        },
        contents: [
          {
            title: 'Giới thiệu Data Science',
            items: [
              {
                title: 'Data Science là gì?',
              },
            ],
          },
        ],
      },
      {
        title: 'React Native Mobile App',
        subtitle: 'Phát triển ứng dụng di động với React Native',
        slug: 'react-native-mobile-app',
        description:
          'Học cách tạo ứng dụng di động cross-platform với React Native.',
        price: 349000,
        image:
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop',
        isFree: false,
        isActive: true,
        isFeatured: false,
        level: 'intermediate',
        viewCount: 650,
        categoryCodes: [
          categories[1]?.code || categories[0]?.code || 'mobile-development',
        ],
        teacherIds: [teachers[3]?._id],
        introduce: {
          title: 'React Native Mobile App',
          subtitle: 'Phát triển ứng dụng di động với React Native',
          reasons: [
            'Setup môi trường React Native',
            'Navigation trong React Native',
            'State management với Redux',
            'Tích hợp API và database',
            'Build và deploy ứng dụng',
          ],
        },
        contents: [
          {
            title: 'Giới thiệu React Native',
            items: [
              {
                title: 'React Native vs Native',
              },
            ],
          },
        ],
      },
    ];

    for (const course of courses) {
      const existingCourse = await this.courseModel.findOne({
        slug: course.slug,
      });
      if (!existingCourse) {
        await this.courseModel.create(course);
        this.logger.log(`Đã tạo course: ${course.title}`);
      } else {
        this.logger.log(`Course đã tồn tại: ${course.title}`);
      }
    }
  }
}
