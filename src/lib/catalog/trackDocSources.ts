/**
 * Maps certification tracks to ServiceNowDocs publications and exam domains.
 * Used by agent prompts for batched question generation.
 *
 * @see https://github.com/ServiceNow/ServiceNowDocs (australia branch)
 */

export const SN_DOCS_BRANCH = 'australia' as const;

export const SN_DOCS_RAW_BASE = `https://raw.githubusercontent.com/ServiceNow/ServiceNowDocs/${SN_DOCS_BRANCH}/markdown`;

export type TrackDocDomain = {
	name: string;
	weight: string;
	publications: string[];
};

export type TrackDocSource = {
	trackCode: string;
	officialName: string;
	publications: string[];
	domains: TrackDocDomain[];
};

/** Build a raw GitHub markdown URL for a topic file within a publication. */
export function snDocsRawUrl(publication: string, filePath: string): string {
	const path = filePath.startsWith('/') ? filePath.slice(1) : filePath;
	return `${SN_DOCS_RAW_BASE}/${publication}/${path}`;
}

export const PHASE1_TRACK_DOC_SOURCES: TrackDocSource[] = [
	{
		trackCode: 'CSA',
		officialName: 'Certified System Administrator',
		publications: [
			'platform-administration',
			'now-platform',
			'platform-user-interface',
			'platform-security',
			'integrate-applications',
			'it-service-management',
			'knowledge-management'
		],
		domains: [
			{
				name: 'Platform Overview and Navigation',
				weight: '7%',
				publications: ['now-platform', 'platform-user-interface']
			},
			{
				name: 'Instance Configuration',
				weight: '10%',
				publications: ['platform-administration', 'now-platform']
			},
			{
				name: 'Configuring Applications for Collaboration',
				weight: '20%',
				publications: ['platform-user-interface', 'platform-administration']
			},
			{
				name: 'Self Service and Automation',
				weight: '20%',
				publications: ['it-service-management', 'knowledge-management', 'now-platform']
			},
			{
				name: 'Database Management and Platform Security',
				weight: '30%',
				publications: ['platform-security', 'platform-administration', 'integrate-applications']
			},
			{
				name: 'Data Migration and Integration',
				weight: '13%',
				publications: ['platform-administration', 'integrate-applications']
			}
		]
	},
	{
		trackCode: 'CAD',
		officialName: 'Certified Application Developer',
		publications: [
			'application-development',
			'hyperautomation-low-code',
			'build-workflows',
			'integrate-applications',
			'api-reference'
		],
		domains: [
			{
				name: 'Designing and Creating an Application',
				weight: '20%',
				publications: ['application-development', 'now-platform']
			},
			{
				name: 'Application User Interface',
				weight: '20%',
				publications: ['application-development', 'platform-user-interface']
			},
			{
				name: 'Security and Restricting Access',
				weight: '20%',
				publications: ['application-development', 'platform-security']
			},
			{
				name: 'Application Automation',
				weight: '20%',
				publications: ['application-development', 'hyperautomation-low-code', 'build-workflows']
			},
			{
				name: 'Working with External Data',
				weight: '10%',
				publications: ['integrate-applications', 'application-development']
			},
			{
				name: 'Managing Applications',
				weight: '10%',
				publications: ['application-development']
			}
		]
	},
	{
		trackCode: 'CIS-ITSM',
		officialName: 'Certified Implementation Specialist - IT Service Management',
		publications: ['it-service-management', 'it-operations-management'],
		domains: [
			{ name: 'Incident Management', weight: '25%', publications: ['it-service-management'] },
			{ name: 'Problem Management', weight: '15%', publications: ['it-service-management'] },
			{ name: 'Change Management', weight: '25%', publications: ['it-service-management'] },
			{
				name: 'Service Portfolio Management',
				weight: '5%',
				publications: ['it-service-management']
			},
			{
				name: 'Service Catalog and Request Management',
				weight: '25%',
				publications: ['it-service-management']
			},
			{
				name: 'Configuration Management Database',
				weight: '5%',
				publications: ['it-operations-management']
			}
		]
	}
];

export function getTrackDocSource(trackCode: string): TrackDocSource | undefined {
	return PHASE1_TRACK_DOC_SOURCES.find((t) => t.trackCode === trackCode);
}

