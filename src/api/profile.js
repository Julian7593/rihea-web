import { apiContracts } from "./contracts";
import { apiRequest, hasRemoteApi } from "./client";

const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

const mockDb = {
  profile: {
    name: "Yiting",
    pregnancyWeek: "24+3",
    progress: 61,
    dueDate: "2026-06-08",
    datingMethod: "dueDate",
    lmpDate: "",
    cycleLength: 28,
    ivfTransferDate: "",
    embryoAgeDays: 5,
    riskLevel: "low",
    partnerSync: true,
    city: "Shenzhen",
    phone: "",
  },
  privacy: {
    privateMode: false,
    shareForResearch: false,
  },
  support: {
    slots: [
      { id: "slot-1", label: "Today 19:30 - Online counseling" },
      { id: "slot-2", label: "Tomorrow 10:00 - Breathing coach" },
      { id: "slot-3", label: "Friday 15:00 - Clinical follow-up" },
    ],
    faqs: [
      { id: "faq-1", title: "How to check in daily", desc: "Complete mood + trigger + one-line note." },
      { id: "faq-2", title: "How partner sync works", desc: "Enable partner sync in quick settings." },
      { id: "faq-3", title: "How to export report", desc: "Use export button in health records page." },
    ],
    version: "v1.0.0",
    contacts: [
      { id: "ec-1", title: "Primary emergency contact", phone: "+86 138-0000-0000" },
      { id: "ec-2", title: "Hospital hotline", phone: "400-000-1120" },
    ],
  },
  fetalMovements: {
    records: [],
  },
};

export async function fetchProfileOverview(options = {}) {
  if (hasRemoteApi) {
    return apiRequest(apiContracts.profile.getOverview, options);
  }
  await wait();
  return { ...mockDb.profile };
}

export async function patchProfileName(name, options = {}) {
  if (hasRemoteApi) {
    return apiRequest(apiContracts.profile.updateName, {
      ...options,
      body: { name },
    });
  }
  await wait();
  mockDb.profile.name = name;
  return { name };
}

export async function patchProfileBasic(payload, options = {}) {
  if (hasRemoteApi) {
    return apiRequest(apiContracts.profile.updateBasic, {
      ...options,
      body: payload,
    });
  }
  await wait();
  mockDb.profile = {
    ...mockDb.profile,
    ...payload,
  };
  return {
    name: mockDb.profile.name,
    dueDate: mockDb.profile.dueDate,
    pregnancyWeek: mockDb.profile.pregnancyWeek,
    datingMethod: mockDb.profile.datingMethod,
    lmpDate: mockDb.profile.lmpDate,
    cycleLength: mockDb.profile.cycleLength,
    ivfTransferDate: mockDb.profile.ivfTransferDate,
    embryoAgeDays: mockDb.profile.embryoAgeDays,
    city: mockDb.profile.city || "",
    phone: mockDb.profile.phone || "",
  };
}

export async function fetchRecordSummary(checkIns, options = {}) {
  if (hasRemoteApi) {
    return apiRequest(apiContracts.records.getSummary, options);
  }
  await wait(160);
  const latest = checkIns[0];
  const inMonth = checkIns.filter((item) => item.date.slice(0, 7) === new Date().toISOString().slice(0, 7)).length;
  return {
    monthCompletions: inMonth,
    comfortDoneRate: Math.min(95, 58 + inMonth * 2),
    latestMoodIndex: latest ? latest.mood : null,
  };
}

const getMovementStatus = (todayCount) => {
  if (todayCount <= 0) return "unknown";
  if (todayCount < 3) return "need_attention";
  return "normal";
};

const buildFetalMovementSummary = () => {
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayRecords = mockDb.fetalMovements.records.filter((item) => item.recordedAt.slice(0, 10) === todayKey);
  const latest = mockDb.fetalMovements.records[0] || null;
  return {
    todayCount: todayRecords.length,
    lastRecordedAt: latest ? latest.recordedAt : null,
    status: getMovementStatus(todayRecords.length),
  };
};

