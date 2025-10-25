import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import {
  Maintenance,
  MaintenanceDocument,
  MaintenanceStatus,
} from './schemas/maintenance.schema';
import { MaintenanceFilterDto } from './dto/maintenance-filter.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectModel(Maintenance.name)
    private maintenanceModel: Model<MaintenanceDocument>,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto) {
    const now = new Date();
    const startTime = new Date(createMaintenanceDto.startTime);
    const endTime = new Date(createMaintenanceDto.endTime);

    // Validate times
    if (startTime < now) {
      throw new BadRequestException(
        'Thời gian bắt đầu không thể nằm trong quá khứ',
      );
    }
    if (endTime <= startTime) {
      throw new BadRequestException(
        'Thời gian kết thúc phải sau thời gian bắt đầu',
      );
    }

    // Check for overlapping maintenance
    const overlapping = await this.maintenanceModel.findOne({
      status: {
        $in: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS],
      },
      $or: [
        {
          startTime: { $lte: endTime },
          endTime: { $gte: startTime },
        },
      ],
    });

    if (overlapping) {
      throw new ConflictException(
        'Đã có lịch bảo trì khác trong khoảng thời gian này',
      );
    }

    const maintenance = new this.maintenanceModel({
      ...createMaintenanceDto,
      status:
        startTime <= now
          ? MaintenanceStatus.IN_PROGRESS
          : MaintenanceStatus.SCHEDULED,
      isActive: startTime <= now,
    });

    // If starting now, stop any active maintenance
    if (startTime <= now) {
      await this.stopActiveMaintenance();
    }

    return {
      success: true,
      message: 'Tạo bảo trì thành công',
      data: await maintenance.save(),
    };
  }

  async findAll(filters: MaintenanceFilterDto) {
    const { title, status, type, from, to, page = 1, limit = 10 } = filters;
    const query = this.maintenanceModel.find();

    if (title) {
      query.where('title', new RegExp(title, 'i'));
    }
    if (status) {
      query.where('status', status);
    }
    if (type) {
      query.where('type', type);
    }
    if (from && to) {
      query
        .where('startTime')
        .gte(new Date(from).getTime())
        .lte(new Date(to).getTime());
    }

    const total = await this.maintenanceModel.countDocuments(query.getQuery());
    const items = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ startTime: -1 })
      .exec();

    return {
      success: true,
      message: 'Lấy danh sách bảo trì thành công',
      data: items,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  async findOne(id: string) {
    const maintenance = await this.maintenanceModel.findById(id);
    if (!maintenance) {
      throw new NotFoundException(`Không tìm thấy bảo trì với ID ${id}`);
    }
    return {
      success: true,
      message: 'Lấy chi tiết bảo trì thành công',
      data: maintenance,
    };
  }

  async update(id: string, updateMaintenanceDto: UpdateMaintenanceDto) {
    const maintenance = await this.findOne(id);

    if (maintenance.data.status === MaintenanceStatus.IN_PROGRESS) {
      throw new BadRequestException('Không thể cập nhật bảo trì đang diễn ra');
    }
    if (maintenance.data.status === MaintenanceStatus.COMPLETED) {
      throw new BadRequestException('Không thể cập nhật bảo trì đã hoàn thành');
    }
    if (maintenance.data.status === MaintenanceStatus.CANCELLED) {
      throw new BadRequestException('Không thể cập nhật bảo trì đã hủy');
    }

    if (updateMaintenanceDto.startTime) {
      const startTime = new Date(updateMaintenanceDto.startTime);
      if (startTime < new Date()) {
        throw new BadRequestException(
          'Thời gian bắt đầu không thể nằm trong quá khứ',
        );
      }
    }

    if (updateMaintenanceDto.startTime && updateMaintenanceDto.endTime) {
      const startTime = new Date(updateMaintenanceDto.startTime);
      const endTime = new Date(updateMaintenanceDto.endTime);
      if (endTime <= startTime) {
        throw new BadRequestException(
          'Thời gian kết thúc phải sau thời gian bắt đầu',
        );
      }

      // Check for overlapping maintenance
      const overlapping = await this.maintenanceModel.findOne({
        _id: { $ne: id },
        status: {
          $in: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS],
        },
        $or: [
          {
            startTime: { $lte: endTime },
            endTime: { $gte: startTime },
          },
        ],
      });

      if (overlapping) {
        throw new ConflictException(
          'Đã có lịch bảo trì khác trong khoảng thời gian này',
        );
      }
    }

    return {
      success: true,
      message: 'Cập nhật bảo trì thành công',
      data: await this.maintenanceModel.findByIdAndUpdate(
        id,
        { ...updateMaintenanceDto, updatedAt: new Date() },
        { new: true },
      ),
    };
  }

  async remove(ids: string | string[]) {
    const idsArray = Array.isArray(ids) ? ids : [ids];
  
    const maintenances = await this.maintenanceModel.find({ _id: { $in: idsArray } });
  
    if (
      maintenances.some(
        m => ![MaintenanceStatus.SCHEDULED, MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED].includes(m.status)
      )
    ) {
      throw new BadRequestException('Chỉ có thể xóa bảo trì đã lên lịch, đã hoàn thành hoặc đã hủy');
    }
  
    await this.maintenanceModel.deleteMany({ _id: { $in: idsArray } });
    return { success: true, message: 'Xóa bảo trì thành công' };
  }

  async startNow(id: string) {
    const maintenance = await this.findOne(id);
    const now = new Date();

    if (maintenance.data.status !== MaintenanceStatus.SCHEDULED) {
      throw new BadRequestException('Chỉ có thể bắt đầu bảo trì đã lên lịch');
    }

    // Stop any active maintenance
    await this.stopActiveMaintenance();

    // Update start time and adjust end time if needed
    maintenance.data.startTime = now;
    maintenance.data.status = MaintenanceStatus.IN_PROGRESS;
    maintenance.data.isActive = true;

    if (maintenance.data.startTime > maintenance.data.endTime) {
      maintenance.data.endTime = new Date(now.getTime() + 60 * 60 * 1000); // +60 minutes
      maintenance.data.autoAdjusted = true;
    }

    const saved = await maintenance.data.save();

    return {
      success: true,
      message: 'Bắt đầu bảo trì thành công',
      data: saved,
    };
  }

  async stop(id: string) {
    const maintenance = await this.findOne(id);

    if (maintenance.data.status !== MaintenanceStatus.IN_PROGRESS) {
      throw new BadRequestException('Chỉ có thể dừng bảo trì đang diễn ra');
    }

    const now = new Date();
    maintenance.data.status = MaintenanceStatus.COMPLETED;
    maintenance.data.endTime = now;
    maintenance.data.isActive = false;
    maintenance.data.duration = Math.floor(
      (now.getTime() - maintenance.data.startTime.getTime()) / (60 * 1000),
    );

    return {
      success: true,
      message: 'Dừng bảo trì thành công',
      data: await maintenance.data.save(),
    };
  }

  async cancel(id: string) {
    const maintenance = await this.findOne(id);

    if (maintenance.data.status !== MaintenanceStatus.SCHEDULED) {
      throw new BadRequestException('Chỉ có thể hủy bảo trì đã lên lịch');
    }

    maintenance.data.status = MaintenanceStatus.CANCELLED;
    maintenance.data.isActive = false;

    return {
      success: true,
      message: 'Hủy bảo trì thành công',
      data: await maintenance.data.save(),
    };
  }

  async getCurrentStatus() {
    const activeMaintenance = await this.maintenanceModel.findOne({
      isActive: true,
    });

    return {
      success: true,
      message: 'Lấy trạng thái bảo trì hiện tại thành công',
      data: {
        isUnderMaintenance: !!activeMaintenance,
        maintenance: activeMaintenance,
      },
    };
  }

  private async stopActiveMaintenance() {
    const activeMaintenance = await this.maintenanceModel.findOne({
      isActive: true,
    });

    if (activeMaintenance) {
      const now = new Date();
      activeMaintenance.status = MaintenanceStatus.COMPLETED;
      activeMaintenance.endTime = now;
      activeMaintenance.isActive = false;
      activeMaintenance.duration = Math.floor(
        (now.getTime() - activeMaintenance.startTime.getTime()) / (60 * 1000),
      );
      await activeMaintenance.save();
    }
  }
}
