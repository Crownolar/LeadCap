// /**
//  * LEDAcap Role & Permission Registry
//  *
//  * IMPORTANT:
//  * These permissions control frontend navigation and UI visibility.
//  * They are NOT a replacement for backend authorization.
//  *
//  * The backend remains the authoritative security boundary.
//  */

// /* -------------------------------------------------------------------------- */
// /* Roles                                                                      */
// /* -------------------------------------------------------------------------- */

// /**
//  * These values intentionally match the role values currently used by
//  * the LEDAcap backend/application.
//  */
// export const ROLES = {
//   SUPERADMIN: "superadmin",

//   DATA_COLLECTOR: "datacollector",

//   SUPERVISOR: "supervisor",

//   HEAD_RESEARCHER: "headresearcher",

//   LAB_ANALYST: "labanalyst",

//   FMOH: "policymakerfmohsw",

//   NAFDAC: "policymakernafdac",

//   SON: "policymakerson",

//   RTSL: "policymakerresolve",

//   UNIVERSITY: "policymakeruniversity",
// };

// /* -------------------------------------------------------------------------- */
// /* Role metadata                                                              */
// /* -------------------------------------------------------------------------- */

// export const ROLE_METADATA = {
//   [ROLES.SUPERADMIN]: {
//     label: "Superadmin",
//     description: "Overall platform administration",
//   },

//   [ROLES.DATA_COLLECTOR]: {
//     label: "Data Collector",
//     description: "Sample collection and result entry",
//   },

//   [ROLES.SUPERVISOR]: {
//     label: "Supervisor",
//     description: "Collector management and sample review",
//   },

//   [ROLES.HEAD_RESEARCHER]: {
//     label: "Head Researcher",
//     description: "Research oversight and national analysis",
//   },

//   [ROLES.LAB_ANALYST]: {
//     label: "Lab Analyst",
//     description: "Laboratory confirmation and AAS analysis",
//   },

//   [ROLES.FMOH]: {
//     label: "Ministry of Health",
//     description: "National health policy intelligence",
//   },

//   [ROLES.NAFDAC]: {
//     label: "NAFDAC",
//     description: "Registry and regulatory verification",
//   },

//   [ROLES.SON]: {
//     label: "SON",
//     description: "Regulatory enforcement and product compliance",
//   },

//   [ROLES.RTSL]: {
//     label: "Resolve to Save Lives",
//     description: "Strategic cross-region analytics",
//   },

//   [ROLES.UNIVERSITY]: {
//     label: "University",
//     description: "Research and statistical modeling",
//   },
// };

// /* -------------------------------------------------------------------------- */
// /* Role normalization                                                          */
// /* -------------------------------------------------------------------------- */

// /**
//  * Normalizes role strings so values such as:
//  *
//  *   "Head Researcher"
//  *   "head-researcher"
//  *   "HEAD_RESEARCHER"
//  *   "head.researcher"
//  *
//  * can be compared consistently.
//  */
// export const normalizeRole = (role = "") =>
//   String(role)
//     .trim()
//     .toLowerCase()
//     .replace(/[\s_.-]/g, "");

// /**
//  * Convert a role to the canonical LEDAcap backend role.
//  */
// export const getCanonicalRole = (role = "") => {
//   const normalized = normalizeRole(role);

//   const roleMap = {
//     superadmin: ROLES.SUPERADMIN,

//     datacollector: ROLES.DATA_COLLECTOR,

//     supervisor: ROLES.SUPERVISOR,

//     headresearcher: ROLES.HEAD_RESEARCHER,

//     labanalyst: ROLES.LAB_ANALYST,

//     policymakerfmohsw: ROLES.FMOH,

//     policymakernafdac: ROLES.NAFDAC,

//     policymakerson: ROLES.SON,

//     policymakerresolve: ROLES.RTSL,

//     policymakeruniversity: ROLES.UNIVERSITY,
//   };

//   return roleMap[normalized] || normalized;
// };

// /**
//  * Test whether a user has one of the supplied roles.
//  */
// export const hasRole = (userRole, allowedRoles = []) => {
//   if (!userRole || !Array.isArray(allowedRoles)) {
//     return false;
//   }

//   const canonicalUserRole = getCanonicalRole(userRole);