/** Full mock-exam question bank targets: official count + {@link QUESTION_BANK_BUFFER}. */
import {
	EXAM_QUESTION_BANK_TARGETS,
	QUESTION_BANK_BUFFER,
	OFFICIAL_EXAM_QUESTION_COUNTS,
	getOfficialQuestionCount,
	getQuestionBankTarget
} from './examQuestionPolicy';

export { EXAM_QUESTION_BANK_TARGETS as EXAM_QUESTION_TARGETS };
export {
	QUESTION_BANK_BUFFER,
	OFFICIAL_EXAM_QUESTION_COUNTS,
	getOfficialQuestionCount,
	getQuestionBankTarget
};

/** @deprecated Use EXAM_QUESTION_TARGETS */
export const FEATURED_EXAM_QUESTION_TARGETS = {
	CSA: { targetCount: EXAM_QUESTION_BANK_TARGETS.CSA, slug: 'csa' },
	CAD: { targetCount: EXAM_QUESTION_BANK_TARGETS.CAD, slug: 'cad' },
	'CIS-ITSM': { targetCount: EXAM_QUESTION_BANK_TARGETS['CIS-ITSM'], slug: 'cis-itsm' }
} as const;

export const PHASE3_TRACK_DOC_SOURCES: TrackDocSource[] = [
	{
		trackCode: 'CIS-DF',
		officialName: 'Certified Implementation Specialist - Data Foundations',
		publications: [
			'integrate-applications',
			'it-operations-management',
			'servicenow-platform',
			'now-platform'
		],
		domains: [
			{ name: 'Import sets and transforms', weight: '28%', publications: ['integrate-applications'] },
			{ name: 'CMDB and CSDM', weight: '28%', publications: ['it-operations-management'] },
			{ name: 'Data quality and reconciliation', weight: '22%', publications: ['it-operations-management'] },
			{ name: 'Foundation data', weight: '22%', publications: ['servicenow-platform', 'now-platform'] }
		]
	},
	{
		trackCode: 'CIS-PA',
		officialName: 'Certified Implementation Specialist - Platform Analytics',
		publications: ['now-intelligence'],
		domains: [
			{ name: 'Indicators and breakdowns', weight: '30%', publications: ['now-intelligence'] },
			{ name: 'Data collection', weight: '25%', publications: ['now-intelligence'] },
			{ name: 'Dashboards and widgets', weight: '25%', publications: ['now-intelligence'] },
			{ name: 'Targets and analytics administration', weight: '20%', publications: ['now-intelligence'] }
		]
	},
	{
		trackCode: 'CIS-SP',
		officialName: 'Certified Implementation Specialist - Service Provider',
		publications: [
			'telecom-service-ops',
			'telecom-network-inventory',
			'integrate-applications',
			'proactive-service-exp-workflows'
		],
		domains: [
			{ name: 'Telecom service operations', weight: '28%', publications: ['telecom-service-ops'] },
			{ name: 'IntegrationHub and integrations', weight: '24%', publications: ['integrate-applications'] },
			{ name: 'Delegated development and upgrades', weight: '24%', publications: ['application-development'] },
			{ name: 'CMDB for provider scale', weight: '24%', publications: ['it-operations-management'] }
		]
	}
];

export const PHASE4_TRACK_DOC_SOURCES: TrackDocSource[] = [
	{
		trackCode: 'CPOA',
		officialName: 'Certified Platform Owner Associate',
		publications: ['platform-administration', 'now-platform', 'integrate-applications', 'impact'],
		domains: [
			{ name: 'Instance and environment strategy', weight: '25%', publications: ['platform-administration'] },
			{ name: 'Upgrades and release management', weight: '25%', publications: ['platform-administration'] },
			{ name: 'Integrations overview', weight: '20%', publications: ['integrate-applications'] },
			{ name: 'Platform adoption and health', weight: '30%', publications: ['impact', 'platform-administration'] }
		]
	},
	{
		trackCode: 'CPOP',
		officialName: 'Certified Platform Owner Professional',
		publications: [
			'platform-administration',
			'platform-security',
			'application-development',
			'cloud-governance-suite'
		],
		domains: [
			{ name: 'Upgrade governance', weight: '28%', publications: ['platform-administration'] },
			{ name: 'Security and access governance', weight: '24%', publications: ['platform-security'] },
			{ name: 'Application lifecycle', weight: '24%', publications: ['application-development'] },
			{ name: 'Operational excellence', weight: '24%', publications: ['platform-administration', 'cloud-governance-suite'] }
		]
	},
	{
		trackCode: 'CPOE',
		officialName: 'Certified Platform Owner Expert',
		publications: [
			'platform-security',
			'servicenow-platform',
			'it-operations-management',
			'integrate-applications'
		],
		domains: [
			{ name: 'Domain and enterprise isolation', weight: '25%', publications: ['platform-security'] },
			{ name: 'Multi-instance and clone strategy', weight: '25%', publications: ['platform-administration'] },
			{ name: 'CMDB and data governance', weight: '25%', publications: ['it-operations-management'] },
			{ name: 'Enterprise integration architecture', weight: '25%', publications: ['integrate-applications'] }
		]
	}
];

