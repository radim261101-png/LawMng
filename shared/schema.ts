import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const valuRecords = pgTable("valu_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serial: integer("serial").notNull().unique(),
  company: text("company"),
  accountNumber: text("account_number"),
  clientName: text("client_name"),
  nationalId: text("national_id"),
  legalAgent: text("legal_agent"),
  litigationLevel: text("litigation_level"),
  receiptDateFromCompany: text("receipt_date_from_company"),
  documentType: text("document_type"),
  attachedDocumentsCount: text("attached_documents_count"),
  documentValue: text("document_value"),
  reportDate: text("report_date"),
  crimeNumber: text("crime_number"),
  reportType: text("report_type"),
  governorate: text("governorate"),
  district: text("district"),
  firstInstanceCourtLocation: text("first_instance_court_location"),
  firstSessionDate: text("first_session_date"),
  postponementDate: text("postponement_date"),
  postponementReason: text("postponement_reason"),
  ruling: text("ruling"),
  inventoryNumber: text("inventory_number"),
  firstInstanceCourtNotes: text("first_instance_court_notes"),
  oppositionSessionDate: text("opposition_session_date"),
  oppositionRuling: text("opposition_ruling"),
  oppositionInventoryNumber: text("opposition_inventory_number"),
  firstAppealSessionDate: text("first_appeal_session_date"),
  appealCourtLocation: text("appeal_court_location"),
  clientAppealNumber: text("client_appeal_number"),
  appealRulingText: text("appeal_ruling_text"),
  appealInventoryNumber: text("appeal_inventory_number"),
  appealOppositionDate: text("appeal_opposition_date"),
  appealOppositionRuling: text("appeal_opposition_ruling"),
  appealOppositionInventoryNumber: text("appeal_opposition_inventory_number"),
  settlementMailDate: text("settlement_mail_date"),
  settlementConfirmationDate: text("settlement_confirmation_date"),
  debtDocumentReturnDate: text("debt_document_return_date"),
  debtDocumentReturnReason: text("debt_document_return_reason"),
  depositReceiptStatus: text("deposit_receipt_status"),
  checkNumber: text("check_number"),
  checkRejectionReason: text("check_rejection_reason"),
  checkRejectionDate: text("check_rejection_date"),
  powerOfAttorneyDetails: text("power_of_attorney_details"),
  updateDate: text("update_date"),
  lastUpdateLawyer: text("last_update_lawyer"),
  extract: text("extract"),
  invoice: text("invoice"),
  notes: text("notes"),
  sessionUpdate: text("session_update"),
  required: text("required"),
  report: text("report"),
  archived: text("archived"),
  paidCases: text("paid_cases"),
  reportPreparationLawyer: text("report_preparation_lawyer"),
  sessionAttendanceLawyer: text("session_attendance_lawyer"),
  extractionLawyer: text("extraction_lawyer"),
  settlementLawyer: text("settlement_lawyer"),
  claimSent: text("claim_sent"),
  receivingLawyer: text("receiving_lawyer"),
  branchesReceipt: text("branches_receipt"),
  receiptDate: text("receipt_date"),
  
  createdBy: text("created_by").notNull(),
  lastModifiedBy: text("last_modified_by"),
  lastModifiedDate: text("last_modified_date"),
});

export const recordUpdates = pgTable("record_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recordId: varchar("record_id").notNull(),
  updatedBy: text("updated_by").notNull(),
  updatedAt: text("updated_at").notNull(),
  fieldName: text("field_name").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
});

export const EDITABLE_FIELDS = [
  'reportType',
  'postponementDate',
  'postponementReason',
  'ruling',
  'inventoryNumber',
  'firstInstanceCourtNotes',
  'oppositionSessionDate',
  'oppositionRuling',
  'oppositionInventoryNumber',
  'firstAppealSessionDate',
  'appealCourtLocation',
  'clientAppealNumber',
  'appealRulingText',
  'appealInventoryNumber',
  'appealOppositionDate',
  'appealOppositionRuling',
  'appealOppositionInventoryNumber',
  'settlementMailDate',
  'settlementConfirmationDate',
  'depositReceiptStatus',
  'updateDate',
  'lastUpdateLawyer',
  'extract',
  'notes',
  'sessionUpdate',
  'required',
  'report',
  'archived',
  'paidCases',
  'reportPreparationLawyer',
  'sessionAttendanceLawyer',
  'extractionLawyer',
  'settlementLawyer',
  'claimSent',
  'branchesReceipt',
  'receiptDate',
  'debtDocumentReturnDate',
  'debtDocumentReturnReason',
  'invoice',
] as const;

export const insertValuRecordSchema = createInsertSchema(valuRecords).omit({
  id: true,
  createdBy: true,
  lastModifiedBy: true,
  lastModifiedDate: true,
});

export const updateValuRecordSchema = createInsertSchema(valuRecords).omit({
  id: true,
  serial: true,
  createdBy: true,
}).partial();

export type InsertValuRecord = z.infer<typeof insertValuRecordSchema>;
export type UpdateValuRecord = z.infer<typeof updateValuRecordSchema>;
export type ValuRecord = typeof valuRecords.$inferSelect;
export type RecordUpdate = typeof recordUpdates.$inferSelect;
