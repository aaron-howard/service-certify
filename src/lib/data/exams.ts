import { certificationTracks } from './certification-tracks';
import {
	getOfficialQuestionCount,
	getQuestionBankTarget
} from '$lib/catalog/examQuestionPolicy';

export type ExamDomain = {
	name: string;
	weight: string;
	questionCount: string;
	description: string;
	icon: string;
	highlight?: boolean;
};

export type ExamLevel = 'Associate' | 'Professional' | 'Expert';

export type Exam = {
	slug: string;
	code: string;
	/** Matches ServiceNow official certification naming */
	officialCertificationName: string;
	title: string;
	shortTitle: string;
	tag: string;
	trackLabel: string;
	/** Official proctored exam question count (per attempt). */
	questionCount: number;
	/** Seeded bank size (official + 30) for randomized full mocks. */
	questionBankSize: number;
	questionBankLabel: string;
	mockExamCount: string;
	releaseFocus: string;
	updatedLabel: string;
	passRate: string;
	description: string;
	image: string;
	domains: ExamDomain[];
	author: { initials: string; name: string; role: string };
	rating: number;
	studentsPrepared: number;
	level: ExamLevel;
	homeBadge?: string;
	homeDescription?: string;
};

const cisItsmDomains: ExamDomain[] = [
	{
		name: 'Incident Management',
		weight: '25%',
		questionCount: '160+ Questions',
		description:
			'Covers lifecycle management, state transitions, major incidents, and platform integrations.',
		icon: 'account_tree'
	},
	{
		name: 'CMDB & Asset',
		weight: '18%',
		questionCount: '115+ Questions',
		description:
			'Deep dive into CSDM, CI relationships, asset classes, and identification/reconciliation rules.',
		icon: 'database'
	},
	{
		name: 'Service Catalog',
		weight: '20%',
		questionCount: '130+ Questions',
		description: 'Mastering request fulfillment, variable sets, flows, and dynamic catalog items.',
		icon: 'list_alt'
	},
	{
		name: 'Problem Management',
		weight: '12%',
		questionCount: '80+ Questions',
		description: 'RCA workflows, known errors, and integration with change and incident.',
		icon: 'warning'
	},
	{
		name: 'Change Management',
		weight: '15%',
		questionCount: '100+ Questions',
		description: 'Normal, Emergency, Standard types, CAB processing, and conflict detection.',
		icon: 'published_with_changes'
	},
	{
		name: 'Knowledge & Portal',
		weight: '10%',
		questionCount: '65+ Questions',
		description: 'Knowledge lifecycle, user criteria, and self-service configuration.',
		icon: 'auto_stories',
		highlight: true
	}
];

function genericDomains(prefix: string): ExamDomain[] {
	return [
		{
			name: `${prefix} fundamentals`,
			weight: '28%',
			questionCount: '120+ Questions',
			description:
				'Core platform concepts, navigation, and configuration aligned to the official blueprint.',
			icon: 'school'
		},
		{
			name: 'Configuration & security',
			weight: '24%',
			questionCount: '95+ Questions',
			description: 'Access controls, data policies, and secure implementation patterns.',
			icon: 'security'
		},
		{
			name: 'Integration & automation',
			weight: '22%',
			questionCount: '88+ Questions',
			description: 'Flows, integrations, and operational automation scenarios.',
			icon: 'hub'
		},
		{
			name: 'Scenario-based assessment',
			weight: '26%',
			questionCount: '110+ Questions',
			description: 'End-to-end cases that mirror exam-style wording and constraints.',
			icon: 'fact_check'
		}
	];
}

export { certificationTracks };