//   return allowedRoles.some(
//     (role) => getCanonicalRole(role) === canonicalUserRole,
//   );
// };

// /**
//  * Test whether a user has at least one role in a list.
//  */
// export const hasAnyRole = (userRole, allowedRoles = []) =>
//   hasRole(userRole, allowedRoles);

// /* -------------------------------------------------------------------------- */
// /* Route permissions                                                           */
// /* -------------------------------------------------------------------------- */

// export const ROUTE_PERMISSIONS = {
//   dashboard: Object.values(ROLES),

//   dataCollector: [
//     ROLES.SUPERADMIN,
//     ROLES.DATA_COLLECTOR,
//   ],

//   database: [
//     ROLES.SUPERADMIN,
//     ROLES.HEAD_RESEARCHER,
//     ROLES.SUPERVISOR,
//   ],

//   reports: [
//     ROLES.SUPERADMIN,
//     ROLES.HEAD_RESEARCHER,
//   ],

//   map: [
//     ROLES.SUPERADMIN,
//     ROLES.HEAD_RESEARCHER,
//     ROLES.SUPERVISOR,
//     ROLES.DATA_COLLECTOR,
//     ROLES.FMOH,
//     ROLES.NAFDAC,
//     ROLES.SON,
//     ROLES.RTSL,
//     ROLES.UNIVERSITY,
//   ],

//   thresholds: [
//     ROLES.SUPERADMIN,
//   ],

//   inviteCodes: [
//     ROLES.SUPERADMIN,
//     ROLES.HEAD_RESEARCHER,
//   ],

//   collectorManagement: [
//     ROLES.SUPERADMIN,
//     ROLES.SUPERVISOR,
//     ROLES.HEAD_RESEARCHER,
//   ],

//   sampleReview: [
//     ROLES.SUPERADMIN,
//     ROLES.SUPERVISOR,
//     ROLES.HEAD_RESEARCHER,
//   ],

//   lab: [
//     ROLES.SUPERADMIN,
//     ROLES.LAB_ANALYST,
//   ],

//   nafdac: [
//     ROLES.SUPERADMIN,
//     ROLES.NAFDAC,
//   ],

//   moh: [
//     ROLES.SUPERADMIN,
//     ROLES.FMOH,
//   ],

//   son: [
//     ROLES.SUPERADMIN,
//     ROLES.SON,
//   ],

//   policy: [
//     ROLES.SUPERADMIN,
//     ROLES.FMOH,
//     ROLES.NAFDAC,
//     ROLES.SON,
//     ROLES.RTSL,
//     ROLES.UNIVERSITY,
//   ],
// };

// /* -------------------------------------------------------------------------- */
// /* Action permissions                                                          */
// /* -------------------------------------------------------------------------- */

// export const ACTION_PERMISSIONS = {
//   CREATE_SAMPLE: [
//     ROLES.SUPERADMIN,
//     ROLES.DATA_COLLECTOR,
//   ],

//   ADD_SAMPLE_RESULT: [
//     ROLES.SUPERADMIN,
//     ROLES.DATA_COLLECTOR,
//   ],

//   UPDATE_SAMPLE_RESULT: [
//     ROLES.SUPERADMIN,
//     ROLES.DATA_COLLECTOR,
//   ],

//   MANAGE_COLLECTORS: [
//     ROLES.SUPERADMIN,
//     ROLES.SUPERVISOR,
//     ROLES.HEAD_RESEARCHER,
//   ],

//   REVIEW_SAMPLES: [
//     ROLES.SUPERADMIN,
//     ROLES.SUPERVISOR,
//     ROLES.HEAD_RESEARCHER,
//   ],

//   APPROVE_SAMPLE: [
//     ROLES.SUPERADMIN,
//     ROLES.SUPERVISOR,
//     ROLES.HEAD_RESEARCHER,
//   ],

//   REJECT_SAMPLE: [
//     ROLES.SUPERADMIN,
//     ROLES.SUPERVISOR,
//     ROLES.HEAD_RESEARCHER,
//   ],

//   FLAG_SAMPLE: [
//     ROLES.SUPERADMIN,
//     ROLES.SUPERVISOR,
//     ROLES.HEAD_RESEARCHER,
//   ],

