import { type User, type InsertUser, type ValuRecord, type UpdateValuRecord, type RecordUpdate } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllRecords(): Promise<ValuRecord[]>;
  getRecordById(id: string): Promise<ValuRecord | undefined>;
  getRecordBySerial(serial: number): Promise<ValuRecord | undefined>;
  updateRecord(id: string, updates: UpdateValuRecord, username: string): Promise<ValuRecord | undefined>;

  getRecordUpdates(recordId: string): Promise<RecordUpdate[]>;
  getAllRecordUpdates(): Promise<RecordUpdate[]>;
  createRecordUpdate(update: Omit<RecordUpdate, 'id'>): Promise<RecordUpdate>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private records: Map<string, ValuRecord>;
  private recordUpdates: Map<string, RecordUpdate[]>;

  constructor() {
    this.users = new Map();
    this.records = new Map();
    this.recordUpdates = new Map();

    this.initializeUsers();
    this.initializeRecords();
    this.initializeSampleUpdates();
  }

  private initializeUsers() {
    const admin: User = {
      id: randomUUID(),
      username: "admin",
      password: "admin123",
      role: "admin"
    };

    const user: User = {
      id: randomUUID(),
      username: "user",
      password: "user123",
      role: "user"
    };

    this.users.set(admin.id, admin);
    this.users.set(user.id, user);
  }

  private initializeRecords() {
    const initialRecords: Omit<ValuRecord, 'id'>[] = [
      {
        serial: 69,
        company: "فاليو",
        accountNumber: "M00200078606",
        clientName: "احمد مختار العراقي احمد",
        nationalId: "29311252103591",
        legalAgent: "qima",
        litigationLevel: "احكام",
        receiptDateFromCompany: "2024-11-25",
        documentType: "إيصال امانه",
        attachedDocumentsCount: "واحد",
        documentValue: "14,929",
        reportDate: "2024-12-07",
        crimeNumber: "2024/23791",
        reportType: "جنحة",
        governorate: "الدقهليه",
        district: "مركز المنصورة",
        firstInstanceCourtLocation: "المنصورة",
        firstSessionDate: "2025-02-23",
        postponementDate: null,
        postponementReason: null,
        ruling: "غ/شهرين +ك200",
        inventoryNumber: "2025/4989",
        firstInstanceCourtNotes: "تم تقديم اصل الايصال 23-2-2025",
        oppositionSessionDate: null,
        oppositionRuling: null,
        oppositionInventoryNumber: null,
        firstAppealSessionDate: null,
        appealCourtLocation: null,
        clientAppealNumber: null,
        appealRulingText: null,
        appealInventoryNumber: null,
        appealOppositionDate: null,
        appealOppositionRuling: null,
        appealOppositionInventoryNumber: null,
        settlementMailDate: null,
        settlementConfirmationDate: null,
        debtDocumentReturnDate: null,
        debtDocumentReturnReason: null,
        depositReceiptStatus: "بالمحكمة",
        checkNumber: null,
        checkRejectionReason: null,
        checkRejectionDate: null,
        powerOfAttorneyDetails: "توكيل رقم 2616ل لسنه 2023 توثيق الموسكى",
        updateDate: "2025-08-03",
        lastUpdateLawyer: null,
        extract: "تم استخراج ما يفيد تقديم اصل الايصال",
        invoice: "ديسمبر  -2024",
        notes: null,
        sessionUpdate: null,
        required: null,
        report: null,
        archived: "أرشيف",
        paidCases: "تم الصرف شهر 8-2025",
        reportPreparationLawyer: "ناسي يوسف",
        sessionAttendanceLawyer: "اسلام احمد",
        extractionLawyer: "محمد حسن",
        settlementLawyer: null,
        claimSent: "تم ارسال شهر 12-2024",
        receivingLawyer: "عبدالعزيز",
        branchesReceipt: null,
        receiptDate: null,
        createdBy: "system",
        lastModifiedBy: null,
        lastModifiedDate: null,
      },
      {
        serial: 71,
        company: "فاليو",
        accountNumber: "M00200067466",
        clientName: "حازم حسن إبراهيم حسن",
        nationalId: "28607090101592",
        legalAgent: "qima",
        litigationLevel: "احكام",
        receiptDateFromCompany: "2024-11-25",
        documentType: "إيصال امانه",
        attachedDocumentsCount: "واحد",
        documentValue: "24,755",
        reportDate: "2024-11-30",
        crimeNumber: "2024/13399",
        reportType: "جنحة",
        governorate: "الجيزة",
        district: "المنيرة الغربية",
        firstInstanceCourtLocation: "تاج الدول",
        firstSessionDate: "2024-12-25",
        postponementDate: null,
        postponementReason: null,
        ruling: "سنه+ك500",
        inventoryNumber: "2024/9758",
        firstInstanceCourtNotes: null,
        oppositionSessionDate: null,
        oppositionRuling: null,
        oppositionInventoryNumber: null,
        firstAppealSessionDate: null,
        appealCourtLocation: null,
        clientAppealNumber: null,
        appealRulingText: null,
        appealInventoryNumber: null,
        appealOppositionDate: null,
        appealOppositionRuling: null,
        appealOppositionInventoryNumber: null,
        settlementMailDate: null,
        settlementConfirmationDate: null,
        debtDocumentReturnDate: null,
        debtDocumentReturnReason: null,
        depositReceiptStatus: "بالمحكمة",
        checkNumber: null,
        checkRejectionReason: null,
        checkRejectionDate: null,
        powerOfAttorneyDetails: "توكيل رقم 2616ل لسنه 2023 توثيق الموسكى",
        updateDate: "2025-06-10",
        lastUpdateLawyer: "عزيزة",
        extract: "تم استخراج صورة رسمية من الحكم",
        invoice: "ديسمبر  -2024",
        notes: null,
        sessionUpdate: "2024-12-25",
        required: null,
        report: null,
        archived: "أرشيف",
        paidCases: "تم الصرف شهر 8-2025",
        reportPreparationLawyer: "عبدالعزيز",
        sessionAttendanceLawyer: "عبدالعزيز",
        extractionLawyer: "عزيزة",
        settlementLawyer: null,
        claimSent: "تم ارسال شهر 12-2024",
        receivingLawyer: "عبدالعزيز",
        branchesReceipt: null,
        receiptDate: null,
        createdBy: "system",
        lastModifiedBy: null,
        lastModifiedDate: null,
      },
      {
        serial: 75,
        company: "فاليو",
        accountNumber: "M00200102506",
        clientName: "نور يحي سيد محمد إبراهيم",
        nationalId: "29601061400683",
        legalAgent: "qima",
        litigationLevel: "احكام",
        receiptDateFromCompany: "2025-02-03",
        documentType: "إيصال امانه",
        attachedDocumentsCount: "واحد",
        documentValue: "9,094",
        reportDate: "2025-03-03",
        crimeNumber: "2025/3149",
        reportType: "جنحة",
        governorate: "القاهرة",
        district: "الساحل",
        firstInstanceCourtLocation: "الجلاء",
        firstSessionDate: "2025-05-08",
        postponementDate: null,
        postponementReason: null,
        ruling: "غ/شهرين +ك 200",
        inventoryNumber: "2025/3141",
        firstInstanceCourtNotes: null,
        oppositionSessionDate: null,
        oppositionRuling: null,
        oppositionInventoryNumber: null,
        firstAppealSessionDate: null,
        appealCourtLocation: null,
        clientAppealNumber: null,
        appealRulingText: null,
        appealInventoryNumber: null,
        appealOppositionDate: null,
        appealOppositionRuling: null,
        appealOppositionInventoryNumber: null,
        settlementMailDate: null,
        settlementConfirmationDate: null,
        debtDocumentReturnDate: null,
        debtDocumentReturnReason: null,
        depositReceiptStatus: "بالمحكمة",
        checkNumber: null,
        checkRejectionReason: null,
        checkRejectionDate: null,
        powerOfAttorneyDetails: "توكيل رقم 2616ل لسنه 2023 توثيق الموسكى",
        updateDate: "2025-03-16",
        lastUpdateLawyer: null,
        extract: "تم تقديم اصل الايصال +تم استخراج صورة رسمية من الحكم\n",
        invoice: null,
        notes: null,
        sessionUpdate: "2025-05-08",
        required: null,
        report: null,
        archived: "أرشيف",
        paidCases: "تم الصرف شهر 8-2025",
        reportPreparationLawyer: "عبدالعزيز",
        sessionAttendanceLawyer: "عزيزة",
        extractionLawyer: "محمود محمد",
        settlementLawyer: null,
        claimSent: null,
        receivingLawyer: "اسامه محمد",
        branchesReceipt: null,
        receiptDate: null,
        createdBy: "system",
        lastModifiedBy: null,
        lastModifiedDate: null,
      },
      {
        serial: 76,
        company: "فاليو",
        accountNumber: "M00200081017",
        clientName: "محمد عبد اللطيف بدر السيد سالم",
        nationalId: "28404141200495",
        legalAgent: "qima",
        litigationLevel: "احكام",
        receiptDateFromCompany: "2025-02-03",
        documentType: "إيصال امانه",
        attachedDocumentsCount: "واحد",
        documentValue: "42,550",
        reportDate: "2025-02-25",
        crimeNumber: "2025/2097",
        reportType: "جنحة",
        governorate: "الدقهليه",
        district: "ثان المنصورة",
        firstInstanceCourtLocation: "المنصورة",
        firstSessionDate: "2025-06-17",
        postponementDate: null,
        postponementReason: null,
        ruling: "غ شهر و ك 500ج",
        inventoryNumber: "2971/2025",
        firstInstanceCourtNotes: null,
        oppositionSessionDate: null,
        oppositionRuling: null,
        oppositionInventoryNumber: null,
        firstAppealSessionDate: null,
        appealCourtLocation: null,
        clientAppealNumber: null,
        appealRulingText: null,
        appealInventoryNumber: null,
        appealOppositionDate: null,
        appealOppositionRuling: null,
        appealOppositionInventoryNumber: null,
        settlementMailDate: null,
        settlementConfirmationDate: null,
        debtDocumentReturnDate: null,
        debtDocumentReturnReason: null,
        depositReceiptStatus: "بالمكتب",
        checkNumber: null,
        checkRejectionReason: null,
        checkRejectionDate: null,
        powerOfAttorneyDetails: "توكيل رقم 2616ل لسنه 2023 توثيق الموسكى",
        updateDate: "2025-08-03",
        lastUpdateLawyer: "اسلام احمد",
        extract: "تم تقديم اصل الايصال",
        invoice: null,
        notes: null,
        sessionUpdate: "2025-06-17",
        required: null,
        report: null,
        archived: "أرشيف",
        paidCases: "تم الصرف شهر 8-2025",
        reportPreparationLawyer: "ناسي يوسف",
        sessionAttendanceLawyer: null,
        extractionLawyer: "محمد حسن",
        settlementLawyer: null,
        claimSent: null,
        receivingLawyer: "اسامه محمد",
        branchesReceipt: null,
        receiptDate: null,
        createdBy: "system",
        lastModifiedBy: null,
        lastModifiedDate: null,
      }
    ];

    initialRecords.forEach(record => {
      const id = randomUUID();
      const fullRecord: ValuRecord = { id, ...record };
      this.records.set(id, fullRecord);
    });
  }

  private initializeSampleUpdates() {
    const recordIds = Array.from(this.records.keys());
    if (recordIds.length === 0) return;

    const sampleUpdates: Omit<RecordUpdate, 'id'>[] = [
      {
        recordId: recordIds[0],
        updatedBy: "user",
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        fieldName: "notes",
        oldValue: null,
        newValue: "تم متابعة القضية مع المحكمة",
      },
      {
        recordId: recordIds[0],
        updatedBy: "user",
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        fieldName: "sessionUpdate",
        oldValue: null,
        newValue: "تم تأجيل الجلسة للأسبوع القادم",
      },
      {
        recordId: recordIds[1],
        updatedBy: "user",
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        fieldName: "extract",
        oldValue: "تم استخراج صورة رسمية من الحكم",
        newValue: "تم استخراج صورة رسمية من الحكم\nتم استلام المستخرج من المحكمة",
      },
      {
        recordId: recordIds[2],
        updatedBy: "user",
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        fieldName: "postponementReason",
        oldValue: null,
        newValue: "عدم حضور الخصم",
      },
    ];

    sampleUpdates.forEach(update => {
      this.createRecordUpdate(update);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role || "user"
    };
    this.users.set(id, user);
    return user;
  }

  async getAllRecords(): Promise<ValuRecord[]> {
    return Array.from(this.records.values()).sort((a, b) => a.serial - b.serial);
  }

  async getRecordById(id: string): Promise<ValuRecord | undefined> {
    return this.records.get(id);
  }

  async getRecordBySerial(serial: number): Promise<ValuRecord | undefined> {
    return Array.from(this.records.values()).find(r => r.serial === serial);
  }

  async updateRecord(id: string, updates: UpdateValuRecord, username: string): Promise<ValuRecord | undefined> {
    const record = this.records.get(id);
    if (!record) return undefined;

    const now = new Date().toISOString();

    // Track all changes
    for (const [key, newValue] of Object.entries(updates)) {
      if (key === 'lastModifiedBy' || key === 'lastModifiedDate') continue;
      
      const oldValue = record[key as keyof ValuRecord];
      const oldStr = oldValue === null || oldValue === undefined ? null : String(oldValue);
      const newStr = newValue === null || newValue === undefined ? null : String(newValue);
      
      // Record the change even if values are the same (to track all update attempts)
      if (oldStr !== newStr) {
        await this.createRecordUpdate({
          recordId: id,
          updatedBy: username,
          updatedAt: now,
          fieldName: key,
          oldValue: oldStr,
          newValue: newStr,
        });
      }
    }

    const updatedRecord: ValuRecord = {
      ...record,
      ...updates,
      lastModifiedBy: username,
      lastModifiedDate: now,
    };

    this.records.set(id, updatedRecord);
    return updatedRecord;
  }

  async getRecordUpdates(recordId: string): Promise<RecordUpdate[]> {
    return this.recordUpdates.get(recordId) || [];
  }

  async getAllRecordUpdates(): Promise<RecordUpdate[]> {
    const allUpdates: RecordUpdate[] = [];
    this.recordUpdates.forEach((updates) => {
      allUpdates.push(...updates);
    });
    return allUpdates.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async createRecordUpdate(update: Omit<RecordUpdate, 'id'>): Promise<RecordUpdate> {
    const id = randomUUID();
    const fullUpdate: RecordUpdate = { id, ...update };

    const existingUpdates = this.recordUpdates.get(update.recordId) || [];
    existingUpdates.push(fullUpdate);
    this.recordUpdates.set(update.recordId, existingUpdates);

    return fullUpdate;
  }
}

import { SheetStorage } from "./sheetStorage";

export const storage = new SheetStorage();