export async function fetchFetalMovementSummary(options = {}) {
  if (hasRemoteApi) {
    return apiRequest(apiContracts.records.getFetalMovementSummary, options);
  }
  await wait(140);
  return buildFetalMovementSummary();
}

export async function fetchFetalMovementRecords(days = 7, options = {}) {
  if (hasRemoteApi) {
    const queryDays = Number.isFinite(Number(days)) ? Number(days) : 7;
    return apiRequest(
      {
        ...apiContracts.records.getFetalMovementRecords,
        path: `${apiContracts.records.getFetalMovementRecords.path}?days=${encodeURIComponent(queryDays)}`,
      },
      options
    );
  }
  await wait(130);
  const countDays = Number.isFinite(Number(days)) ? Number(days) : 7;
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - Math.max(0, countDays - 1));
  const thresholdTime = threshold.getTime();
  const records = mockDb.fetalMovements.records.filter((item) => {
    const t = new Date(item.recordedAt).getTime();
    return Number.isFinite(t) && t >= thresholdTime;
  });
  return { records };
}

export async function createFetalMovementRecord(payload = {}, options = {}) {
  if (hasRemoteApi) {
    return apiRequest(apiContracts.records.createFetalMovementRecord, {
      ...options,
      body: payload,
    });
  }
  await wait(160);
  const recordedAt = new Date().toISOString();
  const record = {
    id: `fm-${Date.now()}`,
    recordedAt,
    source: payload?.source || "home_card",
    weekLabel: payload?.weekLabel || "",
    note: payload?.note || "",
  };
  mockDb.fetalMovements.records = [record, ...mockDb.fetalMovements.records];
  const summary = buildFetalMovementSummary();
  return {
    id: record.id,
    recordedAt,
    todayCount: summary.todayCount,
  };
}

export async function patchFetalMovementRecord(id, payload = {}, options = {}) {
  if (hasRemoteApi) {
    const path = apiContracts.records.updateFetalMovementRecord.path.replace("{id}", encodeURIComponent(id));
    return apiRequest(
      {
        ...apiContracts.records.updateFetalMovementRecord,
        path,
      },
      {
        ...options,
        body: payload,
      }
    );
  }
  await wait(150);
  const index = mockDb.fetalMovements.records.findIndex((item) => item.id === id);
  if (index < 0) {
    throw new Error("Movement record not found.");
  }
  const note = typeof payload?.note === "string" ? payload.note : "";
  const updatedAt = new Date().toISOString();
  mockDb.fetalMovements.records[index] = {
    ...mockDb.fetalMovements.records[index],
    note,
    updatedAt,
  };
  return {
    id,
    note,
    updatedAt,
  };
}

export async function fetchPrivacySettings(options = {}) {
  if (hasRemoteApi) {
    return apiRequest(apiContracts.privacy.getSettings, options);
  }
  await wait();
  return { ...mockDb.privacy };
}

export async function patchPrivacySettings(partial, options = {}) {
  if (hasRemoteApi) {
    return apiRequest(apiContracts.privacy.updateSettings, {
      ...options,
      body: partial,
    });
  }
  await wait(160);
  mockDb.privacy = {
    ...mockDb.privacy,
    ...partial,
  };
  return { ...mockDb.privacy };
}

export async function fetchCounselingSlots(options = {}) {
  if (hasRemoteApi) {
    return apiRequest(apiContracts.support.getCounselingSlots, options);
  }
  await wait();
  return { slots: [...mockDb.support.slots] };
}

export async function fetchHelpCenter(options = {}) {
  if (hasRemoteApi) {
    return apiRequest(apiContracts.support.getHelpCenter, options);
  }
  await wait();
  return {
    version: mockDb.support.version,
    faqs: [...mockDb.support.faqs],
  };
}

export async function fetchEmergencyContacts(options = {}) {
  if (hasRemoteApi) {
    return apiRequest(apiContracts.support.getEmergencyContacts, options);
  }
  await wait();
  return { contacts: [...mockDb.support.contacts] };
}