export const PHASE5_TRACK_DOC_SOURCES: TrackDocSource[] = [
	{
		trackCode: 'CIS-DISCO',
		officialName: 'Certified Implementation Specialist - Discovery',
		publications: ['it-operations-management', 'discovery'],
		domains: [
			{
				name: 'Discovery Pattern Design',
				weight: '35%',
				publications: ['discovery', 'it-operations-management']
			},
			{
				name: 'Discovery Configuration',
				weight: '35%',
				publications: ['discovery', 'it-operations-management']
			},
			{
				name: 'Configuration Management Database',
				weight: '15%',
				publications: ['cmdb', 'it-operations-management']
			},
			{
				name: 'Discovery Engagement Readiness',
				weight: '15%',
				publications: ['discovery']
			}
		]
	},
	{
		trackCode: 'CIS-EM',
		officialName: 'Certified Implementation Specialist - Event Management',
		publications: ['it-operations-management', 'event-management'],
		domains: [
			{
				name: 'Event Management Overview',
				weight: '7%',
				publications: ['event-management', 'it-operations-management']
			},
			{
				name: 'Architecture and Discovery',
				weight: '10%',
				publications: ['event-management', 'it-operations-management']
			},
			{
				name: 'Event Configuration and Use',
				weight: '27%',
				publications: ['event-management']
			},
			{
				name: 'Alerts and Tasks',
				weight: '30%',
				publications: ['event-management']
			},
			{
				name: 'Event Sources',
				weight: '16%',
				publications: ['event-management']
			},
			{
				name: 'Metric Intelligence',
				weight: '10%',
				publications: ['event-management']
			}
		]
	},
	{
		trackCode: 'CIS-HAM',
		officialName: 'Certified Implementation Specialist - Hardware Asset Management',
		publications: ['it-asset-management', 'hardware-asset-management'],
		domains: [
			{
				name: 'IT Asset Management Overview and Fundamentals',
				weight: '20%',
				publications: ['it-asset-management', 'hardware-asset-management']
			},
			{
				name: 'Data Integrity Attributes and Data Sources',
				weight: '27%',
				publications: ['hardware-asset-management']
			},
			{
				name: 'Practical Management of IT Assets',
				weight: '30%',
				publications: ['hardware-asset-management']
			},
			{
				name: 'Operational Integration of IT Asset Management Processes',
				weight: '18%',
				publications: ['hardware-asset-management']
			},
			{
				name: 'Financial Management of IT Assets',
				weight: '5%',
				publications: ['hardware-asset-management']
			}
		]
	}
];

