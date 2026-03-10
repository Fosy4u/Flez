import mongoose from "mongoose";

type SeedDoc = {
  path: string;
  [key: string]: any;
};

type SeedOptions<T> = {
  model: mongoose.Model<any>;
  data: T[];
  matchField?: keyof T; // default = "path"
  logLabel?: string;
};

export async function runSeeder<T extends SeedDoc>({
  model,
  data,
  matchField = "path",
  logLabel = "Seeder",
}: SeedOptions<T>) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    console.log(`🌱 ${logLabel} started...`);

    // Duplicate check inside seed data
    const seen = new Set();
    for (const item of data) {
      const key = item[matchField as string];
      if (seen.has(key)) {
        throw new Error(`Duplicate ${String(matchField)}: ${key}`);
      }
      seen.add(key);
    }

    const ops = data.map((doc) => ({
      updateOne: {
        filter: { [matchField]: doc[matchField] },
        update: { $set: doc },
        upsert: true,
      },
    }));

    const result = await model.bulkWrite(ops, { session });

    await session.commitTransaction();

    console.log(`✅ ${logLabel} completed`);
    console.table({
      inserted: result.upsertedCount,
      modified: result.modifiedCount,
      matched: result.matchedCount,
    });

  } catch (err) {
    await session.abortTransaction();
    console.error(`❌ ${logLabel} failed`, err);
    throw err;
  } finally {
    session.endSession();
  }
}
