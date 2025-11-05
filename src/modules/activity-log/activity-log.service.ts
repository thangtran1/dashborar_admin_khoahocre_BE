import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ActivityLog } from './schemas/activity-log.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { SessionFilter, UserLoginSession } from 'src/types/entity';
@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(ActivityLog.name)
    private activityLogModel: Model<ActivityLog>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // day: 7 giờ gần nhất
  // week: 7 ngày gần nhất
  // month: 6 khoảng tháng gần nhất
  // year: 7 năm gần nhất
  async getStats(period: 'day' | 'week' | 'month' | 'year') {
    const now = new Date();
    const labels: string[] = [];
    let startDate: Date;
    let intervalDays = 0; // dùng cho month

    // --- Xác định startDate và labels ---
    if (period === 'day') {
      // Lấy 7 giờ gần nhất
      startDate = new Date(now);
      startDate.setHours(now.getHours() - 6, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setHours(startDate.getHours() + i);
        labels.push(d.getHours().toString().padStart(2, '0')); // label "08","09",...
      }
    } else if (period === 'week') {
      // 7 ngày gần nhất
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        labels.push(
          `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        );
      }
    } else if (period === 'month') {
      // chia 1 tháng thành 6 khoảng
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      intervalDays = Math.ceil(30 / 6);
      for (let i = 0; i < 6; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i * intervalDays);
        if (d > now) d.setTime(now.getTime());
        labels.push(
          `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        );
      }
    } else if (period === 'year') {
      // 7 năm gần nhất
      const currentYear = now.getFullYear();
      startDate = new Date(currentYear - 6, 0, 1);
      for (let i = 0; i < 7; i++) {
        labels.push((currentYear - 6 + i).toString());
      }
    } else {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    }

    // --- Aggregate MongoDB ---
    const logsRaw = await this.activityLogModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $addFields: {
          timeKey:
            period === 'day'
              ? { $hour: { date: '$createdAt', timezone: '+07:00' } } // giờ
              : period === 'week'
                ? {
                    $dateToString: {
                      format: '%d/%m',
                      date: '$createdAt',
                      timezone: '+07:00',
                    },
                  } // ngày
                : period === 'month'
                  ? {
                      $floor: {
                        $divide: [
                          { $subtract: ['$createdAt', startDate] },
                          1000 * 60 * 60 * 24 * intervalDays,
                        ],
                      },
                    } // 0..5
                  : period === 'year'
                    ? { $year: { date: '$createdAt', timezone: '+07:00' } }
                    : null,
        },
      },
      {
        $group: {
          _id: '$timeKey',
          login: { $sum: { $cond: [{ $eq: ['$type', 'login'] }, 1, 0] } },
          logout: { $sum: { $cond: [{ $eq: ['$type', 'logout'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    let loginData: number[] = [];
    let logoutData: number[] = [];

    if (period === 'day') {
      loginData = labels.map((label): number => {
        const hour = parseInt(label);
        const log = logsRaw.find((l: { _id: number }) => l._id === hour) as {
          _id: number;
          login: number;
        };
        return log ? log.login : 0;
      });
      logoutData = labels.map((label): number => {
        const hour = parseInt(label);
        const log = logsRaw.find((l: { _id: number }) => l._id === hour) as {
          _id: number;
          logout: number;
        };
        return log ? log.logout : 0;
      });
    } else if (period === 'week' || period === 'month') {
      loginData = labels.map((label, idx): number => {
        const key = period === 'week' ? label : idx;
        const log = logsRaw.find((l: { _id: number }) => l._id === key) as {
          _id: number;
          login: number;
        };
        return log ? log.login : 0;
      });
      logoutData = labels.map((label, idx): number => {
        const key = period === 'week' ? label : idx;
        const log = logsRaw.find((l: { _id: number }) => l._id === key) as {
          _id: number;
          logout: number;
        };
        return log ? log.logout : 0;
      });
    } else if (period === 'year') {
      loginData = labels.map((label): number => {
        const year = parseInt(label);
        const log = logsRaw.find((l: { _id: number }) => l._id === year) as {
          _id: number;
          login: number;
        };
        return log ? log.login : 0;
      });
      logoutData = labels.map((label): number => {
        const year = parseInt(label);
        const log = logsRaw.find((l: { _id: number }) => l._id === year) as {
          _id: number;
          logout: number;
        };
        return log ? log.logout : 0;
      });
    }

    return {
      labels,
      series: [
        { name: 'Login', data: loginData },
        { name: 'Logout', data: logoutData },
      ],
    };
  }

  // Tạo nhật ký hoạt động cho người dùng đăng nhập, đăng xuất .... coming soon
  async createActivityLog(
    userId: string,
    type: string,
    ip?: string,
    userAgent?: string,
  ) {
    const log = new this.activityLogModel({ userId, type, ip, userAgent });
    return await log.save();
  }

  // Tìm nhật ký hoạt động của người dùng
  async findUserActivityLogs(userId: string) {
    return this.activityLogModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }
  // Lấy phiên đăng nhập của người dùng
  async getUserLoginSessions(
    filter?: SessionFilter,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ sessions: UserLoginSession[]; total: number }> {
    try {
      const allActivities = await this.activityLogModel
        .find({ type: { $in: ['login', 'logout'] } })
        .sort({ createdAt: -1 })
        .populate('userId', 'name email role status')
        .lean();

      const activitiesByUser = new Map<string, typeof allActivities>();

      for (const act of allActivities) {
        const user = act.userId as unknown as UserDocument;
        if (!user?._id) continue;
        const userId = (user._id as Types.ObjectId).toString();

        if (!activitiesByUser.has(userId)) activitiesByUser.set(userId, []);
        activitiesByUser.get(userId)!.push(act);
      }

      const allSessions: UserLoginSession[] = [];

      for (const [userId, acts] of activitiesByUser.entries()) {
        const latest = acts[0];
        const user = latest.userId as unknown as UserDocument;

        if (user.role === UserRole.ADMIN) continue;

        const session: UserLoginSession = {
          userId,
          sessionStatus: latest.type === 'login' ? 'active' : 'revoked',
          lastActivityType: latest.type,
          lastActivityTime: latest.createdAt,
          ip: latest.ip ?? null,
          userAgent: latest.userAgent ?? null,
          userName: user.name ?? 'Unknown',
          email: user.email ?? 'Unknown',
          status: user.status ?? 'Unknown',
        };

        // Filter sessionStatus
        if (
          filter?.sessionStatus &&
          session.sessionStatus !== filter.sessionStatus
        )
          continue;

        // Filter keyword
        if (filter?.keyword) {
          const keyword = filter.keyword.toLowerCase();
          if (
            !session.userName.toLowerCase().includes(keyword) &&
            !session.email.toLowerCase().includes(keyword)
          ) {
            continue;
          }
        }

        // Filter lastActivityTime
        const lastTime = session.lastActivityTime ?? new Date(0);
        if (filter?.from && lastTime < filter.from) continue;
        if (filter?.to && lastTime > filter.to) continue;

        allSessions.push(session);
      }

      const total = allSessions.length;
      const start = (page - 1) * limit;
      const paginatedSessions = allSessions.slice(start, start + limit);

      return { sessions: paginatedSessions, total };
    } catch (error) {
      throw new Error(
        `Failed to get user login sessions: ${(error as Error).message}`,
      );
    }
  }
}