export const PHASE6_TRACK_DOC_SOURCES: TrackDocSource[] = [
	{
		trackCode: 'CIS-RC',
		officialName: 'Certified Implementation Specialist - Risk and Compliance',
		publications: ['governance-risk-compliance'],
		domains: [
			{ name: 'GRC Overview', weight: '11.67%', publications: ['governance-risk-compliance'] },
			{ name: 'Implementation Planning', weight: '5%', publications: ['governance-risk-compliance'] },
			{ name: 'Entity Framework', weight: '20%', publications: ['governance-risk-compliance'] },
			{ name: 'Policy and Compliance', weight: '25%', publications: ['governance-risk-compliance'] },
			{ name: 'Risk and Advanced Risk', weight: '25%', publications: ['governance-risk-compliance'] },
			{
				name: 'Common Elements and Extended Capabilities',
				weight: '8.33%',
				publications: ['governance-risk-compliance']
			},
			{ name: 'Audit and Advanced Audit', weight: '5%', publications: ['governance-risk-compliance'] }
		]
	},
	{
		trackCode: 'CIS-SIR',
		officialName: 'Certified Implementation Specialist - Security Incident Response',
		publications: ['security-management', 'security-incident-response'],
		domains: [
			{
				name: 'SIR Overview and Data Visualization',
				weight: '15%',
				publications: ['security-incident-response', 'security-management']
			},
			{
				name: 'Security Incident Creation and Threat Intelligence',
				weight: '14%',
				publications: ['security-incident-response']
			},
			{
				name: 'Security Incident and Threat Intelligence Integrations',
				weight: '14%',
				publications: ['security-incident-response']
			},
			{
				name: 'Security Incident Response Management',
				weight: '15%',
				publications: ['security-incident-response']
			},
			{
				name: 'Risk Calculations and Post Incident Response',
				weight: '12%',
				publications: ['security-incident-response']
			},
			{
				name: 'Automation and Standard Processes',
				weight: '30%',
				publications: ['security-incident-response']
			}
		]
	},
	{
		trackCode: 'CIS-SM',
		officialName: 'Certified Implementation Specialist - Service Mapping',
		publications: ['it-operations-management', 'service-mapping', 'discovery'],
		domains: [
			{
				name: 'Service Mapping Pattern Design',
				weight: '30%',
				publications: ['service-mapping', 'it-operations-management']
			},
			{
				name: 'Service Mapping Configuration',
				weight: '20%',
				publications: ['service-mapping']
			},
			{
				name: 'Discovery Configuration',
				weight: '15%',
				publications: ['discovery', 'it-operations-management']
			},
			{
				name: 'Machine Learning',
				weight: '10%',
				publications: ['service-mapping']
			},
			{
				name: 'Configuration Management Database',
				weight: '15%',
				publications: ['cmdb', 'it-operations-management']
			},
			{
				name: 'Service Mapping Engagement Readiness',
				weight: '10%',
				publications: ['service-mapping']
			}
		]
	}
];

export const PHASE7_TRACK_DOC_SOURCES: TrackDocSource[] = [
	{
		trackCode: 'CIS-SAM',
		officialName: 'Certified Implementation Specialist - Software Asset Management',
		publications: ['it-asset-management', 'software-asset-management'],
		domains: [
			{
				name: 'Software Asset Core Overview and Fundamentals',
				weight: '14%',
				publications: ['it-asset-management', 'software-asset-management']
			},
			{
				name: 'Data Integrity Attributes and Sources',
				weight: '28%',
				publications: ['software-asset-management']
			},
			{
				name: 'Practical Management of Software Compliance',
				weight: '30%',
				publications: ['software-asset-management']
			},
			{
				name: 'Operational Integration of Software Processes',
				weight: '13%',
				publications: ['software-asset-management']
			},
			{
				name: 'Extending SAM',
				weight: '15%',
				publications: ['software-asset-management']
			}
		]
	},
	{
		trackCode: 'CIS-SPM',
		officialName: 'Certified Implementation Specialist - Strategic Portfolio Management',
		publications: ['it-business-management', 'strategic-portfolio-management'],
		domains: [
			{ name: 'SPM Implementation Overview', weight: '2%', publications: ['it-business-management'] },
			{ name: 'SPM Financials', weight: '10%', publications: ['it-business-management'] },
			{ name: 'Resource Management', weight: '23%', publications: ['it-business-management'] },
			{ name: 'Idea and Demand', weight: '18%', publications: ['it-business-management'] },
			{ name: 'Project Management', weight: '30%', publications: ['it-business-management'] },
			{ name: 'Timecard Management', weight: '5%', publications: ['it-business-management'] },
			{ name: 'Portfolio Planning Workspace', weight: '8%', publications: ['it-business-management'] },
			{ name: 'SPM Platform Analytics and Dashboards', weight: '2%', publications: ['it-business-management'] },
			{ name: 'SPM Better Together', weight: '2%', publications: ['it-business-management'] }
		]
	}
];

