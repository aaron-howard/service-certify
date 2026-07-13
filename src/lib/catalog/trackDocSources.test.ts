import { describe, expect, it } from 'vitest';
import { CAD_DOMAIN_TARGETS } from './cadRealism';
import { CIS_CSM_DOMAIN_TARGETS } from './cisCsmRealism';
import { CIS_DF_DOMAIN_TARGETS } from './cisDfRealism';
import { CIS_DISCO_DOMAIN_TARGETS } from './cisDiscoRealism';
import { CIS_EM_DOMAIN_TARGETS } from './cisEmRealism';
import { CIS_FSM_DOMAIN_TARGETS } from './cisFsmRealism';
import { CIS_HAM_DOMAIN_TARGETS } from './cisHamRealism';
import { CIS_HR_DOMAIN_TARGETS } from './cisHrRealism';
import { CIS_ITSM_DOMAIN_TARGETS } from './cisItsmRealism';
import { CIS_PA_DOMAIN_TARGETS } from './cisPaRealism';
import { CIS_RC_DOMAIN_TARGETS } from './cisRcRealism';
import { CIS_SAM_DOMAIN_TARGETS } from './cisSamRealism';
import { CIS_SIR_DOMAIN_TARGETS } from './cisSirRealism';
import { CIS_SM_DOMAIN_TARGETS } from './cisSmRealism';
import { CIS_SP_DOMAIN_TARGETS } from './cisSpRealism';
import { CIS_SPM_DOMAIN_TARGETS } from './cisSpmRealism';
import { CIS_TPRM_DOMAIN_TARGETS } from './cisTprmRealism';
import { CIS_VR_DOMAIN_TARGETS } from './cisVrRealism';
import { CPOA_DOMAIN_TARGETS } from './cpoaRealism';
import { CPOE_DOMAIN_TARGETS } from './cpoeRealism';
import { CPOP_DOMAIN_TARGETS } from './cpopRealism';
import { CSA_DOMAIN_TARGETS } from './csaRealism';
import { CERTIFICATION_TRACKS_FOR_SEED } from './tracksCanonical';
import { ALL_TRACK_DOC_SOURCES, getTrackDocSource } from './trackDocSources';

const REALISM_DOMAIN_TARGETS_BY_TRACK: Record<string, Record<string, number>> = {
	CSA: CSA_DOMAIN_TARGETS,
	CAD: CAD_DOMAIN_TARGETS,
	'CIS-DF': CIS_DF_DOMAIN_TARGETS,
	'CIS-PA': CIS_PA_DOMAIN_TARGETS,
	'CIS-SP': CIS_SP_DOMAIN_TARGETS,
	CPOA: CPOA_DOMAIN_TARGETS,
	CPOP: CPOP_DOMAIN_TARGETS,
	CPOE: CPOE_DOMAIN_TARGETS,
	'CIS-DISCO': CIS_DISCO_DOMAIN_TARGETS,
	'CIS-EM': CIS_EM_DOMAIN_TARGETS,
	'CIS-HAM': CIS_HAM_DOMAIN_TARGETS,
	'CIS-ITSM': CIS_ITSM_DOMAIN_TARGETS,
	'CIS-RC': CIS_RC_DOMAIN_TARGETS,
	'CIS-SIR': CIS_SIR_DOMAIN_TARGETS,
	'CIS-SM': CIS_SM_DOMAIN_TARGETS,
	'CIS-SAM': CIS_SAM_DOMAIN_TARGETS,
	'CIS-SPM': CIS_SPM_DOMAIN_TARGETS,
	'CIS-TPRM': CIS_TPRM_DOMAIN_TARGETS,
	'CIS-VR': CIS_VR_DOMAIN_TARGETS,
	'CIS-CSM': CIS_CSM_DOMAIN_TARGETS,
	'CIS-FSM': CIS_FSM_DOMAIN_TARGETS,
	'CIS-HR': CIS_HR_DOMAIN_TARGETS
};

function sumDomainWeights(domains: { weight: string }[]): number {
	return domains.reduce((sum, d) => sum + Number.parseFloat(d.weight), 0);
}

describe('trackDocSources', () => {
	it('defines blueprint doc sources for every canonical track', () => {
		expect(ALL_TRACK_DOC_SOURCES).toHaveLength(CERTIFICATION_TRACKS_FOR_SEED.length);

		for (const track of CERTIFICATION_TRACKS_FOR_SEED) {
			const source = getTrackDocSource(track.code);
			expect(source, `missing doc source for ${track.code}`).toBeDefined();
			expect(source!.trackCode).toBe(track.code);
			expect(source!.domains.length).toBeGreaterThanOrEqual(1);
			expect(sumDomainWeights(source!.domains)).toBeGreaterThanOrEqual(99);
			expect(sumDomainWeights(source!.domains)).toBeLessThanOrEqual(101);
		}
	});

	it('matches realism blueprint domain names for every track', () => {
		for (const track of CERTIFICATION_TRACKS_FOR_SEED) {
			const targets = REALISM_DOMAIN_TARGETS_BY_TRACK[track.code];
			expect(targets, `missing realism targets for ${track.code}`).toBeDefined();

			const source = getTrackDocSource(track.code);
			const expected = Object.keys(targets!).sort();
			const actual = source?.domains.map((d) => d.name).sort() ?? [];

			expect(actual, `${track.code} domain names`).toEqual(expected);
		}
	});
});