const ROTATION_IMAGES = [
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDPavk6ROk9-zFMkYNcLZLD4q6lG4_Re4Xt33R7wmgABdkmVXB2BWZwvLhO_93t-5xPGbe_AdgZA3_Lhgj-MG8-UvkX90vtW4ejAmC-r2Hd2LDV3vdXJzS5w2TgA35YraFSlVTsOYTDI8KGPcoOEKtxg-gM3Q9IyAo3UTMcOwnWrOufN0CVTAggUW1ZH01G7zyZ3ys-81JmGOrtrb9pLA9MW4MFhmzmJQeT_KbyLFXjubE5i3A15TXI49qxJM5i0aP-RueCpV1znQ0',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuD5dnLGQkUSy8xEdy7NanSSL_XmydDFs4op3r2ZDRXAj1lCEl04bqj3zYQpUuB8nUd093Q3cU56I4rvtYmv335uh8F83SYLB4UcXT_WxZWdUwrRtfLRpOIXDzS61bKxIFps1NPhiR77NPR-TK6RHyVPsd_BidVUZcv-eOfK8VLo1F3tqbaaBJCKCVqbJP0TqjfMy7MpQGywNX3ow9C_DdObxYjZLGdnrpctBiK693hkTNMYBph-vZJgPIAYunH3Rb1IWNgJYNXqRIY',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuB7h-Vq5xCyltt7wTwKFW7oQX9Gaqahw8WD60mTF8oYwmM5wiekChtgqv3UBmpoIbN8wiaoSll3qLbAGpgW1lxcF1eNOk1fzgsxl11yUml7U_7AYm_3R8Sd7n3La5AZU8nTJaWoUgqh1UQQ1JrIpI3uWFti0tWiH4Esuh5nC4pnZdZ65lO9glpaVyshB-CHVC18_fnc5OxMu_Nq2VCAQBrPPkYuthMHToHCx9YI9NSZ2TnBWCubozDBwsxxG5TuyyG5Xm3MJpybH4E',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAhzWzI5oUtuRRqdtoIcmzUXsgfs9I_3mYO6kJjZy5AzQcS-SpGz9PyfK_ytY_ivTH8sc6x_u5MynKfKqUupL9CUnCdyWrK6CNFwWzwKtNTYwPofzo4ZW6Y5MQ4HPQq7py7yAMkSVvzmkdWAVJsGqOd-Tyb5ACCfItwv3lNCi2wdZVUwQyF0rA1fGUjt61Loatz1OJLmgaCH-Beg5U1HQsDszSBdiASSRKu17qH5jGxpiaR7s5DQ_0XJ2Cg3IRXKS4gW2AV1wBrMiw',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAuohj8V9gpgO6ToVJAjMUvWoExT7MbINAmogkYQ6hHAszCOWJQHq7oVx1SNUk_tvrH8HeYbwcyeiGH245mdluvno1WeWCClCgV4SNnq9ahzVOsQyox_6bbkafIsd1n-2BoLKJfwQooTczaqtYbaepo5EzkUzqegbmR7AS7S4GZiEbkXFPSGP_Lce1hcysAtw_W9v7dzcLJ0u_egt7EnSbCR_TmDWeCmReLt4T9qsSffnIvsPdGpJG0XSkSjeoE5kzokq7PT7TKrms'
];

const ROTATION_AUTHORS: Exam['author'][] = [
	{ initials: 'SM', name: 'Sarah Miller, CIS Expert', role: 'CIS Expert' },
	{ initials: 'DK', name: 'David Kim, SN Dev', role: 'SN Dev' },
	{ initials: 'AL', name: 'Anna Lopez, Senior Dev', role: 'Senior Dev' },
	{ initials: 'RB', name: 'Robert Brown, SPM Lead', role: 'SPM Lead' },
	{ initials: 'JP', name: 'Jordan Patel, CSA Lead', role: 'CSA Lead' },
	{ initials: 'LW', name: 'Lee Wong, HRSD', role: 'HRSD' }
];

function slugFromCode(code: string): string {
	return code.toLowerCase().replace(/_/g, '-');
}

function trackLabelForCode(code: string): string {
	if (code.startsWith('CIS-')) return 'Implementation Specialist';
	if (code.startsWith('CPO')) return 'Platform Owner';
	return 'Mainline Certification';
}

function levelForCode(code: string): ExamLevel {
	if (code === 'CSA' || code === 'CPOA') return 'Associate';
	if (code === 'CPOE') return 'Expert';
	return 'Professional';
}

function domainPrefixFromOfficialName(official: string): string {
	const cis = official.match(/^Certified Implementation Specialist - (.+)$/);
	if (cis) return cis[1]!;
	if (official === 'Certified System Administrator') return 'System administration';
	if (official === 'Certified Application Developer') return 'Application development';
	if (official.startsWith('Certified Platform Owner')) return 'Platform ownership';
	return 'Certification';
}

