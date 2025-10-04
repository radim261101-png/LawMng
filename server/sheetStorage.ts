import { type User, type InsertUser, type ValuRecord, type UpdateValuRecord, type RecordUpdate } from "@shared/schema";
import { randomUUID } from "crypto";
import { getSheetData, updateRowInSheet } from "./googleSheets";
import type { IStorage } from "./storage";

export class SheetStorage implements IStorage {
  private users: Map<string, User>;
  private recordUpdates: Map<string, RecordUpdate[]>;
  private cachedRecords: ValuRecord[] | null = null;
  private lastFetchTime: number = 0;
  private CACHE_DURATION = 120000;

  constructor() {
    this.users = new Map();
    this.recordUpdates = new Map();
    this.initializeUsers();
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

  private parseSheetRowToRecord(row: any[], rowIndex: number): ValuRecord | null {
    if (!row || row.length === 0) return null;

    const serial = parseInt(row[0]?.toString().trim() || '0');
    if (isNaN(serial) || serial === 0) return null;

    return {
      id: `sheet-row-${rowIndex}`,
      serial: serial,
      company: row[1] || null,
      accountNumber: row[2] || null,
      clientName: row[3] || null,
      nationalId: row[4] || null,
      legalAgent: row[6] || null,
      litigationLevel: row[7] || null,
      receiptDateFromCompany: row[8] || null,
      documentType: null,
      attachedDocumentsCount: null,
      documentValue: row[9] || null,
      reportDate: row[11] || null,
      crimeNumber: row[34] || null,
      reportType: row[46] || null,
      governorate: row[37] || null,
      district: row[19] || null,
      firstInstanceCourtLocation: row[36] || null,
      firstSessionDate: row[38] || null,
      postponementDate: row[44] || null,
      postponementReason: row[45] || null,
      ruling: row[48] || null,
      inventoryNumber: row[27] || null,
      firstInstanceCourtNotes: null,
      oppositionSessionDate: null,
      oppositionRuling: null,
      oppositionInventoryNumber: null,
      firstAppealSessionDate: row[53] || null,
      appealCourtLocation: row[52] || null,
      clientAppealNumber: row[49] || null,
      appealRulingText: row[56] || null,
      appealInventoryNumber: row[54] || null,
      appealOppositionDate: row[55] || null,
      appealOppositionRuling: row[56] || null,
      appealOppositionInventoryNumber: row[57] || null,
      settlementMailDate: row[58] || null,
      settlementConfirmationDate: row[59] || null,
      debtDocumentReturnDate: row[61] || null,
      debtDocumentReturnReason: row[62] || null,
      depositReceiptStatus: null,
      checkNumber: row[76] || null,
      checkRejectionReason: row[77] || null,
      checkRejectionDate: row[78] || null,
      powerOfAttorneyDetails: row[63] || null,
      updateDate: row[60] || null,
      lastUpdateLawyer: row[61] || null,
      extract: row[64] || null,
      invoice: row[71] || null,
      notes: row[72] || null,
      sessionUpdate: row[65] || null,
      required: row[66] || null,
      report: row[73] || null,
      archived: row[74] || null,
      paidCases: row[83] || null,
      reportPreparationLawyer: null,
      sessionAttendanceLawyer: null,
      extractionLawyer: row[75] || null,
      settlementLawyer: null,
      claimSent: row[81] || null,
      receivingLawyer: row[86] || null,
      branchesReceipt: row[69] || null,
      receiptDate: row[70] || null,
      createdBy: "sheet",
      lastModifiedBy: null,
      lastModifiedDate: null,
    };
  }

  private async fetchRecordsFromSheet(): Promise<ValuRecord[]> {
    const now = Date.now();
    if (this.cachedRecords && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.cachedRecords;
    }

    const data = await getSheetData();
    const records: ValuRecord[] = [];

    for (let i = 1; i < data.length; i++) {
      const record = this.parseSheetRowToRecord(data[i], i + 1);
      if (record) {
        records.push(record);
      }
    }

    this.cachedRecords = records;
    this.lastFetchTime = now;
    return records;
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
    const records = await this.fetchRecordsFromSheet();
    return records.sort((a, b) => a.serial - b.serial);
  }

  async getRecordById(id: string): Promise<ValuRecord | undefined> {
    const records = await this.fetchRecordsFromSheet();
    return records.find(r => r.id === id);
  }

  async getRecordBySerial(serial: number): Promise<ValuRecord | undefined> {
    const records = await this.fetchRecordsFromSheet();
    return records.find(r => r.serial === serial);
  }

  private recordToSheetRow(record: ValuRecord): any[] {
    const row = new Array(90).fill('');
    
    row[0] = record.serial?.toString() || '';
    row[1] = record.company || '';
    row[2] = record.accountNumber || '';
    row[3] = record.clientName || '';
    row[4] = record.nationalId || '';
    row[6] = record.legalAgent || '';
    row[7] = record.litigationLevel || '';
    row[8] = record.receiptDateFromCompany || '';
    row[9] = record.documentValue || '';
    row[11] = record.reportDate || '';
    row[19] = record.district || '';
    row[27] = record.inventoryNumber || '';
    row[34] = record.crimeNumber || '';
    row[36] = record.firstInstanceCourtLocation || '';
    row[37] = record.governorate || '';
    row[38] = record.firstSessionDate || '';
    row[44] = record.postponementDate || '';
    row[45] = record.postponementReason || '';
    row[46] = record.reportType || '';
    row[48] = record.ruling || '';
    row[49] = record.clientAppealNumber || '';
    row[52] = record.appealCourtLocation || '';
    row[53] = record.firstAppealSessionDate || '';
    row[54] = record.appealInventoryNumber || '';
    row[55] = record.appealOppositionDate || '';
    row[56] = record.appealRulingText || '';
    row[57] = record.appealOppositionInventoryNumber || '';
    row[58] = record.settlementMailDate || '';
    row[59] = record.settlementConfirmationDate || '';
    row[60] = record.updateDate || '';
    row[61] = record.lastUpdateLawyer || '';
    row[62] = record.debtDocumentReturnReason || '';
    row[63] = record.powerOfAttorneyDetails || '';
    row[64] = record.extract || '';
    row[65] = record.sessionUpdate || '';
    row[66] = record.required || '';
    row[69] = record.branchesReceipt || '';
    row[70] = record.receiptDate || '';
    row[71] = record.invoice || '';
    row[72] = record.notes || '';
    row[73] = record.report || '';
    row[74] = record.archived || '';
    row[75] = record.extractionLawyer || '';
    row[76] = record.checkNumber || '';
    row[77] = record.checkRejectionReason || '';
    row[78] = record.checkRejectionDate || '';
    row[81] = record.claimSent || '';
    row[83] = record.paidCases || '';
    row[86] = record.receivingLawyer || '';
    
    return row;
  }

  async updateRecord(id: string, updates: UpdateValuRecord, username: string): Promise<ValuRecord | undefined> {
    const record = await this.getRecordById(id);
    if (!record) return undefined;

    const now = new Date().toISOString();

    for (const [key, newValue] of Object.entries(updates)) {
      if (key === 'lastModifiedBy' || key === 'lastModifiedDate') continue;
      
      const oldValue = record[key as keyof ValuRecord];
      const oldStr = oldValue === null || oldValue === undefined ? null : String(oldValue);
      const newStr = newValue === null || newValue === undefined ? null : String(newValue);
      
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

    const rowMatch = id.match(/sheet-row-(\d+)/);
    if (rowMatch) {
      const rowIndex = parseInt(rowMatch[1]);
      const rowData = this.recordToSheetRow(updatedRecord);
      
      try {
        await updateRowInSheet(rowIndex, rowData);
      } catch (error) {
        console.error('Failed to update Google Sheet:', error);
      }
    }

    this.cachedRecords = null;

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