//   LAB_ANALYSIS: [
//     ROLES.SUPERADMIN,
//     ROLES.LAB_ANALYST,
//   ],

//   MANAGE_INVITES: [
//     ROLES.SUPERADMIN,
//     ROLES.HEAD_RESEARCHER,
//   ],

//   MANAGE_THRESHOLDS: [
//     ROLES.SUPERADMIN,
//   ],
// };


/**
 * LEDAcap Role & Permission Registry
 *
 * IMPORTANT:
 * These permissions control frontend navigation and UI visibility.
 * They are NOT a replacement for backend authorization.
 *
 * The backend remains the authoritative security boundary.
 */

/* -------------------------------------------------------------------------- */
/* Roles                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * These values intentionally match the role values currently used by
 * the LEDAcap backend/application.
 */
export const ROLES = {
  SUPERADMIN: "superadmin",

  DATA_COLLECTOR: "datacollector",

  SUPERVISOR: "supervisor",

  HEAD_RESEARCHER: "headresearcher",

  LAB_ANALYST: "labanalyst",

  FMOH: "policymakerfmohsw",

  NAFDAC: "policymakernafdac",

  SON: "policymakerson",

  RTSL: "policymakerresolve",

  UNIVERSITY: "policymakeruniversity",
};

/* -------------------------------------------------------------------------- */
/* Role metadata                                                              */
/* -------------------------------------------------------------------------- */

export const ROLE_METADATA = {
  [ROLES.SUPERADMIN]: {
    label: "Superadmin",
    description: "Overall platform administration",
  },

  [ROLES.DATA_COLLECTOR]: {
    label: "Data Collector",
    description: "Sample collection and result entry",
  },

  [ROLES.SUPERVISOR]: {
    label: "Supervisor",
    description: "Collector management and sample review",
  },

  [ROLES.HEAD_RESEARCHER]: {
    label: "Head Researcher",
    description: "Research oversight and national analysis",
  },

  [ROLES.LAB_ANALYST]: {
    label: "Lab Analyst",
    description: "Laboratory confirmation and AAS analysis",
  },

  [ROLES.FMOH]: {
    label: "Ministry of Health",
    description: "National health policy intelligence",
  },

  [ROLES.NAFDAC]: {
    label: "NAFDAC",
    description: "Registry and regulatory verification",
  },

  [ROLES.SON]: {
    label: "SON",
    description: "Regulatory enforcement and product compliance",
  },

  [ROLES.RTSL]: {
    label: "Resolve to Save Lives",
    description: "Strategic cross-region analytics",
  },

  [ROLES.UNIVERSITY]: {
    label: "University",
    description: "Research and statistical modeling",
  },
};

/* -------------------------------------------------------------------------- */
/* Role normalization                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Normalizes role strings so values such as:
 *
 *   "Head Researcher"
 *   "head-researcher"
 *   "HEAD_RESEARCHER"
 *   "head.researcher"
 *
 * can be compared consistently.
 */
export const normalizeRole = (role = "") =>
  String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s_.-]/g, "");

/**
 * Convert a role to the canonical LEDAcap backend role.
 */
export const getCanonicalRole = (role = "") => {
  const normalized = normalizeRole(role);

  const roleMap = {
    superadmin: ROLES.SUPERADMIN,

    datacollector: ROLES.DATA_COLLECTOR,

    supervisor: ROLES.SUPERVISOR,

    headresearcher: ROLES.HEAD_RESEARCHER,

    labanalyst: ROLES.LAB_ANALYST,

    policymakerfmohsw: ROLES.FMOH,

    policymakernafdac: ROLES.NAFDAC,

    policymakerson: ROLES.SON,

    policymakerresolve: ROLES.RTSL,

    policymakeruniversity: ROLES.UNIVERSITY,
  };

  return roleMap[normalized] || normalized;
};

/**
 * Test whether a user has one of the supplied roles.
 */
export const hasRole = (userRole, allowedRoles = []) => {
  if (!userRole || !Array.isArray(allowedRoles)) {
    return false;
  }

  const canonicalUserRole = getCanonicalRole(userRole);

  return allowedRoles.some(
    (role) => getCanonicalRole(role) === canonicalUserRole,
  );
};

