import { certificationTracks } from './certification-tracks';
import {
	getOfficialQuestionCount,
	getQuestionBankTarget
} from '$lib/catalog/examQuestionPolicy';
import { getTrackDocSource } from '$lib/catalog/trackDocSources';

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

const DOMAIN_ICONS = [
	'account_tree',
	'database',
	'list_alt',
	'warning',
	'published_with_changes',
	'auto_stories',
	'school',
	'security',
	'hub',
	'fact_check',
	'settings',
	'analytics'
] as const;

function domainQuestionLabel(weight: string, bankSize: number): string {
	const pct = Number.parseFloat(weight) / 100;
	const count = Math.max(1, Math.round(pct * bankSize));
	return `${count}+ Questions`;
}

function examDomainsFromBlueprint(trackCode: string, bankSize: number): ExamDomain[] {
	const source = getTrackDocSource(trackCode);
	if (!source?.domains.length) {
		return [
			{
				name: 'Blueprint-aligned practice',
				weight: '100%',
				questionCount: `${bankSize}+ Questions`,
				description:
					'Scenario-based items aligned to the official exam specification and ServiceNow documentation.',
				icon: 'fact_check'
			}
		];
	}

	const weights = source.domains.map((d) => Number.parseFloat(d.weight));
	const highlightIndex = weights.indexOf(Math.max(...weights));

	return source.domains.map((domain, index) => ({
		name: domain.name,
		weight: domain.weight,
		questionCount: domainQuestionLabel(domain.weight, bankSize),
		description: `Practice items covering ${domain.name} objectives from the official ${trackCode} exam blueprint.`,
		icon: DOMAIN_ICONS[index % DOMAIN_ICONS.length]!,
		...(index === highlightIndex ? { highlight: true as const } : {})
	}));
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
		updatedLabel: 'Jul 2026',
		passRate: '94%',
		description: `Practice aligned to the ${t.code} blueprint: configuration, scenarios, and platform best practices.`,
		image: ROTATION_IMAGES[index % ROTATION_IMAGES.length]!,
		domains: examDomainsFromBlueprint(t.code, bankSize),
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
		releaseFocus: 'Washington DC',
		updatedLabel: 'Jul 2026',
		passRate: '98%',
		description:
			'Domains: Incident, Problem, Change, Service Portfolio, Catalog & Request, and CMDB.',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuB7h-Vq5xCyltt7wTwKFW7oQX9Gaqahw8WD60mTF8oYwmM5wiekChtgqv3UBmpoIbN8wiaoSll3qLbAGpgW1lxcF1eNOk1fzgsxl11yUml7U_7AYm_3R8Sd7n3La5AZU8nTJaWoUgqh1UQQ1JrIpI3uWFti0tWiH4Esuh5nC4pnZdZ65lO9glpaVyshB-CHVC18_fnc5OxMu_Nq2VCAQBrPPkYuthMHToHCx9YI9NSZ2TnBWCubozDBwsxxG5TuyyG5Xm3MJpybH4E',
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
		releaseFocus: 'Washington DC',
		updatedLabel: 'Jul 2026',
		passRate: '97%',
		description:
			'Domains: Application Creation, UI, Security, Automation, External Data, and Application Management.',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuD5dnLGQkUSy8xEdy7NanSSL_XmydDFs4op3r2ZDRXAj1lCEl04bqj3zYQpUuB8nUd093Q3cU56I4rvtYmv335uh8F83SYLB4UcXT_WxZWdUwrRtfLRpOIXDzS61bKxIFps1NPhiR77NPR-TK6RHyVPsd_BidVUZcv-eOfK8VLo1F3tqbaaBJCKCVqbJP0TqjfMy7MpQGywNX3ow9C_DdObxYjZLGdnrpctBiK693hkTNMYBph-vZJgPIAYunH3Rb1IWNgJYNXqRIY',
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
		updatedLabel: 'Jul 2026',
		passRate: '95%',
		description:
			'Domains: SPM Overview, Demand Management, Portfolio Planning, Resource Management, and Reporting.',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuAhzWzI5oUtuRRqdtoIcmzUXsgfs9I_3mYO6kJjZy5AzQcS-SpGz9PyfK_ytY_ivTH8sc6x_u5MynKfKqUupL9CUnCdyWrK6CNFwWzwKtNTYwPofzo4ZW6Y5MQ4HPQq7py7yAMkSVvzmkdWAVJsGqOd-Tyb5ACCfItwv3lNCi2wdZVUwQyF0rA1fGUjt61Loatz1OJLmgaCH-Beg5U1HQsDszSBdiASSRKu17qH5jGxpiaR7s5DQ_0XJ2Cg3IRXKS4gW2AV1wBrMiw',
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
		releaseFocus: 'Washington DC',
		updatedLabel: 'Jul 2026',
		passRate: '94%',
		description:
			'Full-length mock exams covering platform navigation, collaboration, automation, security, and integration.',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDPavk6ROk9-zFMkYNcLZLD4q6lG4_Re4Xt33R7wmgABdkmVXB2BWZwvLhO_93t-5xPGbe_AdgZA3_Lhgj-MG8-UvkX90vtW4ejAmC-r2Hd2LDV3vdXJzS5w2TgA35YraFSlVTsOYTDI8KGPcoOEKtxg-gM3Q9IyAo3UTMcOwnWrOufN0CVTAggUW1ZH01G7zyZ3ys-81JmGOrtrb9pLA9MW4MFhmzmJQeT_KbyLFXjubE5i3A15TXI49qxJM5i0aP-RueCpV1znQ0',
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
		updatedLabel: 'Jul 2026',
		passRate: '93%',
		description:
			'Domains: HR architecture, core applications, employee center, journeys, and platform security.',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuAuohj8V9gpgO6ToVJAjMUvWoExT7MbINAmogkYQ6hHAszCOWJQHq7oVx1SNUk_tvrH8HeYbwcyeiGH245mdluvno1WeWCClCgV4SNnq9ahzVOsQyox_6bbkafIsd1n-2BoLKJfwQooTczaqtYbaepo5EzkUzqegbmR7AS7S4GZiEbkXFPSGP_Lce1hcysAtw_W9v7dzcLJ0u_egt7EnSbCR_TmDWeCmReLt4T9qsSffnIvsPdGpJG0XSkSjeoE5kzokq7PT7TKrms',
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
