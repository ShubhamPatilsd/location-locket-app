import { useAuth, Clerk } from "@clerk/clerk-expo";
import {
  AbstractPowerSyncDatabase,
  CrudEntry,
  PowerSyncBackendConnector,
  UpdateType,
} from "@journeyapps/powersync-sdk-react-native";
import { AppConfig } from "../AppConfig";
import { ApiClient } from "./ApiClient";

/// Postgres Response codes that we cannot recover from by retrying.
const FATAL_RESPONSE_CODES = [
  // Class 22 — Data Exception
  // Examples include data type mismatch.
  new RegExp("^22...$"),
  // Class 23 — Integrity Constraint Violation.
  // Examples include NOT NULL, FOREIGN KEY and UNIQUE violations.
  new RegExp("^23...$"),
  // INSUFFICIENT PRIVILEGE - typically a row-level security violation
  new RegExp("^42501$"),
];

export class ExpressConnector implements PowerSyncBackendConnector {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient(AppConfig.apiUrl);
  }

  async fetchCredentials() {
    const token = await Clerk.session?.getToken();
    if (!token) throw new Error("User does not have session");

    return await this.apiClient.getToken(token);
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) return;

    let lastOp: CrudEntry | null = null;
    try {
      for (let op of transaction.crud) {
        lastOp = op;
        const record = { table: op.table, data: { ...op.opData, id: op.id } };
        switch (op.op) {
          case UpdateType.PUT:
            await this.apiClient.upsert(record);
            break;
          case UpdateType.PATCH:
            await this.apiClient.update(record);
            break;
          case UpdateType.DELETE:
            await this.apiClient.delete(record);
            break;
        }
      }

      await transaction.complete();
    } catch (ex: any) {
      console.debug(ex);
      if (typeof ex.code == "string" && FATAL_RESPONSE_CODES.some((regex) => regex.test(ex.code))) {
        console.error(`Data upload error - discarding ${lastOp}`, ex);
        await transaction.complete();
      } else {
        throw ex;
      }
    }
  }
}
