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
		publications: ['it-operations-management', 'servicenow-platform', 'platform-security'],
		domains: [
			{ name: 'MID Server and ECC', weight: '25%', publications: ['servicenow-platform'] },
			{ name: 'Discovery schedules and credentials', weight: '25%', publications: ['it-operations-management'] },
			{ name: 'Patterns and horizontal discovery', weight: '30%', publications: ['it-operations-management'] },
			{ name: 'CMDB integration', weight: '20%', publications: ['it-operations-management'] }
		]
	},
	{
		trackCode: 'CIS-EM',
		officialName: 'Certified Implementation Specialist - Event Management',
		publications: ['it-operations-management'],
		domains: [
			{ name: 'Event pipeline and ingestion', weight: '28%', publications: ['it-operations-management'] },
			{ name: 'Connectors and listeners', weight: '24%', publications: ['it-operations-management'] },
			{ name: 'Alerts and alert rules', weight: '28%', publications: ['it-operations-management'] },
			{ name: 'Remediation and operations', weight: '20%', publications: ['it-operations-management'] }
		]
	},
	{
		trackCode: 'CIS-HAM',
		officialName: 'Certified Implementation Specialist - Hardware Asset Management',
		publications: ['it-asset-management'],
		domains: [
			{ name: 'Hardware models and lifecycle', weight: '28%', publications: ['it-asset-management'] },
			{ name: 'Stockrooms and inventory', weight: '26%', publications: ['it-asset-management'] },
			{ name: 'Asset bundles and consumables', weight: '23%', publications: ['it-asset-management'] },
			{ name: 'Catalog fulfillment', weight: '23%', publications: ['it-asset-management'] }
		]
	}
];

export const PHASE6_TRACK_DOC_SOURCES: TrackDocSource[] = [
	{
		trackCode: 'CIS-RC',
		officialName: 'Certified Implementation Specialist - Risk and Compliance',
		publications: ['governance-risk-compliance'],
		domains: [
			{ name: 'GRC and IRM fundamentals', weight: '25%', publications: ['governance-risk-compliance'] },
			{ name: 'Policy and compliance', weight: '25%', publications: ['governance-risk-compliance'] },
			{ name: 'Risk management', weight: '25%', publications: ['governance-risk-compliance'] },
			{ name: 'Audit management', weight: '25%', publications: ['governance-risk-compliance'] }
		]
	},
	{
		trackCode: 'CIS-SIR',
		officialName: 'Certified Implementation Specialist - Security Incident Response',
		publications: ['security-management'],
		domains: [
			{ name: 'Security incident lifecycle', weight: '28%', publications: ['security-management'] },
			{ name: 'Playbooks and orchestration', weight: '24%', publications: ['security-management'] },
			{ name: 'Major security incidents', weight: '24%', publications: ['security-management'] },
			{ name: 'Threat intelligence and MITRE', weight: '24%', publications: ['security-management'] }
		]
	},
	{
		trackCode: 'CIS-SM',
		officialName: 'Certified Implementation Specialist - Service Mapping',
		publications: ['it-operations-management'],
		domains: [
			{ name: 'Application services', weight: '28%', publications: ['it-operations-management'] },
			{ name: 'Mapping techniques', weight: '26%', publications: ['it-operations-management'] },
			{ name: 'Patterns and discovery integration', weight: '26%', publications: ['it-operations-management'] },
			{ name: 'Operations and maintenance', weight: '20%', publications: ['it-operations-management'] }
		]
	}
];

export const PHASE7_TRACK_DOC_SOURCES: TrackDocSource[] = [
	{
		trackCode: 'CIS-SAM',
		officialName: 'Certified Implementation Specialist - Software Asset Management',
		publications: ['it-asset-management'],
		domains: [
			{ name: 'Software models and normalization', weight: '28%', publications: ['it-asset-management'] },
			{ name: 'Entitlements and licensing', weight: '26%', publications: ['it-asset-management'] },
			{ name: 'Discovery and reclamation', weight: '24%', publications: ['it-asset-management'] },
			{ name: 'SaaS and optimization', weight: '22%', publications: ['it-asset-management'] }
		]
	},
	{
		trackCode: 'CIS-SPM',
		officialName: 'Certified Implementation Specialist - Strategic Portfolio Management',
		publications: ['it-business-management'],
		domains: [
			{ name: 'Strategic planning', weight: '28%', publications: ['it-business-management'] },
			{ name: 'Portfolio and investment funding', weight: '26%', publications: ['it-business-management'] },
			{ name: 'Demand and resource management', weight: '24%', publications: ['it-business-management'] },
			{ name: 'Execution and roadmaps', weight: '22%', publications: ['it-business-management'] }
		]
	}
];

export const PHASE8_TRACK_DOC_SOURCES: TrackDocSource[] = [
	{
		trackCode: 'CIS-TPRM',
		officialName: 'Certified Implementation Specialist - Third-Party Risk Management',
		publications: ['governance-risk-compliance'],
		domains: [
			{ name: 'Vendor risk assessments', weight: '28%', publications: ['governance-risk-compliance'] },
			{ name: 'Inherent and residual risk', weight: '24%', publications: ['governance-risk-compliance'] },
			{ name: 'Questionnaires and evidence', weight: '24%', publications: ['governance-risk-compliance'] },
			{ name: 'Continuous monitoring', weight: '24%', publications: ['governance-risk-compliance'] }
		]
	},
	{
		trackCode: 'CIS-VR',
		officialName: 'Certified Implementation Specialist - Vulnerability Response',
		publications: ['security-management'],
		domains: [
			{ name: 'Vulnerability intake', weight: '26%', publications: ['security-management'] },
			{ name: 'Prioritization and scoring', weight: '26%', publications: ['security-management'] },
			{ name: 'Remediation workflows', weight: '24%', publications: ['security-management'] },
			{ name: 'Integration with ITSM/SecOps', weight: '24%', publications: ['security-management'] }
		]
	},
	{
		trackCode: 'CIS-CSM',
		officialName: 'Certified Implementation Specialist - Customer Service Management',
		publications: ['customer-service-management'],
		domains: [
			{ name: 'Case management', weight: '28%', publications: ['customer-service-management'] },
			{ name: 'Customer service workspace', weight: '24%', publications: ['customer-service-management'] },
			{ name: 'Orders and B2B', weight: '24%', publications: ['customer-service-management'] },
			{ name: 'Now Assist CSM', weight: '24%', publications: ['customer-service-management'] }
		]
	},
	{
		trackCode: 'CIS-FSM',
		officialName: 'Certified Implementation Specialist - Field Service Management',
		publications: ['field-service-management'],
		domains: [
			{ name: 'Work orders and tasks', weight: '28%', publications: ['field-service-management'] },
			{ name: 'Scheduling and dispatch', weight: '26%', publications: ['field-service-management'] },
			{ name: 'Mobile field service', weight: '24%', publications: ['field-service-management'] },
			{ name: 'Assets and territories', weight: '22%', publications: ['field-service-management'] }
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
