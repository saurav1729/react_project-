import mongoose from "mongoose";
import ApiError from "../utils/apiError";
import CommentModel from "../models/Comment";
import TicketModel from "../models/Ticket";
import AuditEventModel from "../models/AuditEvent";
import { createMany as createAttachments } from "./attachment.service";
import {
  AUDIT_EVENT_TYPE,
  AUDIT_VISIBILITY,
  COMMENT_VISIBILITY,
  USER_ROLES
} from "../utils/constants";

export async function addComment(params: { user: any; ticketId: any; body: any; files?: Express.Multer.File[] }) {
  const { user, ticketId, body, files } = params;

  const ticket = await TicketModel.findById(ticketId).select("_id requesterId");
  if (!ticket) throw new ApiError(404, "Ticket not found", "NOT_FOUND");

  if (user.role !== USER_ROLES.AGENT && String(ticket.requesterId) !== String(user._id)) {
    throw new ApiError(403, "Forbidden", "FORBIDDEN");
  }

  const visibility = user.role === USER_ROLES.AGENT ? body.visibility : COMMENT_VISIBILITY.PUBLIC;

  if (user.role !== USER_ROLES.AGENT && body.visibility === COMMENT_VISIBILITY.INTERNAL) {
    throw new ApiError(403, "Requesters cannot create internal notes", "FORBIDDEN");
  }

  // CREATE COMMENT: Removed session array wrapper
  const created = await CommentModel.create({
    ticketId,
    authorId: user._id,
    visibility,
    body: body.body
  });

  const auditVisibility =
    visibility === COMMENT_VISIBILITY.INTERNAL ? AUDIT_VISIBILITY.INTERNAL : AUDIT_VISIBILITY.PUBLIC;

  // CREATE AUDIT EVENT: Comment Addition
  await AuditEventModel.create({
    ticketId,
    actorId: user._id,
    eventType: AUDIT_EVENT_TYPE.COMMENT_ADDED,
    visibility: auditVisibility,
    metadata: { commentId: created._id, visibility }
  });

  // CREATE ATTACHMENTS: Removed session parameter
  const attachments = await createAttachments({
    files,
    ticketId,
    commentId: created._id,
    uploadedBy: user._id
  });

  if (attachments && attachments.length > 0) {
    await AuditEventModel.create(
      attachments.map(() => ({
        ticketId,
        actorId: user._id,
        eventType: AUDIT_EVENT_TYPE.ATTACHMENT_ADDED,
        visibility: auditVisibility,
        metadata: { commentId: created._id }
      }))
    );
  }

  return await created.populate([
    { path: "authorId", select: "firstName lastName email role" },
    { path: "attachments" }
  ]);
}

export async function listComments(params: { user: any; ticketId: any }) {
  const { user, ticketId } = params;

  const ticket = await TicketModel.findById(ticketId).select("_id requesterId");
  if (!ticket) throw new ApiError(404, "Ticket not found", "NOT_FOUND");

  if (user.role !== USER_ROLES.AGENT && String(ticket.requesterId) !== String(user._id)) {
    throw new ApiError(403, "Forbidden", "FORBIDDEN");
  }

  const query: any = { ticketId };
  if (user.role !== USER_ROLES.AGENT) query.visibility = COMMENT_VISIBILITY.PUBLIC;

  return CommentModel.find(query)
    .sort({ createdAt: 1 })
    .populate("authorId", "firstName lastName email role")
    .populate("attachments");
}