export const PHASE8_TRACK_DOC_SOURCES: TrackDocSource[] = [
	{
		trackCode: 'CIS-TPRM',
		officialName: 'Certified Implementation Specialist - Third-Party Risk Management',
		publications: ['governance-risk-compliance', 'third-party-risk-management'],
		domains: [
			{
				name: 'TPRM Fundamentals and Review',
				weight: '23%',
				publications: ['governance-risk-compliance', 'third-party-risk-management']
			},
			{
				name: 'Core Configuration',
				weight: '14%',
				publications: ['third-party-risk-management']
			},
			{
				name: 'Assessment Configuration',
				weight: '33%',
				publications: ['third-party-risk-management']
			},
			{
				name: 'Third-party Portal',
				weight: '12%',
				publications: ['third-party-risk-management']
			},
			{
				name: 'Third-party Supporting Processes',
				weight: '12%',
				publications: ['third-party-risk-management']
			},
			{
				name: 'Other Application Relationships',
				weight: '6%',
				publications: ['governance-risk-compliance']
			}
		]
	},
	{
		trackCode: 'CIS-VR',
		officialName: 'Certified Implementation Specialist - Vulnerability Response',
		publications: ['vulnerability-response', 'security-management', 'now-intelligence'],
		domains: [
			{
				name: 'VR Applications and Modules',
				weight: '25%',
				publications: ['vulnerability-response', 'security-management']
			},
			{
				name: 'Getting Data into Vulnerability Response',
				weight: '25%',
				publications: ['vulnerability-response']
			},
			{
				name: 'Tools to Manage Vulnerability Response',
				weight: '23%',
				publications: ['vulnerability-response']
			},
			{
				name: 'Automating Vulnerability Response',
				weight: '20%',
				publications: ['vulnerability-response']
			},
			{
				name: 'VR Dashboards and Reports',
				weight: '7%',
				publications: ['vulnerability-response', 'now-intelligence']
			}
		]
	},
	{
		trackCode: 'CIS-CSM',
		officialName: 'Certified Implementation Specialist - Customer Service Management',
		publications: ['customer-service-management', 'knowledge-management', 'now-intelligence'],
		domains: [
			{
				name: 'CSM Foundational Data Model',
				weight: '27%',
				publications: ['customer-service-management']
			},
			{
				name: 'CSM Configuration',
				weight: '38%',
				publications: ['customer-service-management']
			},
			{
				name: 'Case Management',
				weight: '17%',
				publications: ['customer-service-management']
			},
			{
				name: 'CSM Workspace Portals Analytics and Reporting',
				weight: '8%',
				publications: ['customer-service-management', 'now-intelligence']
			},
			{
				name: 'CSM Best Practices and Knowledge Management',
				weight: '10%',
				publications: ['customer-service-management', 'knowledge-management']
			}
		]
	},
	{
		trackCode: 'CIS-FSM',
		officialName: 'Certified Implementation Specialist - Field Service Management',
		publications: ['field-service-management', 'now-platform', 'mobile-platform'],
		domains: [
			{
				name: 'Field Service Management Fundamentals',
				weight: '42%',
				publications: ['field-service-management']
			},
			{
				name: 'Implementation Planning',
				weight: '3%',
				publications: ['field-service-management', 'now-platform']
			},
			{
				name: 'Implementing Field Service Processes',
				weight: '52%',
				publications: ['field-service-management']
			},
			{
				name: 'Implementing Related Processes',
				weight: '3%',
				publications: ['field-service-management', 'mobile-platform']
			}
		]
	},
	{
		trackCode: 'CIS-HR',
		officialName: 'Certified Implementation Specialist - Human Resources',
		publications: [
			'employee-service-management',
			'human-resources',
			'employee-center',
			'platform-security'
		],
		domains: [
			{
				name: 'HR System Architecture',
				weight: '30%',
				publications: ['employee-service-management', 'human-resources']
			},
			{
				name: 'Core HR Applications and Employee Center',
				weight: '30%',
				publications: ['employee-service-management', 'employee-center', 'human-resources']
			},
			{
				name: 'HR Journeys',
				weight: '20%',
				publications: ['employee-service-management', 'human-resources']
			},
			{
				name: 'Platform, Role, and Contextual Security',
				weight: '20%',
				publications: ['platform-security', 'employee-service-management', 'human-resources']
			}
		]
	}
];