/**
 * Test whether a user has at least one role in a list.
 */
export const hasAnyRole = (userRole, allowedRoles = []) =>
  hasRole(userRole, allowedRoles);

/* -------------------------------------------------------------------------- */
/* Route permissions                                                           */
/* -------------------------------------------------------------------------- */

export const ROUTE_PERMISSIONS = {
  dashboard: Object.values(ROLES),

  dataCollector: [
    ROLES.SUPERADMIN,
    ROLES.DATA_COLLECTOR,
  ],

  database: [
    ROLES.SUPERADMIN,
    ROLES.HEAD_RESEARCHER,
    ROLES.SUPERVISOR,
  ],

  reports: [
    ROLES.SUPERADMIN,
    ROLES.HEAD_RESEARCHER,
  ],

  map: [
    ROLES.SUPERADMIN,
    ROLES.HEAD_RESEARCHER,
    ROLES.SUPERVISOR,
    ROLES.DATA_COLLECTOR,
    ROLES.FMOH,
    ROLES.NAFDAC,
    ROLES.SON,
    ROLES.RTSL,
  ],

  research: [
    ROLES.UNIVERSITY,
  ],

  thresholds: [
    ROLES.SUPERADMIN,
  ],

  inviteCodes: [
    ROLES.SUPERADMIN,
    ROLES.HEAD_RESEARCHER,
  ],

  collectorManagement: [
    ROLES.SUPERADMIN,
    ROLES.SUPERVISOR,
    ROLES.HEAD_RESEARCHER,
  ],

  sampleReview: [
    ROLES.SUPERADMIN,
    ROLES.SUPERVISOR,
    ROLES.HEAD_RESEARCHER,
  ],

  lab: [
    ROLES.SUPERADMIN,
    ROLES.LAB_ANALYST,
  ],

  nafdac: [
    ROLES.SUPERADMIN,
    ROLES.NAFDAC,
  ],

  moh: [
    ROLES.SUPERADMIN,
    ROLES.FMOH,
  ],

  son: [
    ROLES.SUPERADMIN,
    ROLES.SON,
  ],

  policy: [
    ROLES.SUPERADMIN,
    ROLES.FMOH,
    ROLES.NAFDAC,
    ROLES.SON,
    ROLES.RTSL,
    ROLES.UNIVERSITY,
  ],
};

/* -------------------------------------------------------------------------- */
/* Action permissions                                                          */
/* -------------------------------------------------------------------------- */

export const ACTION_PERMISSIONS = {
  CREATE_SAMPLE: [
    ROLES.SUPERADMIN,
    ROLES.DATA_COLLECTOR,
  ],

  ADD_SAMPLE_RESULT: [
    ROLES.SUPERADMIN,
    ROLES.DATA_COLLECTOR,
  ],

  UPDATE_SAMPLE_RESULT: [
    ROLES.SUPERADMIN,
    ROLES.DATA_COLLECTOR,
  ],

  MANAGE_COLLECTORS: [
    ROLES.SUPERADMIN,
    ROLES.SUPERVISOR,
    ROLES.HEAD_RESEARCHER,
  ],

  REVIEW_SAMPLES: [
    ROLES.SUPERADMIN,
    ROLES.SUPERVISOR,
    ROLES.HEAD_RESEARCHER,
  ],

  APPROVE_SAMPLE: [
    ROLES.SUPERADMIN,
    ROLES.SUPERVISOR,
    ROLES.HEAD_RESEARCHER,
  ],

  REJECT_SAMPLE: [
    ROLES.SUPERADMIN,
    ROLES.SUPERVISOR,
    ROLES.HEAD_RESEARCHER,
  ],

  FLAG_SAMPLE: [
    ROLES.SUPERADMIN,
    ROLES.SUPERVISOR,
    ROLES.HEAD_RESEARCHER,
  ],

  LAB_ANALYSIS: [
    ROLES.SUPERADMIN,
    ROLES.LAB_ANALYST,
  ],

  MANAGE_INVITES: [
    ROLES.SUPERADMIN,
    ROLES.HEAD_RESEARCHER,
  ],

  MANAGE_THRESHOLDS: [
    ROLES.SUPERADMIN,
  ],
};