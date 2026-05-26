/**
 * Canonical ServiceNow certification tracks (exam code → official name).
 * Used by Convex seed (`internal.seed.apply`) and the static exam catalog.
 */
export type CertificationTrack = {
	code: string;
	officialCertificationName: string;
};

export const CERTIFICATION_TRACKS_FOR_SEED: CertificationTrack[] = [
	{ code: 'CSA', officialCertificationName: 'Certified System Administrator' },
	{ code: 'CAD', officialCertificationName: 'Certified Application Developer' },
	{
		code: 'CIS-DF',
		officialCertificationName: 'Certified Implementation Specialist - Data Foundations'
	},
	{
		code: 'CIS-PA',
		officialCertificationName: 'Certified Implementation Specialist - Platform Analytics'
	},
	{
		code: 'CIS-SP',
		officialCertificationName: 'Certified Implementation Specialist - Service Provider'
	},
	{ code: 'CPOA', officialCertificationName: 'Certified Platform Owner Associate' },
	{ code: 'CPOP', officialCertificationName: 'Certified Platform Owner Professional' },
	{ code: 'CPOE', officialCertificationName: 'Certified Platform Owner Expert' },
	{
		code: 'CIS-DISCO',
		officialCertificationName: 'Certified Implementation Specialist - Discovery'
	},
	{
		code: 'CIS-EM',
		officialCertificationName: 'Certified Implementation Specialist - Event Management'
	},
	{
		code: 'CIS-HAM',
		officialCertificationName: 'Certified Implementation Specialist - Hardware Asset Management'
	},
	{
		code: 'CIS-ITSM',
		officialCertificationName: 'Certified Implementation Specialist - IT Service Management'
	},
	{
		code: 'CIS-RC',
		officialCertificationName: 'Certified Implementation Specialist - Risk and Compliance'
	},
	{
		code: 'CIS-SIR',
		officialCertificationName: 'Certified Implementation Specialist - Security Incident Response'
	},
	{
		code: 'CIS-SM',
		officialCertificationName: 'Certified Implementation Specialist - Service Mapping'
	},
	{
		code: 'CIS-SAM',
		officialCertificationName: 'Certified Implementation Specialist - Software Asset Management'
	},
	{
		code: 'CIS-SPM',
		officialCertificationName: 'Certified Implementation Specialist - Strategic Portfolio Management'
	},
	{
		code: 'CIS-TPRM',
		officialCertificationName: 'Certified Implementation Specialist - Third-Party Risk Management'
	},
	{
		code: 'CIS-VR',
		officialCertificationName: 'Certified Implementation Specialist - Vulnerability Response'
	},
	{
		code: 'CIS-CSM',
		officialCertificationName: 'Certified Implementation Specialist - Customer Service Management'
	},
	{
		code: 'CIS-FSM',
		officialCertificationName: 'Certified Implementation Specialist - Field Service Management'
	},
	{
		code: 'CIS-HR',
		officialCertificationName: 'Certified Implementation Specialist - Human Resources'
	}
];
