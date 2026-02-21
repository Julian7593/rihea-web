/**
 * API contract registry for profile/account/support modules.
 * Keep this file in sync with backend docs.
 */
export const apiContracts = {
  profile: {
    getOverview: {
      method: "GET",
      path: "/v1/profile/overview",
      responseShape: {
        name: "string",
        pregnancyWeek: "string",
        progress: "number",
        dueDate: "string",
        datingMethod: "dueDate|lmp|ivf?",
        lmpDate: "string?",
        cycleLength: "number?",
        ivfTransferDate: "string?",
        embryoAgeDays: "3|5?",
        riskLevel: "low|medium|high",
        partnerSync: "boolean",
      },
    },
    updateName: {
      method: "PATCH",
      path: "/v1/profile/name",
      requestShape: { name: "string" },
      responseShape: { name: "string" },
    },
    updateBasic: {
      method: "PATCH",
      path: "/v1/profile/basic",
      requestShape: {
        name: "string",
        dueDate: "string",
        pregnancyWeek: "string?",
        datingMethod: "dueDate|lmp|ivf?",
        lmpDate: "string?",
        cycleLength: "number?",
        ivfTransferDate: "string?",
        embryoAgeDays: "3|5?",
        city: "string?",
        phone: "string?",
        language: "zh|en?",
      },
      responseShape: {
        name: "string",
        dueDate: "string",
        pregnancyWeek: "string",
        datingMethod: "dueDate|lmp|ivf?",
        lmpDate: "string?",
        cycleLength: "number?",
        ivfTransferDate: "string?",
        embryoAgeDays: "3|5?",
        city: "string",
        phone: "string",
      },
    },
  },
  records: {
    getSummary: {
      method: "GET",
      path: "/v1/records/summary",
      responseShape: {
        monthCompletions: "number",
        comfortDoneRate: "number",
        latestMoodIndex: "number|null",
      },
    },
    getFetalMovementSummary: {
      method: "GET",
      path: "/v1/records/fetal-movements/summary",
      responseShape: {
        todayCount: "number",
        lastRecordedAt: "ISODateTime|null",
        status: "normal|need_attention|unknown",
      },
    },
    getFetalMovementRecords: {
      method: "GET",
      path: "/v1/records/fetal-movements",
      requestShape: {
        days: "number?",
      },
      responseShape: {
        records: "Array<{id:string,recordedAt:ISODateTime,source:string,weekLabel:string,note?:string}>",
      },
    },
    createFetalMovementRecord: {
      method: "POST",
      path: "/v1/records/fetal-movements",
      requestShape: {
        source: "home_card|detail_page|other",
        weekLabel: "string",
        note: "string?",
      },
      responseShape: {
        id: "string",
        recordedAt: "ISODateTime",
        todayCount: "number",
      },
    },
    updateFetalMovementRecord: {
      method: "PATCH",
      path: "/v1/records/fetal-movements/{id}",
      requestShape: {
        note: "string?",
      },
      responseShape: {
        id: "string",
        note: "string",
        updatedAt: "ISODateTime",
      },
    },
  },
  privacy: {
    getSettings: {
      method: "GET",
      path: "/v1/privacy/settings",
      responseShape: {
        privateMode: "boolean",
        shareForResearch: "boolean",
      },
    },
    updateSettings: {
      method: "PATCH",
      path: "/v1/privacy/settings",
      requestShape: {
        privateMode: "boolean?",
        shareForResearch: "boolean?",
      },
      responseShape: {
        privateMode: "boolean",
        shareForResearch: "boolean",
      },
    },
  },
  support: {
    getCounselingSlots: {
      method: "GET",
      path: "/v1/support/counseling-slots",
      responseShape: {
        slots: "Array<{id:string,label:string}>",
      },
    },
    getHelpCenter: {
      method: "GET",
      path: "/v1/support/help-center",
      responseShape: {
        version: "string",
        faqs: "Array<{id:string,title:string,desc:string}>",
      },
    },
    getEmergencyContacts: {
      method: "GET",
      path: "/v1/support/emergency-contacts",
      responseShape: {
        contacts: "Array<{id:string,title:string,phone:string}>",
      },
    },
  },
};
