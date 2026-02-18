import mongoose, { type InferSchemaType } from "mongoose";
import {
  DEVICE_TYPE,
  LOCATION_TYPE,
  OS_TYPE,
  TICKET_PRIORITY,
  TICKET_STATUS,
  TICKET_TYPE
} from "../utils/constants";

const TicketSchema = new mongoose.Schema(
  {
    displayId: { type: String, trim: true, required: true, unique: true },

    title: { type: String, trim: true, required: true, maxlength: 50 },
    description: { type: String, trim: true, required: true, maxlength: 300 },

    type: { type: String, enum: Object.values(TICKET_TYPE), required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

    priority: { type: String, enum: Object.values(TICKET_PRIORITY), required: true },
    deviceType: { type: String, enum: Object.values(DEVICE_TYPE), required: true },
    operatingSystem: { type: String, enum: Object.values(OS_TYPE), required: true },
    location: { type: String, enum: Object.values(LOCATION_TYPE), required: true },

    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    status: { type: String, enum: Object.values(TICKET_STATUS), default: TICKET_STATUS.CREATED, required: true },

    resolutionSummary: {
      type: String,
      trim: true,
      maxlength: 1000,
      required: function (this: any) {
        return this.status === TICKET_STATUS.COMPLETED;
      }
    },

    assignedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null }
  },
  { 
    timestamps: true,
    // This ensures that displayId and other fields are correctly handled in JSON responses
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * Fix for TypeError: next is not a function
 * By removing the 'next' parameter and throwing errors directly, 
 * we avoid the callback mismatch causing the 500 error.
 */
TicketSchema.pre("validate", function () {
  const doc = this;

  if (doc.status === TICKET_STATUS.CREATED) {
    if (doc.assigneeId) {
      throw new Error("assigneeId must be null when status is Created");
    }
  } else {
    // If status is anything other than 'Created', an assignee is mandatory
    if (!doc.assigneeId) {
      throw new Error("assigneeId is required when status is not Created");
    }
  }
});

// Text index for search functionality
TicketSchema.index({ displayId: "text", title: "text", description: "text" });

export type ITicket = InferSchemaType<typeof TicketSchema>;
const Ticket = mongoose.model<ITicket>("Ticket", TicketSchema);

export default Ticket;
