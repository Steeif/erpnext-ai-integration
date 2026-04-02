import { eq, and, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, erpnextConnections, erpnextDataCache } from "../drizzle/schema";
import { ENV } from './_core/env';
import { encryptCredential, decryptCredential } from "./crypto";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getERPNextConnection(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(erpnextConnections)
    .where(eq(erpnextConnections.userId, userId))
    .limit(1);

  if (result.length === 0) return undefined;

  const connection = result[0];
  // Decrypt credentials when retrieving
  return {
    ...connection,
    apiKey: decryptCredential(connection.apiKey),
    apiSecret: decryptCredential(connection.apiSecret),
  };
}

export async function createERPNextConnection(
  userId: number,
  erpnextUrl: string,
  apiKey: string,
  apiSecret: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Encrypt credentials before storing
  const encryptedApiKey = encryptCredential(apiKey);
  const encryptedApiSecret = encryptCredential(apiSecret);

  const result = await db.insert(erpnextConnections).values({
    userId,
    erpnextUrl,
    apiKey: encryptedApiKey,
    apiSecret: encryptedApiSecret,
  });

  return result;
}

export async function updateERPNextConnectionTest(connectionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(erpnextConnections)
    .set({ lastTestedAt: new Date() })
    .where(eq(erpnextConnections.id, connectionId));
}

export async function getCachedERPNextData(
  connectionId: number,
  verifiedUserId: string,
  doctype: string
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(erpnextDataCache)
    .where(
      and(
        eq(erpnextDataCache.connectionId, connectionId),
        eq(erpnextDataCache.verifiedUserId, verifiedUserId),
        eq(erpnextDataCache.doctype, doctype),
        gt(erpnextDataCache.expiresAt, new Date())
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function cacheERPNextData(
  connectionId: number,
  userId: number,
  verifiedUserId: string,
  doctype: string,
  data: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour cache

  await db.insert(erpnextDataCache).values({
    connectionId,
    userId,
    verifiedUserId,
    doctype,
    data,
    expiresAt,
  });
}