function baseExamFromTrack(
	t: { code: string; officialCertificationName: string },
	index: number
): Exam {
	const slug = slugFromCode(t.code);
	const official = t.officialCertificationName;
	const officialCount = getOfficialQuestionCount(t.code);
	const bankSize = getQuestionBankTarget(t.code);
	return {
		slug,
		code: t.code,
		officialCertificationName: official,
		title: `${official} Practice Exams`,
		shortTitle: official,
		tag: t.code,
		trackLabel: trackLabelForCode(t.code),
		questionCount: officialCount,
		questionBankSize: bankSize,
		questionBankLabel: String(bankSize),
		mockExamCount: '8 Full-length',
		releaseFocus: 'Washington DC',
		updatedLabel: 'Mar 2025',
		passRate: '94%',
		description: `Practice aligned to the ${t.code} blueprint: configuration, scenarios, and platform best practices.`,
		image: ROTATION_IMAGES[index % ROTATION_IMAGES.length]!,
		domains: genericDomains(domainPrefixFromOfficialName(official)),
		author: ROTATION_AUTHORS[index % ROTATION_AUTHORS.length]!,
		rating: 4.8,
		studentsPrepared: 480,
		level: levelForCode(t.code)
	};
}

const examDetailOverrides: Partial<Record<string, Partial<Exam>>> = {
	'cis-itsm': {
		title: 'CIS-ITSM Implementation Exam Simulator',
		shortTitle: 'Certified Implementation Specialist - IT Service Management',
		officialCertificationName: 'Certified Implementation Specialist - IT Service Management',
		trackLabel: 'CIS Practice Exam',
		mockExamCount: '12 Full-length',
		releaseFocus: 'Xanadu',
		updatedLabel: 'Oct 2024',
		passRate: '98%',
		description:
			'Domains: Incident, Problem, Change, Release, and Request Management automation.',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuB7h-Vq5xCyltt7wTwKFW7oQX9Gaqahw8WD60mTF8oYwmM5wiekChtgqv3UBmpoIbN8wiaoSll3qLbAGpgW1lxcF1eNOk1fzgsxl11yUml7U_7AYm_3R8Sd7n3La5AZU8nTJaWoUgqh1UQQ1JrIpI3uWFti0tWiH4Esuh5nC4pnZdZ65lO9glpaVyshB-CHVC18_fnc5OxMu_Nq2VCAQBrPPkYuthMHToHCx9YI9NSZ2TnBWCubozDBwsxxG5TuyyG5Xm3MJpybH4E',
		domains: cisItsmDomains,
		author: { initials: 'SM', name: 'Sarah Miller, CIS Expert', role: 'CIS Expert' },
		rating: 4.9,
		studentsPrepared: 1240,
		level: 'Professional',
		homeBadge: 'SPECIALIST EXAM',
		homeDescription:
			'Expert-curated exams for ITSM workflows including Incident, Problem, and Change Management.'
	},
	cad: {
		title: 'Certified Application Developer (CAD) Prep',
		shortTitle: 'Certified Application Developer',
		officialCertificationName: 'Certified Application Developer',
		trackLabel: 'Developer Track',
		mockExamCount: '8 Full-length',
		releaseFocus: 'Xanadu',
		updatedLabel: 'Dec 2024',
		passRate: '97%',
		description:
			'Domains: Application Creation, Server/Client Side Scripting, Data Integration, and Security.',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuD5dnLGQkUSy8xEdy7NanSSL_XmydDFs4op3r2ZDRXAj1lCEl04bqj3zYQpUuB8nUd093Q3cU56I4rvtYmv335uh8F83SYLB4UcXT_WxZWdUwrRtfLRpOIXDzS61bKxIFps1NPhiR77NPR-TK6RHyVPsd_BidVUZcv-eOfK8VLo1F3tqbaaBJCKCVqbJP0TqjfMy7MpQGywNX3ow9C_DdObxYjZLGdnrpctBiK693hkTNMYBph-vZJgPIAYunH3Rb1IWNgJYNXqRIY',
		domains: genericDomains('Application development'),
		author: { initials: 'AL', name: 'Anna Lopez, Senior Dev', role: 'Senior Dev' },
		rating: 4.7,
		studentsPrepared: 543,
		level: 'Professional',
		homeBadge: 'ADVANCED EXAM',
		homeDescription:
			'Scenario-based practice tests focusing on Scoped APIs, Server-side Scripting, and UI Actions.'
	},
	'cis-spm': {
		title: 'CIS-Strategic Portfolio Management Simulator',
		shortTitle: 'Certified Implementation Specialist - Strategic Portfolio Management',
		officialCertificationName: 'Certified Implementation Specialist - Strategic Portfolio Management',
		trackLabel: 'Portfolio Track',
		mockExamCount: '9 Full-length',
		releaseFocus: 'Washington DC',
		updatedLabel: 'Nov 2024',
		passRate: '95%',
		description:
			'Domains: Strategic Alignment, Investment Funding, Resource Management, and PPM.',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuAhzWzI5oUtuRRqdtoIcmzUXsgfs9I_3mYO6kJjZy5AzQcS-SpGz9PyfK_ytY_ivTH8sc6x_u5MynKfKqUupL9CUnCdyWrK6CNFwWzwKtNTYwPofzo4ZW6Y5MQ4HPQq7py7yAMkSVvzmkdWAVJsGqOd-Tyb5ACCfItwv3lNCi2wdZVUwQyF0rA1fGUjt61Loatz1OJLmgaCH-Beg5U1HQsDszSBdiASSRKu17qH5jGxpiaR7s5DQ_0XJ2Cg3IRXKS4gW2AV1wBrMiw',
		domains: genericDomains('SPM'),
		author: { initials: 'RB', name: 'Robert Brown, SPM Lead', role: 'SPM Lead' },
		rating: 5.0,
		studentsPrepared: 312,
		level: 'Professional'
	},
	csa: {
		title: 'Certified System Administrator Practice Exams',
		shortTitle: 'Certified System Administrator',
		officialCertificationName: 'Certified System Administrator',
		trackLabel: 'Core Administrator',
		mockExamCount: '6 Full-length',
		releaseFocus: 'Xanadu',
		updatedLabel: 'Mar 2025',
		passRate: '94%',
		description:
			'Full-length mock exams covering User Interface, Database Schema, and Instance Management.',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDPavk6ROk9-zFMkYNcLZLD4q6lG4_Re4Xt33R7wmgABdkmVXB2BWZwvLhO_93t-5xPGbe_AdgZA3_Lhgj-MG8-UvkX90vtW4ejAmC-r2Hd2LDV3vdXJzS5w2TgA35YraFSlVTsOYTDI8KGPcoOEKtxg-gM3Q9IyAo3UTMcOwnWrOufN0CVTAggUW1ZH01G7zyZ3ys-81JmGOrtrb9pLA9MW4MFhmzmJQeT_KbyLFXjubE5i3A15TXI49qxJM5i0aP-RueCpV1znQ0',
		domains: genericDomains('System administration'),
		author: { initials: 'JP', name: 'Jordan Patel, CSA Lead', role: 'CSA Lead' },
		rating: 4.9,
		studentsPrepared: 2100,
		level: 'Associate',
		homeBadge: 'CORE EXAM',
		homeDescription:
			'6 Full-length mock exams covering User Interface, Database Schema, and Instance Management.'
	},
	'cis-hr': {
		title: 'CIS-HR Service Delivery Practice Exams',
		shortTitle: 'Certified Implementation Specialist - Human Resources',
		officialCertificationName: 'Certified Implementation Specialist - Human Resources',
		trackLabel: 'HRSD Track',
		mockExamCount: '7 Full-length',
		releaseFocus: 'Washington DC',
		updatedLabel: 'Feb 2025',
		passRate: '93%',
		description: 'Domains: HR cases, lifecycle events, document templates, and employee center flows.',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuAuohj8V9gpgO6ToVJAjMUvWoExT7MbINAmogkYQ6hHAszCOWJQHq7oVx1SNUk_tvrH8HeYbwcyeiGH245mdluvno1WeWCClCgV4SNnq9ahzVOsQyox_6bbkafIsd1n-2BoLKJfwQooTczaqtYbaepo5EzkUzqegbmR7AS7S4GZiEbkXFPSGP_Lce1hcysAtw_W9v7dzcLJ0u_egt7EnSbCR_TmDWeCmReLt4T9qsSffnIvsPdGpJG0XSkSjeoE5kzokq7PT7TKrms',
		domains: genericDomains('HR service delivery'),
		author: { initials: 'LW', name: 'Lee Wong, HRSD', role: 'HRSD' },
		rating: 4.6,
		studentsPrepared: 412,
		level: 'Professional'
	}
};

export const exams: Exam[] = certificationTracks.map((t, i) => {
	const slug = slugFromCode(t.code);
	const base = baseExamFromTrack(t, i);
	const override = examDetailOverrides[slug];
	return override ? { ...base, ...override } : base;
});

export function getExamBySlug(slug: string): Exam | undefined {
	return exams.find((e) => e.slug === slug);
}

export function getFeaturedExams(): Exam[] {
	return exams.filter((e) => ['csa', 'cad', 'cis-itsm'].includes(e.slug));
}
