// Net Worth: Assets, Liabilities, Snapshots
import { prisma } from "./client";

export interface AssetRecord {
  id: string;
  label: string;
  value: number;
  type: string;
  currency: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LiabilityRecord {
  id: string;
  label: string;
  balance: number;
  type: string;
  currency: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NetWorthSnapshotRecord {
  id: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  createdAt: string;
}

export interface CreateAssetInput {
  label: string;
  value: number;
  type: string;
  currency?: string;
  note?: string | null;
  userEmail: string;
}

export interface CreateLiabilityInput {
  label: string;
  balance: number;
  type: string;
  currency?: string;
  note?: string | null;
  userEmail: string;
}

// ── Assets ────────────────────────────────────────────────────────────────────

export async function createAsset(input: CreateAssetInput): Promise<AssetRecord> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: input.userEmail } });
  const asset = await prisma.asset.create({
    data: {
      label: input.label,
      value: input.value,
      type: input.type,
      currency: input.currency ?? "EUR",
      note: input.note ?? null,
      userId: user.id,
    },
  });
  return mapAsset(asset);
}

export async function getAssets(userEmail: string): Promise<AssetRecord[]> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });
  const assets = await prisma.asset.findMany({
    where: { userId: user.id },
    orderBy: { value: "desc" },
  });
  return assets.map(mapAsset);
}

export async function updateAsset(
  id: string,
  userEmail: string,
  data: { label?: string; value?: number; type?: string; note?: string | null },
): Promise<AssetRecord> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });
  const asset = await prisma.asset.update({
    where: { id, userId: user.id },
    data,
  });
  return mapAsset(asset);
}

export async function deleteAsset(id: string, userEmail: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });
  await prisma.asset.delete({ where: { id, userId: user.id } });
}

// ── Liabilities ───────────────────────────────────────────────────────────────

export async function createLiability(input: CreateLiabilityInput): Promise<LiabilityRecord> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: input.userEmail } });
  const liability = await prisma.liability.create({
    data: {
      label: input.label,
      balance: input.balance,
      type: input.type,
      currency: input.currency ?? "EUR",
      note: input.note ?? null,
      userId: user.id,
    },
  });
  return mapLiability(liability);
}

export async function getLiabilities(userEmail: string): Promise<LiabilityRecord[]> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });
  const items = await prisma.liability.findMany({
    where: { userId: user.id },
    orderBy: { balance: "desc" },
  });
  return items.map(mapLiability);
}

export async function updateLiability(
  id: string,
  userEmail: string,
  data: { label?: string; balance?: number; type?: string; note?: string | null },
): Promise<LiabilityRecord> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });
  const liability = await prisma.liability.update({
    where: { id, userId: user.id },
    data,
  });
  return mapLiability(liability);
}

export async function deleteLiability(id: string, userEmail: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });
  await prisma.liability.delete({ where: { id, userId: user.id } });
}

// ── Snapshots ─────────────────────────────────────────────────────────────────

export async function saveNetWorthSnapshot(userEmail: string): Promise<NetWorthSnapshotRecord> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });

  // Only one snapshot per calendar day
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const existing = await prisma.netWorthSnapshot.findFirst({
    where: { userId: user.id, createdAt: { gte: todayStart } },
    orderBy: { createdAt: "desc" },
  });

  const [assets, liabilities] = await Promise.all([
    prisma.asset.findMany({ where: { userId: user.id } }),
    prisma.liability.findMany({ where: { userId: user.id } }),
  ]);

  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  if (existing) {
    const updated = await prisma.netWorthSnapshot.update({
      where: { id: existing.id },
      data: { totalAssets, totalLiabilities, netWorth },
    });
    return mapSnapshot(updated);
  }

  const snapshot = await prisma.netWorthSnapshot.create({
    data: { userId: user.id, totalAssets, totalLiabilities, netWorth },
  });
  return mapSnapshot(snapshot);
}

export async function getNetWorthHistory(
  userEmail: string,
  limit = 12,
): Promise<NetWorthSnapshotRecord[]> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });
  const snapshots = await prisma.netWorthSnapshot.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return snapshots.reverse().map(mapSnapshot);
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapAsset(a: {
  id: string; label: string; value: number; type: string;
  currency: string; note: string | null; createdAt: Date; updatedAt: Date;
}): AssetRecord {
  return {
    id: a.id, label: a.label, value: a.value, type: a.type,
    currency: a.currency, note: a.note,
    createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString(),
  };
}

function mapLiability(l: {
  id: string; label: string; balance: number; type: string;
  currency: string; note: string | null; createdAt: Date; updatedAt: Date;
}): LiabilityRecord {
  return {
    id: l.id, label: l.label, balance: l.balance, type: l.type,
    currency: l.currency, note: l.note,
    createdAt: l.createdAt.toISOString(), updatedAt: l.updatedAt.toISOString(),
  };
}

function mapSnapshot(s: {
  id: string; totalAssets: number; totalLiabilities: number;
  netWorth: number; createdAt: Date;
}): NetWorthSnapshotRecord {
  return {
    id: s.id, totalAssets: s.totalAssets,
    totalLiabilities: s.totalLiabilities, netWorth: s.netWorth,
    createdAt: s.createdAt.toISOString(),
  };
}
