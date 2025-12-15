import mongoose, { Schema, Document } from 'mongoose';
import { Priority } from '../../core/entities/Priority';
import { Status } from '../../core/entities/Status';

export interface ITaskDocument extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
      trim: true
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      trim: true
    },
    dueDate: {
      type: Date,
      default: null
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.Medium
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.Pending
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for filtering
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });

export const TaskModel = mongoose.model<ITaskDocument>('Task', TaskSchema);
