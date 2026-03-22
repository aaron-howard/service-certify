import type { DevPracticeQuestionRow } from './devQuestionBank.types';

/** Dev bank: 5 questions × 22 tracks; merged from agent batches. Regenerate: `node scripts/extract-questions-from-transcripts.mjs` */
export const DEV_PRACTICE_QUESTIONS: DevPracticeQuestionRow[] = [
	{
		"trackCode": "CSA",
		"order": 0,
		"prompt": "Which statement best describes how roles are typically used to grant capabilities in ServiceNow?",
		"choices": [
			"Roles bundle permissions and are assigned to users or groups to grant access",
			"Roles apply only to Performance Analytics widgets",
			"Each user may hold only one role across the entire instance",
			"Roles are synonymous with CMDB CI classes"
		],
		"correctIndex": 0,
		"explanation": "Roles aggregate permissions; administrators assign them to users or groups so members receive the associated capabilities.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/yokohama-platform-administration/page/administer/roles/concept/using-user-administration.html"
		]
	},
	{
		"trackCode": "CSA",
		"order": 1,
		"prompt": "What do Access Control List (ACL) rules primarily control?",
		"choices": [
			"Scheduled job concurrency only",
			"Who may read, write, create, or delete records or fields, subject to conditions",
			"The color theme of the Next Experience UI",
			"Whether a table uses auto-numbering"
		],
		"correctIndex": 1,
		"explanation": "ACL rules secure tables and fields for operations such as read and write, and may evaluate roles or scripts.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/yokohama/platform-security/access-control/exploring-access-control-list.html"
		]
	},
	{
		"trackCode": "CSA",
		"order": 2,
		"prompt": "What is a primary purpose of an update set in a typical instance-to-instance migration workflow?",
		"choices": [
			"To capture configuration changes so they can be reviewed and moved between instances",
			"To replace the need for any testing in sub-production",
			"To encrypt all attachments automatically",
			"To delete orphaned CMDB relationships"
		],
		"correctIndex": 0,
		"explanation": "Update sets record customer configuration changes for promotion between instances with collision and preview workflows.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/zurich-application-development/page/build/system-update-sets/concept/system-update-sets.html"
		]
	},
	{
		"trackCode": "CSA",
		"order": 3,
		"prompt": "On a list, what is the effect of applying a filter?",
		"choices": [
			"It changes which rows appear based on the filter conditions",
			"It renames the underlying table",
			"It disables all business rules globally",
			"It exports the dictionary to XML"
		],
		"correctIndex": 0,
		"explanation": "List filters constrain the query so users see only records that match the specified conditions.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-platform-user-interface/page/use/using-lists/task/t_CreatingFilters.html"
		]
	},
	{
		"trackCode": "CSA",
		"order": 4,
		"prompt": "When troubleshooting inbound email processing, an administrator should first verify which area of configuration?",
		"choices": [
			"Email properties and inbound connectivity so the instance can retrieve and process messages",
			"The PA data collector schedule exclusively",
			"MID Server wake-on-LAN settings for laptops",
			"The system dictionary for the incident.number field"
		],
		"correctIndex": 0,
		"explanation": "Inbound email depends on correctly configured email properties and related mail flow so messages reach the instance.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/vancouver-platform-administration/page/administer/reference-pages/concept/c_EmailProperties.html"
		]
	},
	{
		"trackCode": "CAD",
		"order": 0,
		"prompt": "In application development, where should reusable server-side functions or classes usually be placed for maintainability?",
		"choices": [
			"Only in global Client Scripts",
			"In Script Includes that other server scripts instantiate or call",
			"Exclusively in homepages",
			"Only in scheduled jobs that run weekly"
		],
		"correctIndex": 1,
		"explanation": "Script Includes encapsulate reusable server-side logic and support scoped application boundaries.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/vancouver-application-development/page/script/server-scripting/concept/c_ScriptIncludes.html"
		]
	},
	{
		"trackCode": "CAD",
		"order": 1,
		"prompt": "A Business Rule set to run Before insert executes at which point in the save lifecycle?",
		"choices": [
			"Before the new row is written to the database",
			"Only after all asynchronous jobs complete",
			"Only when a user prints the form",
			"After related records are committed in every case"
		],
		"correctIndex": 0,
		"explanation": "Before rules run prior to database operations so you can adjust values, validate, or abort the transaction.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-application-development/page/script/business-rules/concept/c_BusinessRules.html"
		]
	},
	{
		"trackCode": "CAD",
		"order": 2,
		"prompt": "Which server-side API is commonly used to query and modify rows in a table from scripts such as Business Rules?",
		"choices": [
			"GlideAjax",
			"g_form",
			"GlideRecord",
			"spModal"
		],
		"correctIndex": 2,
		"explanation": "GlideRecord is the standard server-side interface for database operations in most server scripts.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/xanadu/application-development/scripts/c_UsingGlideRecordToQueryTables.html"
		]
	},
	{
		"trackCode": "CAD",
		"order": 3,
		"prompt": "Which pairing best contrasts UI Policies and Client Scripts on forms?",
		"choices": [
			"UI Policies often control visibility and mandatory state declaratively; Client Scripts implement imperative client logic with JavaScript",
			"UI Policies run only on the email client",
			"Client Scripts cannot reference g_form",
			"Neither can apply on the same table"
		],
		"correctIndex": 0,
		"explanation": "UI Policies provide declarative form behavior; Client Scripts add scripted client-side behavior when needed.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-platform-administration/page/administer/form-administration/task/t_CreateAUIPolicy.html",
			"https://www.servicenow.com/docs/bundle/washingtondc-application-development/page/script/client-scripts/concept/client-scripts.html"
		]
	},
	{
		"trackCode": "CAD",
		"order": 4,
		"prompt": "Which component defines a custom HTTP method, resource path, and script for inbound REST integration in a scoped application?",
		"choices": [
			"Transform Map",
			"Scripted REST API resource",
			"Homepage gauge",
			"Data source"
		],
		"correctIndex": 1,
		"explanation": "Scripted REST APIs expose resources backed by scripts that handle request and response processing.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/api-reference/rest-api-explorer/t_CreateAScriptedRESTAPIResource.html"
		]
	},
	{
		"trackCode": "CIS-DF",
		"order": 0,
		"prompt": "In an import-set workflow, what does a Transform Map define?",
		"choices": [
			"How staging rows map into target records, including field mappings and optional scripts",
			"The PA indicator time zone only",
			"LDAP listener ports",
			"The Service Portal theme"
		],
		"correctIndex": 0,
		"explanation": "Transform maps connect a source staging table to a target table and control how rows become or update target records.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/washingtondc/integrate-applications/system-import-sets/c_CreatingNewTransformMaps.html"
		]
	},
	{
		"trackCode": "CIS-DF",
		"order": 1,
		"prompt": "What is a typical purpose of marking a field as coalesce on a Transform Map?",
		"choices": [
			"To locate an existing target row so the transform updates instead of inserting duplicates",
			"To force the field to store JSON only",
			"To schedule a daily data collection job",
			"To disable field-level security"
		],
		"correctIndex": 0,
		"explanation": "Coalesce fields participate in matching logic so transforms can merge into existing records when keys align.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/washingtondc/integrate-applications/system-import-sets/c_CreatingNewTransformMaps.html"
		]
	},
	{
		"trackCode": "CIS-DF",
		"order": 2,
		"prompt": "How are most Configuration Item (CI) classes structured in the CMDB data model?",
		"choices": [
			"As a hierarchy where specialized classes extend more general base classes",
			"As unrelated tables that cannot reference cmdb_ci",
			"As flat spreadsheet uploads only",
			"As exclusively client-side objects"
		],
		"correctIndex": 0,
		"explanation": "CMDB classes use inheritance so specialized CIs reuse attributes and behavior from parent classes.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/vancouver-servicenow-platform/page/product/configuration-management/concept/cmdb-ci-class-models.html"
		]
	},
	{
		"trackCode": "CIS-DF",
		"order": 3,
		"prompt": "What problem does the Identification and Reconciliation process primarily help address when multiple sources feed the CMDB?",
		"choices": [
			"Duplicate or conflicting CI representations by identifying matches and reconciling attributes",
			"Replacing all ACLs with data policies",
			"Eliminating the need for Discovery",
			"Disabling import sets permanently"
		],
		"correctIndex": 0,
		"explanation": "Identification finds candidate matches while reconciliation applies source precedence so attributes stay consistent.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/zurich-servicenow-platform/page/product/configuration-management/concept/c_CMDBIdentifyandReconcile.html"
		]
	},
	{
		"trackCode": "CIS-DF",
		"order": 4,
		"prompt": "Before bulk-loading reference data with import sets, which practice most reduces downstream transform errors?",
		"choices": [
			"Validate source keys, formats, and relationships in staging before running transforms",
			"Run transforms without reviewing staging rows",
			"Turn off all business rules forever",
			"Load directly into sys_user without a staging table"
		],
		"correctIndex": 0,
		"explanation": "Import-set guidance emphasizes staging, mapping, and validation so transforms produce clean target data.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/vancouver-integrate-applications/page/administer/import-sets/concept/c_ImportDataUsingImportSets.html"
		]
	},
	{
		"trackCode": "CIS-PA",
		"order": 0,
		"prompt": "In Performance Analytics, an indicator is best described as:",
		"choices": [
			"A tracked metric whose scores are collected over time for analysis",
			"A role used only by report admins",
			"A MID Server configuration record",
			"A type of ACL for dashboards"
		],
		"correctIndex": 0,
		"explanation": "Indicators define what you measure; scores are stored and trended for widgets and analytics.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/zurich-now-intelligence/page/use/performance-analytics/concept/c_UseIndicatorOverview.html"
		]
	},
	{
		"trackCode": "CIS-PA",
		"order": 1,
		"prompt": "What is the main purpose of a breakdown for an indicator?",
		"choices": [
			"To segment scores by dimensions such as assignment group, priority, or location",
			"To disable automated collection",
			"To define SMTP relay hostnames",
			"To store integration credentials"
		],
		"correctIndex": 0,
		"explanation": "Breakdowns slice indicator results by reference data or other dimensions for comparative views.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-now-intelligence/page/use/performance-analytics/concept/c_CreatingBreakdowns.html"
		]
	},
	{
		"trackCode": "CIS-PA",
		"order": 2,
		"prompt": "Data collection for Performance Analytics is primarily responsible for:",
		"choices": [
			"Gathering indicator scores on a schedule or through manual actions",
			"Creating update sets for widgets",
			"Publishing scoped applications to the Store",
			"Rotating database encryption keys"
		],
		"correctIndex": 0,
		"explanation": "Collection jobs populate PA tables from defined sources so dashboards reflect current and historical scores.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-now-intelligence/page/use/performance-analytics/concept/optimized-data-collection.html"
		]
	},
	{
		"trackCode": "CIS-PA",
		"order": 3,
		"prompt": "Which statement about Performance Analytics dashboards is most accurate?",
		"choices": [
			"Dashboards assemble widgets that visualize indicators and related scores for consumers",
			"Dashboards cannot reference PA indicators",
			"Widgets may only show static text without queries",
			"Targets cannot be associated with indicators"
		],
		"correctIndex": 0,
		"explanation": "Dashboards compose visual elements fed by indicators and other PA content.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-now-intelligence/page/use/performance-analytics/task/t_CreateADashboard.html"
		]
	},
	{
		"trackCode": "CIS-PA",
		"order": 4,
		"prompt": "A formula indicator is most appropriate when you need to:",
		"choices": [
			"Derive a value from arithmetic or functions on other indicators",
			"Replace CMDB identification rules",
			"Configure SAML single logout",
			"Define email routing rules"
		],
		"correctIndex": 0,
		"explanation": "Formula indicators compute results from other indicators using expressions defined in PA.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/now-intelligence/performance-analytics/formula-indicators.html"
		]
	},
	{
		"trackCode": "CIS-SP",
		"order": 0,
		"prompt": "Telecommunications service operations solutions on ServiceNow commonly emphasize which outcome?",
		"choices": [
			"Unifying customer- and network-oriented service workflows for communication service providers",
			"Removing CMDB usage entirely",
			"Disabling all scoped applications",
			"Eliminating integration with external inventory systems"
		],
		"correctIndex": 0,
		"explanation": "Telecom service operations documentation positions the product around CSP workflows spanning service and operations domains.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-telecom-service-ops/page/product/tmt-telecom-service-operations-mgt/concept/telecom-service-operations-mgt-overview.html"
		]
	},
	{
		"trackCode": "CIS-SP",
		"order": 1,
		"prompt": "In IntegrationHub, what is a spoke best characterized as?",
		"choices": [
			"A scoped package that delivers actions and related artifacts to connect with external systems",
			"A UI Policy applied to the email client",
			"A PA breakdown source table",
			"A clone preserver record"
		],
		"correctIndex": 0,
		"explanation": "Spokes package integration content such as actions for use from flows and integrations.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-integrate-applications/page/administer/integrationhub/concept/integrationhub.html"
		]
	},
	{
		"trackCode": "CIS-SP",
		"order": 2,
		"prompt": "Delegated development is intended to help organizations:",
		"choices": [
			"Empower designated non-admin developers to work within governed application boundaries",
			"Remove all testing requirements before production",
			"Disable update set tracking",
			"Hide all ACL evaluations"
		],
		"correctIndex": 0,
		"explanation": "Delegated development lets admins delegate scoped development tasks to trusted users under application-level controls.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-application-development/page/build/applications/concept/c_DelegatedDevelopment.html"
		]
	},
	{
		"trackCode": "CIS-SP",
		"order": 3,
		"prompt": "Why is accurate CMDB class modeling important for provider-scale service and impact workflows?",
		"choices": [
			"Inherited classes and attributes support consistent impact analysis and service mapping",
			"It prevents users from opening lists",
			"It replaces Flow Designer entirely",
			"It removes the need for import sets"
		],
		"correctIndex": 0,
		"explanation": "CMDB class models define how CIs specialize from base classes, which underpins reporting and operational use cases.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/vancouver-servicenow-platform/page/product/configuration-management/concept/cmdb-ci-class-models.html"
		]
	},
	{
		"trackCode": "CIS-SP",
		"order": 4,
		"prompt": "What should a platform upgrade plan explicitly include to reduce operational risk during a major release?",
		"choices": [
			"Scope review, environment sequencing, validation of critical integrations, and rollback considerations",
			"Permanent deletion of sub-production instances before testing",
			"Global disablement of business rules without a backlog",
			"Skipping review of skipped updates"
		],
		"correctIndex": 0,
		"explanation": "Upgrade planning documentation stresses structured preparation, testing across environments, and managing outcomes such as skipped updates.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/vancouver-platform-administration/page/administer/upgrade-center/concept/uc-upgrade-plan.html"
		]
	},
	{
		"trackCode": "CPOA",
		"order": 0,
		"prompt": "Why do platform owners maintain separate production and sub-production instances?",
		"choices": [
			"To test changes safely, validate integrations, and promote work without risking live service",
			"To ensure every user edits production forms directly",
			"To eliminate backups",
			"To store integrations only on workstations"
		],
		"correctIndex": 0,
		"explanation": "Clone and environment practices separate live operations from development and test cycles.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/vancouver-platform-administration/page/administer/managing-data/task/t_CreateACloneTarget.html"
		]
	},
	{
		"trackCode": "CPOA",
		"order": 1,
		"prompt": "Which activity is central to governing platform upgrades over time?",
		"choices": [
			"Following a defined upgrade process that includes preparation, testing, and review of outcomes",
			"Deploying patches to production without a test cycle",
			"Ignoring release notes",
			"Disabling the Upgrade Center permanently"
		],
		"correctIndex": 0,
		"explanation": "Platform upgrade documentation describes lifecycle steps for preparing and executing family upgrades.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-platform-administration/page/administer/platform-upgrades/concept/platform-upgrades.html"
		]
	},
	{
		"trackCode": "CPOA",
		"order": 2,
		"prompt": "Why should platform owners review skipped updates after an upgrade?",
		"choices": [
			"Skipped updates highlight conflicts between customer changes and base versions that must be resolved",
			"Skipped updates are always safe to ignore indefinitely",
			"Skipped updates delete all Script Includes",
			"Skipped updates only affect email logs"
		],
		"correctIndex": 0,
		"explanation": "Resolving skipped updates reconciles customization with new baseline changes using guided tasks.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/vancouver-platform-administration/page/customer-support/task/t_ResolveASkippedUpdate.html"
		]
	},
	{
		"trackCode": "CPOA",
		"order": 3,
		"prompt": "Before scheduling a production upgrade, what should owners prioritize from a risk perspective?",
		"choices": [
			"Assessing customization, integrations, and regression test coverage documented in the upgrade plan",
			"Increasing unaudited direct production edits",
			"Deferring all security patches",
			"Removing sub-production clones"
		],
		"correctIndex": 0,
		"explanation": "Upgrade planning materials emphasize analyzing scope and validating critical capabilities before production cutover.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/vancouver-platform-administration/page/administer/upgrade-center/concept/uc-upgrade-plan.html"
		]
	},
	{
		"trackCode": "CPOA",
		"order": 4,
		"prompt": "What is a sound practice for governing many third-party integrations on the Now Platform?",
		"choices": [
			"Use centralized integration capabilities, managed connections, and reusable actions rather than one-off bespoke endpoints per team",
			"Share production credentials in chat for speed",
			"Avoid documenting spokes or flows",
			"Use a single unnamed integration user for every system"
		],
		"correctIndex": 0,
		"explanation": "IntegrationHub documentation describes managed integrations through spokes, actions, and connection management.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-integrate-applications/page/administer/integrationhub/concept/integrationhub.html"
		]
	},
	{
		"trackCode": "CPOP",
		"order": 0,
		"prompt": "A platform owner is steering an instance toward safer upgrades. Which approach best preserves upgradeability while still delivering change?",
		"choices": [
			"Encourage direct edits to baseline system records whenever it is faster",
			"Keep large bespoke changes in the global scope without packaging or ownership",
			"Deliver changes through scoped applications with clear ownership boundaries and interfaces",
			"Routinely capture production ticket rows in update sets for reuse"
		],
		"correctIndex": 2,
		"explanation": "Scoped applications package configuration with explicit boundaries, which reduces accidental collisions with baseline updates compared with unmanaged global edits or misusing update sets for data.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-servicenow-platform/page/app-store/dev_portal/application_model/concept/c_ApplicationScopes.html",
			"https://www.servicenow.com/docs/r/application-development/system-update-sets.html"
		]
	},
	{
		"trackCode": "CPOP",
		"order": 1,
		"prompt": "Which outcome is most aligned with relationship governance for CMDB data?",
		"choices": [
			"Automatically deleting CIs that have not been scanned in 30 days",
			"Defining and enforcing how relationships are created and maintained so the service model stays trustworthy",
			"Replacing the need for Discovery schedules with manual Excel imports",
			"Encrypting all relationship records at rest by default"
		],
		"correctIndex": 1,
		"explanation": "Relationship governance is about controlled creation and maintenance of relationships so CMDB topology reflects reality and can be relied on for decisions.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-servicenow-platform/page/product/configuration-management/concept/relationship-governance.html"
		]
	},
	{
		"trackCode": "CPOP",
		"order": 2,
		"prompt": "In Knowledge Management, what is a primary purpose of enabling ownership groups?",
		"choices": [
			"To replace categories and knowledge bases entirely",
			"To assign editorial responsibility and manage access for article lifecycle work",
			"To route every incident to the article author automatically",
			"To store article encryption keys separately from the instance"
		],
		"correctIndex": 1,
		"explanation": "Ownership groups associate people with responsibility for knowledge content and its governance rather than replacing taxonomy or acting as encryption storage.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/servicenow-platform/knowledge-management/enable-ownership-group.html"
		]
	},
	{
		"trackCode": "CPOP",
		"order": 3,
		"prompt": "When comparing update sets to typical ITSM transactional records, what is the key distinction a platform owner should reinforce?",
		"choices": [
			"Update sets are the preferred way to move thousands of incident rows to production",
			"Update sets primarily move configuration metadata between instances, not day-to-day business data",
			"Update sets replace the need for scoped applications",
			"Update sets should include end-user attachments for completeness"
		],
		"correctIndex": 1,
		"explanation": "Update sets are intended for moving configuration between instances; operational records belong to data migration or integration patterns, not update sets.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/application-development/system-update-sets.html",
			"https://www.servicenow.com/docs/bundle/vancouver-application-development/page/build/system-update-sets/concept/update-set-procedures.html"
		]
	},
	{
		"trackCode": "CPOP",
		"order": 4,
		"prompt": "Which scenario best illustrates a platform-owner guardrail that protects long-term maintainability?",
		"choices": [
			"Granting broad admin rights on production to speed up testing",
			"Allowing unmanaged customization in the global scope without standards",
			"Establishing promotion practices and packaging expectations before changes reach production",
			"Discouraging documentation because the platform is self-explanatory"
		],
		"correctIndex": 2,
		"explanation": "Controlled promotion and packaging expectations reduce surprise failures and rework, which is central to platform ownership and sustainable operations.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/vancouver-application-development/page/build/system-update-sets/concept/update-set-procedures.html"
		]
	},
	{
		"trackCode": "CPOE",
		"order": 0,
		"prompt": "An enterprise runs separate subproduction and production instances. What is the primary risk of promoting a large, unbatched configuration drop during peak hours without a prior lower-environment validation?",
		"choices": [
			"MID Servers will automatically refuse the payload",
			"Users will lose their UI16 theme preferences",
			"Higher chance of service disruption from cache flush and unresolved conflicts discovered late",
			"Domain separation will merge all domains automatically"
		],
		"correctIndex": 2,
		"explanation": "Large configuration promotions can impact runtime behavior and benefit from staged validation; operational timing also matters when changes flush caches or stress integrations.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/vancouver-application-development/page/build/system-update-sets/concept/update-set-procedures.html"
		]
	},
	{
		"trackCode": "CPOE",
		"order": 1,
		"prompt": "Domain separation is most accurately described as which kind of control?",
		"choices": [
			"A licensing feature that limits the number of MID Servers",
			"A logical separation model for data and processes within a single instance when multi-tenant isolation is required",
			"A replacement for Discovery patterns",
			"A tool that deletes cross-domain references nightly"
		],
		"correctIndex": 1,
		"explanation": "Domain separation provides logical isolation domains within one instance to support segregated data and processes for different parts of the business.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-platform-security/page/administer/company-and-domain-separation/concept/c_DomainSeparation.html",
			"https://www.servicenow.com/docs/r/platform-security/c_DomainSeparation.html"
		]
	},
	{
		"trackCode": "CPOE",
		"order": 2,
		"prompt": "Why do platform owners commonly prefer scoped applications over unmanaged global-scope changes for net-new capability?",
		"choices": [
			"Scoped applications disable all integrations automatically",
			"Scoped applications bundle artifacts under an application boundary, reducing accidental cross-team collisions",
			"Scoped applications cannot be moved between instances",
			"Scoped applications prohibit testing in subproduction"
		],
		"correctIndex": 1,
		"explanation": "Application scoping isolates files and configuration boundaries, which helps teams collaborate without constantly stepping on shared global artifacts.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-servicenow-platform/page/app-store/dev_portal/application_model/concept/c_ApplicationScopes.html"
		]
	},
	{
		"trackCode": "CPOE",
		"order": 3,
		"prompt": "After cloning, which practice better matches documented clone administration guidance for handling many in-flight update sets?",
		"choices": [
			"Ignore clone impacts because update sets are instance-local",
			"Manually retype configurations to avoid XML",
			"Use clone administration patterns to batch or manage update sets across the clone workflow",
			"Delete all completed update sets from production before cloning"
		],
		"correctIndex": 2,
		"explanation": "Clone workflows can affect how update sets are carried forward; clone administration guidance addresses batching and management rather than ad hoc manual rework.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/platform-administration/clone-update-sets-example.html"
		]
	},
	{
		"trackCode": "CPOE",
		"order": 4,
		"prompt": "When CMDB relationship quality degrades across many teams, what is the most systemic remediation aligned with platform documentation themes?",
		"choices": [
			"Turn off Discovery until relationships stabilize",
			"Enforce relationship governance practices and ownership so relationship creation is deliberate",
			"Require every incident to create five relationships",
			"Store relationships only in spreadsheets outside ServiceNow"
		],
		"correctIndex": 1,
		"explanation": "Relationship governance focuses on how relationships are introduced and maintained so the CMDB remains authoritative for service modeling.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-servicenow-platform/page/product/configuration-management/concept/relationship-governance.html"
		]
	},
	{
		"trackCode": "CIS-DISCO",
		"order": 0,
		"prompt": "Which statement best describes how a MID Server participates in Discovery work orchestration?",
		"choices": [
			"It replaces the need for credentials on targets",
			"It executes discovery work delegated through platform messaging such as the External Communication Channel queue",
			"It stores the authoritative CMDB on the local subnet",
			"It only supports SNMP and cannot be used for WMI workloads"
		],
		"correctIndex": 1,
		"explanation": "MID Servers pick up work from the instance and perform discovery actions in the network; the ECC queue is the standard integration path for that orchestration.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-servicenow-platform/page/product/mid-server/concept/c_MIDServerConfiguration.html"
		]
	},
	{
		"trackCode": "CIS-DISCO",
		"order": 1,
		"prompt": "Horizontal Discovery patterns are authored and executed differently than classic probe/sensor-only approaches in which way?",
		"choices": [
			"Patterns are written in Java only",
			"Patterns are expressed using the pattern language and processed during discovery stages that populate CMDB details",
			"Patterns cannot run on MID Servers",
			"Patterns bypass classification entirely"
		],
		"correctIndex": 1,
		"explanation": "Pattern-based horizontal discovery uses the pattern designer language and processing to interpret collected information and update configuration details.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-operations-management/discovery/c-UsingPatternsForHorizontalDiscovery.html"
		]
	},
	{
		"trackCode": "CIS-DISCO",
		"order": 2,
		"prompt": "Discovery credentials are used to do what during a scan?",
		"choices": [
			"License the MID Server to the instance",
			"Authenticate to targets so probes and patterns can retrieve configuration details",
			"Replace the need for schedules",
			"Encrypt the ECC queue at rest"
		],
		"correctIndex": 1,
		"explanation": "Credentials supply authentication material so discovery actions can log in or query targets successfully.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-platform-security/page/product/credentials/concept/discovery-credential-alias.html"
		]
	},
	{
		"trackCode": "CIS-DISCO",
		"order": 3,
		"prompt": "A Discovery schedule primarily defines which aspects of a discovery job?",
		"choices": [
			"Only the CMDB deduplication task",
			"What to scan, where to scan, and when to scan",
			"The event management connector throttle",
			"The hardware asset disposal workflow"
		],
		"correctIndex": 1,
		"explanation": "Schedules bind scope, targets or ranges, timing, and discovery behavior into an executable plan.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-it-operations-management/page/product/discovery/task/t_CreateADiscoverySchedule.html"
		]
	},
	{
		"trackCode": "CIS-DISCO",
		"order": 4,
		"prompt": "Pattern-based discovery concepts in ITOM documentation are commonly associated with which benefit?",
		"choices": [
			"Eliminating the MID Server requirement for all clouds",
			"A more modular, flow-driven approach to collecting and interpreting host and application details",
			"Removing the CMDB as a destination for discovery results",
			"Disabling horizontal discovery permanently"
		],
		"correctIndex": 1,
		"explanation": "Pattern-based discovery emphasizes structured, reusable flows for interpreting discovery results compared with ad hoc scripting-only approaches.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-operations-management/service-mapping/pattern-based-discovery.html"
		]
	},
	{
		"trackCode": "CIS-EM",
		"order": 0,
		"prompt": "According to Event Management product documentation themes, what is a primary goal of the Event Management application?",
		"choices": [
			"Replace Incident Management entirely",
			"Turn monitoring signals into actionable operational visibility such as alerts on CIs and services",
			"Act as the authoritative payroll system of record",
			"Perform software license true-ups"
		],
		"correctIndex": 1,
		"explanation": "Event Management ingests monitoring events to drive operational response objects like alerts tied to the environment being monitored.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-operations-management/event-management/exploring-event-management.html"
		]
	},
	{
		"trackCode": "CIS-EM",
		"order": 1,
		"prompt": "Connectors and listeners in Event Management are intended to help you do what?",
		"choices": [
			"Delete all events older than one hour unconditionally",
			"Integrate external monitoring sources with ServiceNow event ingestion",
			"Replace Discovery schedules",
			"Automatically retire hardware assets"
		],
		"correctIndex": 1,
		"explanation": "Connectors and listeners integrate third-party monitoring streams into the ServiceNow event pipeline.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-operations-management/event-management/connectors-and-listeners.html"
		]
	},
	{
		"trackCode": "CIS-EM",
		"order": 2,
		"prompt": "Alert management rules are best described as which kind of mechanism?",
		"choices": [
			"Configuration that automates how alerts are handled after they are created",
			"A MID Server installation package",
			"A hardware model normalization engine",
			"A Discovery pattern debugger"
		],
		"correctIndex": 0,
		"explanation": "Alert management rules operationalize alert lifecycle behaviors such as notifications, tasks, or other responses tied to alert conditions.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-operations-management/event-management/create-alert-management-rule.html",
			"https://www.servicenow.com/docs/bundle/xanadu-it-operations-management/page/product/event-management/concept/alert-management-rule.html"
		]
	},
	{
		"trackCode": "CIS-EM",
		"order": 3,
		"prompt": "Which statement best matches how events relate to alerts in a typical Event Management flow?",
		"choices": [
			"Alerts are never created from events",
			"Events are only stored if an incident already exists",
			"Events and alerts are unrelated tables with no transforms",
			"Events are normalized and processed so they can result in alert records"
		],
		"correctIndex": 3,
		"explanation": "The pipeline ingests events, applies processing, and can materialize or update alerts for operators to act on.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-operations-management/event-management/exploring-event-management.html"
		]
	},
	{
		"trackCode": "CIS-EM",
		"order": 4,
		"prompt": "When planning connector-based ingestion, which consideration is most central to operational design?",
		"choices": [
			"Connectors remove the need for any CMDB CI data",
			"You must choose integration styles and endpoints that match how your monitoring tools can deliver events",
			"Listeners require disabling TLS for all traffic",
			"Email is the only supported transport"
		],
		"correctIndex": 1,
		"explanation": "Connector design must reflect how each monitoring stack emits events and what protocols are supported, as described in connector and listener documentation.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-operations-management/event-management/connectors-and-listeners.html"
		]
	},
	{
		"trackCode": "CIS-HAM",
		"order": 0,
		"prompt": "When introducing consumable-like hardware that is tracked as inventory rather than as a fully financialized asset, what does product guidance commonly recommend you configure?",
		"choices": [
			"A software license certificate",
			"A hardware consumable model aligned to how the item is tracked",
			"An event management transform map",
			"A domain separation policy"
		],
		"correctIndex": 1,
		"explanation": "Hardware consumable models align tracking behavior with items managed as consumables in Hardware Asset Management.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/zurich-it-asset-management/page/product/hardware-asset-management/task/create-hardware-consumable-model.html"
		]
	},
	{
		"trackCode": "CIS-HAM",
		"order": 1,
		"prompt": "Stockrooms in Hardware Asset Management primarily support which operational need?",
		"choices": [
			"Managing physical locations and inventory levels for fulfillment",
			"Authoring Discovery patterns",
			"Correlating SNMP traps",
			"Defining SAML authentication flows"
		],
		"correctIndex": 0,
		"explanation": "Stockroom documentation focuses on where inventory lives and how stock is managed for operational fulfillment.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-asset-management/hardware-asset-management/manage-your-stockrooms.html"
		]
	},
	{
		"trackCode": "CIS-HAM",
		"order": 2,
		"prompt": "What is a fair high-level description of Hardware Asset Management scope in ServiceNow documentation?",
		"choices": [
			"Only software license reclamation",
			"Lifecycle-oriented tracking and operational processes for hardware assets",
			"Exclusive network automation for routers",
			"Replacement for Service Mapping"
		],
		"correctIndex": 1,
		"explanation": "HAM documentation centers on hardware lifecycle and operational tracking capabilities rather than unrelated ITOM areas.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-it-asset-management/page/product/hardware-asset-management/concept/exploring-ham.html"
		]
	},
	{
		"trackCode": "CIS-HAM",
		"order": 3,
		"prompt": "Asset bundles in Hardware Asset Management are intended to help you manage which situation?",
		"choices": [
			"Single-monitor disposal only",
			"Groups of complex assets treated as one logical master where appropriate",
			"VPN tunnel encryption policies",
			"Orchestration spoke licensing"
		],
		"correctIndex": 1,
		"explanation": "Asset bundles concepts describe managing grouped hardware as a cohesive unit for operational simplicity.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-it-asset-management/page/product/hardware-asset-management/concept/asset-bundles-concept.html"
		]
	},
	{
		"trackCode": "CIS-HAM",
		"order": 4,
		"prompt": "Before users can request a tracked hardware item from a catalog, which foundation is most commonly required?",
		"choices": [
			"A working hardware model and fulfillment path aligned to your process",
			"Disabling the CMDB",
			"Deleting all stockrooms",
			"Removing procurement integrations globally"
		],
		"correctIndex": 0,
		"explanation": "Catalog fulfillment for hardware depends on modeled items and the operational path from request to delivery, consistent with HAM and catalog documentation themes.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-servicenow-platform/page/product/service-catalog-management/concept/c_RequestingAServiceCatalogItem.html",
			"https://www.servicenow.com/docs/bundle/xanadu-it-asset-management/page/product/hardware-asset-management/concept/exploring-ham.html"
		]
	},
	{
		"trackCode": "CIS-ITSM",
		"order": 0,
		"prompt": "In Incident Management, what is the primary process goal emphasized in ITSM documentation?",
		"choices": [
			"Restore normal service operation as quickly as practical",
			"Perform root-cause analysis for every alert before any workaround",
			"Approve all infrastructure purchases",
			"Normalize software publishers"
		],
		"correctIndex": 0,
		"explanation": "Incident Management prioritizes restoration of service to minimize business impact, distinct from deeper problem investigation.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-it-service-management/page/product/incident-management/concept/c_IncidentManagement.html"
		]
	},
	{
		"trackCode": "CIS-ITSM",
		"order": 1,
		"prompt": "Change Management in ITSM is primarily designed to do what?",
		"choices": [
			"Log every password reset as a catalog task",
			"Control how changes are proposed, assessed, approved, and implemented to reduce service risk",
			"Replace the CMDB with spreadsheets",
			"Automatically close all incidents nightly"
		],
		"correctIndex": 1,
		"explanation": "Change Management provides controlled workflows for planning and governance of changes rather than ad hoc production edits.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/zurich-it-service-management/page/product/change-management/concept/using-change-management.html"
		]
	},
	{
		"trackCode": "CIS-ITSM",
		"order": 2,
		"prompt": "How does Problem Management differ from Incident Management in purpose?",
		"choices": [
			"Problems are only for printer issues",
			"Problem Management targets underlying causes and preventive action, while Incident Management targets rapid restoration",
			"Problem Management never uses tasks",
			"Incident Management never uses knowledge"
		],
		"correctIndex": 1,
		"explanation": "Problem Management focuses on root cause and recurrence prevention complementary to incident restoration goals.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-it-service-management/page/product/problem-management/concept/problem-mgmt-lifecycle.html"
		]
	},
	{
		"trackCode": "CIS-ITSM",
		"order": 3,
		"prompt": "On an incident, priority is commonly derived from which inputs in a standard configuration?",
		"choices": [
			"Only the caller’s department",
			"Only the assigned group’s cost center",
			"Only the short description length",
			"Impact and urgency interpreted through priority rules"
		],
		"correctIndex": 3,
		"explanation": "Incident priority is typically driven from impact and urgency using configured priority data or rules associated with incident management.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-it-service-management/page/product/incident-management/concept/c_IncidentManagement.html"
		]
	},
	{
		"trackCode": "CIS-ITSM",
		"order": 4,
		"prompt": "Which request type best fits the Service Catalog request experience versus a break-fix incident?",
		"choices": [
			"A user orders a standard service offering through the catalog",
			"A Sev-1 outage bridge for an email service",
			"A monitoring alert storm review",
			"A post-mortem for a security breach"
		],
		"correctIndex": 0,
		"explanation": "Catalog requests represent planned service consumption, whereas incidents represent unplanned service degradation.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-servicenow-platform/page/product/service-catalog-management/concept/c_RequestingAServiceCatalogItem.html",
			"https://www.servicenow.com/docs/bundle/xanadu-it-service-management/page/product/incident-management/concept/c_IncidentManagement.html"
		]
	},
	{
		"trackCode": "CIS-RC",
		"order": 0,
		"prompt": "In ServiceNow Governance, Risk, and Compliance (GRC) practice, which set of three practice areas is commonly described as the core pillars of GRC?",
		"choices": [
			"Governance, Risk, and Compliance",
			"Procurement, Projects, and Performance",
			"Security, Service, and Support",
			"Change, Configuration, and Capacity"
		],
		"correctIndex": 0,
		"explanation": "ServiceNow GRC documentation frames GRC as the combination of governance, risk, and compliance practices used to align strategy, manage uncertainty, and demonstrate adherence to obligations.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/governance-risk-compliance/r_WhatIsGRC.html"
		]
	},
	{
		"trackCode": "CIS-RC",
		"order": 1,
		"prompt": "Which outcome best matches the intent of Integrated Risk Management (IRM) on the Now Platform?",
		"choices": [
			"Centralize visibility and prioritization across risk types instead of managing each risk domain in isolation",
			"Replace the CMDB with a standalone risk spreadsheet system",
			"Eliminate the need for policies, controls, or audits",
			"Limit risk reporting to IT incidents only"
		],
		"correctIndex": 0,
		"explanation": "IRM is positioned as a unifying approach that helps organizations see and prioritize risk holistically across the enterprise rather than only within siloed programs.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/governance-risk-compliance/grc-risk-management-workspace/risk-impl-overview.html"
		]
	},
	{
		"trackCode": "CIS-RC",
		"order": 2,
		"prompt": "In Policy and Compliance Management, what is the primary purpose of documenting and managing controls in the GRC suite?",
		"choices": [
			"Provide evidence-ready linkage between obligations, control activities, and testing outcomes",
			"Automatically delete incidents older than 30 days",
			"Replace change management approvals",
			"Configure single sign-on for all vendors"
		],
		"correctIndex": 0,
		"explanation": "GRC control documentation supports structured compliance management by connecting regulatory or policy requirements to control design and operational evidence.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/governance-risk-compliance/policy-and-compliance-management/c_GRCControls.html"
		]
	},
	{
		"trackCode": "CIS-RC",
		"order": 3,
		"prompt": "A customer wants a guided, repeatable approach to identify and intake new risks into their risk register. Which GRC artifact is most aligned to that goal?",
		"choices": [
			"A risk identification playbook used within the risk management workspace",
			"A hardware discovery pattern",
			"A software reclamation workflow",
			"A cloud provisioning blueprint"
		],
		"correctIndex": 0,
		"explanation": "ServiceNow provides risk identification playbook guidance as part of the GRC risk management workspace to standardize how new risks are captured and progressed.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/governance-risk-compliance/grc-risk-management-workspace/risk-identification-playbook.html"
		]
	},
	{
		"trackCode": "CIS-RC",
		"order": 4,
		"prompt": "In Audit Management, audit tasks are most accurately described as the work items that auditors execute during which phase of an engagement?",
		"choices": [
			"Fieldwork activities such as control testing, evidence collection, and follow-ups",
			"Only hardware procurement approvals",
			"Only employee onboarding checklists",
			"Only software license reclamation"
		],
		"correctIndex": 0,
		"explanation": "Audit task documentation is oriented around executing and tracking the detailed audit procedures performed after scoping and planning.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/governance-risk-compliance/audit-management/c_AuditTasks.html"
		]
	},
	{
		"trackCode": "CIS-SIR",
		"order": 0,
		"prompt": "When a ransomware event requires coordinated war-room style response across security and business stakeholders, which Security Incident Response capability is most specifically designed for that scenario?",
		"choices": [
			"Major Security Incident Management",
			"Software normalization",
			"Service catalog checkout",
			"Hardware asset disposal"
		],
		"correctIndex": 0,
		"explanation": "Major Security Incident Management is documented as the collaborative response model for high-impact security incidents such as ransomware and large-scale breaches.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/security-management/security-incident-response/major-security-incident-management.html"
		]
	},
	{
		"trackCode": "CIS-SIR",
		"order": 1,
		"prompt": "What is the primary operational benefit of using security incident response playbooks in ServiceNow?",
		"choices": [
			"Standardize and automate repeatable response steps to reduce manual handoffs and response time",
			"Guarantee zero false positives from SIEM alerts",
			"Remove the need for a CMDB",
			"Replace vulnerability scanning tools"
		],
		"correctIndex": 0,
		"explanation": "Playbook documentation focuses on consistent, repeatable response procedures that can be orchestrated as part of security operations workflows.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/security-management/security-incident-response/security-incident-playbook.html"
		]
	},
	{
		"trackCode": "CIS-SIR",
		"order": 2,
		"prompt": "Why do security teams associate MITRE ATT&CK tactics and techniques with a security incident record?",
		"choices": [
			"Add structured adversary behavior context that supports prioritization, investigation, and defensive planning",
			"Automatically patch all endpoints",
			"Create new business applications in SPM",
			"Normalize software publishers for audits"
		],
		"correctIndex": 0,
		"explanation": "MITRE ATT&CK alignment in Security Incident Response is documented to enrich incidents with standardized threat behavior context.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/security-management/security-incident-response/mitre-attack-defend-graph-sir.html"
		]
	},
	{
		"trackCode": "CIS-SIR",
		"order": 3,
		"prompt": "Which statement best describes how Security Incident Response typically fits into ServiceNow Security Operations?",
		"choices": [
			"It orchestrates triage, assignment, and remediation coordination across security and IT teams",
			"It only tracks facilities access badges",
			"It is limited to HR case management",
			"It replaces the Configuration Management Database"
		],
		"correctIndex": 0,
		"explanation": "Security Incident Response is positioned as a Security Operations capability that streamlines cross-team coordination for security incidents.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/security-management/security-incident-response/major-security-incident-management.html"
		]
	},
	{
		"trackCode": "CIS-SIR",
		"order": 4,
		"prompt": "When parent and child security incidents exist, what does rolling up MITRE ATT&CK information commonly help analysts maintain?",
		"choices": [
			"A consolidated view of tactics and techniques at the parent incident as child investigations progress",
			"Automatic firewall rule deletion",
			"Discovery of printer hardware",
			"Software model creation"
		],
		"correctIndex": 0,
		"explanation": "Documentation describes rolling up MITRE ATT&CK details from child security incidents to support parent-level reporting and analysis.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/yokohama-security-management/page/product/threat-intelligence/task/rollup-mitre-att-ck-information-from-child-security-incidents.html"
		]
	},
	{
		"trackCode": "CIS-SM",
		"order": 0,
		"prompt": "In Service Mapping, what is an application service?",
		"choices": [
			"A logical grouping of connected applications and hosts that work together to deliver a business-facing service",
			"A single network interface card",
			"A project task in Agile Development",
			"A vendor contract record"
		],
		"correctIndex": 0,
		"explanation": "Service mapping documentation defines an application service as connected applications and infrastructure components that jointly provide a service.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-operations-management/service-mapping/service-mapping-get-started.html"
		]
	},
	{
		"trackCode": "CIS-SM",
		"order": 1,
		"prompt": "Why is a healthy CMDB foundation commonly emphasized before expanding service mapping coverage?",
		"choices": [
			"Service maps depend on reliable configuration items and relationships to build accurate dependency views",
			"CMDB health is unrelated to mapping accuracy",
			"Service mapping never reads CMDB data",
			"Discovery must be disabled first"
		],
		"correctIndex": 0,
		"explanation": "Getting started guidance ties successful mapping to solid configuration data quality because maps are built from CMDB relationships and CI detail.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-operations-management/service-mapping/service-mapping-get-started.html"
		]
	},
	{
		"trackCode": "CIS-SM",
		"order": 2,
		"prompt": "Which outcome is a primary benefit of maintaining up-to-date service maps for IT operations?",
		"choices": [
			"Faster impact analysis and prioritization based on business service context",
			"Eliminating the need for incident records",
			"Removing change management governance",
			"Guaranteeing 100% patch compliance without scanning"
		],
		"correctIndex": 0,
		"explanation": "Service mapping is positioned to make operations service-aware so teams can understand what infrastructure supports a business service when issues occur.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-operations-management/service-mapping/service-mapping-get-started.html"
		]
	},
	{
		"trackCode": "CIS-SM",
		"order": 3,
		"prompt": "Service Mapping is part of which ServiceNow solution area?",
		"choices": [
			"IT Operations Management",
			"Human Resources Service Delivery",
			"Legal Service Management",
			"Accounts Payable Operations"
		],
		"correctIndex": 0,
		"explanation": "Service Mapping documentation is published under the IT Operations Management documentation set as an ITOM capability.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-operations-management/service-mapping/service-mapping-get-started.html"
		]
	},
	{
		"trackCode": "CIS-SM",
		"order": 4,
		"prompt": "Compared with only inventorying devices, what additional question does Service Mapping most directly help answer for a CIO dashboard?",
		"choices": [
			"Which business services are supported by the discovered applications and infrastructure",
			"How many cafeterias the company operates",
			"The exact salary for every employee",
			"The corporate holiday schedule"
		],
		"correctIndex": 0,
		"explanation": "Service mapping focuses on dependency and service context—connecting technical components to the services the business relies on.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-operations-management/service-mapping/service-mapping-get-started.html"
		]
	},
	{
		"trackCode": "CIS-SAM",
		"order": 0,
		"prompt": "In Software Asset Management, what do calculated lifecycles primarily help organizations represent?",
		"choices": [
			"Time-based or rules-driven lifecycle positions that support compliance and renewal decisions",
			"Physical datacenter rack elevations only",
			"Employee performance review cycles",
			"Firewall ACL timelines only"
		],
		"correctIndex": 0,
		"explanation": "SAM documentation describes calculated lifecycles as part of lifecycle analytics for software assets.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-asset-management/now-assist-for-software-asset-management-sam/calculated-lifecycles.html"
		]
	},
	{
		"trackCode": "CIS-SAM",
		"order": 1,
		"prompt": "What is the main purpose of the Software Asset Management lifecycle management dashboard?",
		"choices": [
			"Provide portfolio visibility into software lifecycle status for operational and compliance conversations",
			"Manage third-party inherent risk questionnaires",
			"Run major security incident war rooms",
			"Create strategic roadmaps for corporate goals"
		],
		"correctIndex": 0,
		"explanation": "The lifecycle management dashboard is documented as a SAM operational view for lifecycle posture across the software estate.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-asset-management/now-assist-for-software-asset-management-sam/lifecycle-management-dashboard.html"
		]
	},
	{
		"trackCode": "CIS-SAM",
		"order": 2,
		"prompt": "Why are software models important in IT Asset Management product catalog practice?",
		"choices": [
			"They normalize and standardize how discovered or purchased software is represented for reporting and management",
			"They replace all CMDB classes",
			"They configure single sign-on providers",
			"They store ransomware playbooks"
		],
		"correctIndex": 0,
		"explanation": "Product catalog documentation explains creating and managing software models as the standardized representation of software products.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-it-asset-management/page/product/product-catalog/concept/c_CreatingSoftwareModels.html"
		]
	},
	{
		"trackCode": "CIS-SAM",
		"order": 3,
		"prompt": "Which scenario best fits Software Asset Management rather than only IT hardware asset tracking?",
		"choices": [
			"Reconciling purchased entitlements to installations and SaaS usage to reduce audit and overspend risk",
			"Tracking only monitor serial numbers with no license data",
			"Managing building maintenance work orders",
			"Scheduling physical security guard patrols"
		],
		"correctIndex": 0,
		"explanation": "SAM documentation emphasizes entitlement, deployment, and usage alignment for software across deployment models.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-asset-management/now-assist-for-software-asset-management-sam/calculated-lifecycles.html"
		]
	},
	{
		"trackCode": "CIS-SAM",
		"order": 4,
		"prompt": "What is a primary governance outcome of maintaining accurate normalization from discovery models to software models?",
		"choices": [
			"More trustworthy compliance and optimization reports because titles roll up to a consistent catalog",
			"Eliminating the CMDB entirely",
			"Disabling all discovery schedules",
			"Removing approvals from the service catalog"
		],
		"correctIndex": 0,
		"explanation": "Software model guidance supports consistent catalog representation, which underpins trustworthy SAM metrics and decisions.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-it-asset-management/page/product/product-catalog/concept/c_CreatingSoftwareModels.html"
		]
	},
	{
		"trackCode": "CIS-SPM",
		"order": 0,
		"prompt": "In Strategic Planning, what is a strategic plan most commonly used to structure?",
		"choices": [
			"Goals, initiatives, and roadmap-style planning artifacts that connect strategy to execution",
			"Firewall zones and IDS rules",
			"Software publisher packs",
			"Vendor SOC 2 reports"
		],
		"correctIndex": 0,
		"explanation": "Strategic Planning documentation describes creating strategic plans to organize goals and planning content within SPM-related planning workflows.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-business-management/strategic-planning/create-strategic-plan-strategy.html"
		]
	},
	{
		"trackCode": "CIS-SPM",
		"order": 1,
		"prompt": "What does the Strategic Execution dashboard in Strategic Planning primarily provide to portfolio leaders?",
		"choices": [
			"Visibility into planning and execution progress aligned to strategic items in the Strategic Planning Workspace",
			"A CMDB discovery schedule editor",
			"A malware sandbox execution environment",
			"A hardware disposal certificate generator"
		],
		"correctIndex": 0,
		"explanation": "The strategic execution dashboard documentation is tied to monitoring strategic planning workspace execution outcomes.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-business-management/strategic-planning/strategic-execution-dashboard-spw.html"
		]
	},
	{
		"trackCode": "CIS-SPM",
		"order": 2,
		"prompt": "Now Assist for Strategic Portfolio Management is best described as helping teams do which of the following?",
		"choices": [
			"Apply generative AI assistance to SPM workflows such as summarization and intake acceleration",
			"Replace the need for any human portfolio decisions",
			"Automatically delete all project records nightly",
			"Configure database indexes for the CMDB"
		],
		"correctIndex": 0,
		"explanation": "Now Assist for SPM documentation describes AI-assisted capabilities for strategic portfolio management processes.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-business-management/now-assist-for-strategic-portfolio-management-spm/now-assist-spm.html"
		]
	},
	{
		"trackCode": "CIS-SPM",
		"order": 3,
		"prompt": "Which distinction best separates Strategic Portfolio Management from Adaptive Project Management in common ServiceNow descriptions?",
		"choices": [
			"SPM focuses on selecting and maintaining the right portfolio of investments; APM focuses on how work is delivered",
			"SPM only tracks hardware warranties",
			"APM replaces all GRC functions",
			"They are identical capabilities with different icons"
		],
		"correctIndex": 0,
		"explanation": "Public SPM positioning contrasts portfolio selection and maintenance with execution methodologies handled through adaptive project management.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-business-management/strategic-planning/create-strategic-plan-strategy.html"
		]
	},
	{
		"trackCode": "CIS-SPM",
		"order": 4,
		"prompt": "Which work outcome is most central to Strategic Portfolio Management programs?",
		"choices": [
			"Align funding and work to strategic goals with transparent roadmaps and progress tracking",
			"Normalize software discovery titles",
			"Run phishing response playbooks",
			"Perform vendor concentration mapping"
		],
		"correctIndex": 0,
		"explanation": "SPM documentation themes emphasize connecting strategy, planning, and execution visibility for investment decisions.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/it-business-management/now-assist-for-strategic-portfolio-management-spm/now-assist-spm.html"
		]
	},
	{
		"trackCode": "CIS-TPRM",
		"order": 0,
		"prompt": "What is the primary scope of Third-Party Risk Management on the Now Platform?",
		"choices": [
			"End-to-end vendor and third-party risk workflows from onboarding through monitoring and remediation",
			"Only employee travel reimbursement",
			"Only facilities badge printing",
			"Only IT password rotation"
		],
		"correctIndex": 0,
		"explanation": "TPRM reference documentation describes the third-party risk program capabilities delivered in the GRC suite.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/governance-risk-compliance/third-party-risk-management/tprm-reference.html"
		]
	},
	{
		"trackCode": "CIS-TPRM",
		"order": 1,
		"prompt": "According to the third-party risk product documentation landing concepts, what is a core benefit of consolidating third-party assessments in ServiceNow?",
		"choices": [
			"Increase visibility and consistency between periodic assessments and continuous monitoring signals",
			"Guarantee that vendors cannot have incidents",
			"Eliminate all regulatory obligations",
			"Remove procurement from the process entirely"
		],
		"correctIndex": 0,
		"explanation": "The third-party risk management landing documentation highlights improved visibility across assessments and monitoring as a program outcome.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-governance-risk-compliance/page/product/grc-vendor-risk/concept/third-party-risk-mgt-landing-page.html"
		]
	},
	{
		"trackCode": "CIS-TPRM",
		"order": 2,
		"prompt": "Why would an organization create questionnaire templates in Third-Party Risk Management?",
		"choices": [
			"Standardize due diligence and evidence collection across many vendors and assessment types",
			"Replace the incident table",
			"Configure SNMP traps",
			"Define JavaScript lint rules"
		],
		"correctIndex": 0,
		"explanation": "Vendor risk task documentation includes creating questionnaire templates to drive consistent third-party assessments.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-governance-risk-compliance/page/product/grc-vendor-risk/task/create-questionnaire-template.html"
		]
	},
	{
		"trackCode": "CIS-TPRM",
		"order": 3,
		"prompt": "Which activity best fits continuous monitoring in a third-party risk program?",
		"choices": [
			"Ingesting external risk intelligence signals to update vendor posture between full assessments",
			"Deleting all vendor records annually",
			"Disabling vendor portals",
			"Removing audit trails for assessments"
		],
		"correctIndex": 0,
		"explanation": "Third-party risk landing documentation discusses ongoing monitoring and intelligence as part of modern vendor risk programs.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-governance-risk-compliance/page/product/grc-vendor-risk/concept/third-party-risk-mgt-landing-page.html"
		]
	},
	{
		"trackCode": "CIS-TPRM",
		"order": 4,
		"prompt": "What is the main purpose of a third-party portal in vendor risk programs?",
		"choices": [
			"Enable vendors to complete questionnaires and supply evidence in a controlled collaboration channel",
			"Host internal employee payroll slips publicly",
			"Replace the CMDB",
			"Execute database backups"
		],
		"correctIndex": 0,
		"explanation": "TPRM reference material describes portal-based collaboration as part of third-party engagement workflows.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/governance-risk-compliance/third-party-risk-management/tprm-reference.html"
		]
	},
	{
		"trackCode": "CIS-VR",
		"order": 0,
		"prompt": "A vulnerability coordinator must open a formal workflow to engage an external software vendor about a reported security defect. Which documentation topic aligns with coordinating third-party security issues in Vulnerability Response?",
		"choices": [
			"Escalating a security issue to a third party",
			"Configuring password reset policies for end users",
			"Building a CMDB discovery pattern for printers",
			"Designing a catalog item for laptop requests"
		],
		"correctIndex": 0,
		"explanation": "Vulnerability Response product documentation includes a task for escalating security issues to third parties, which supports vendor coordination outside your organization.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/yokohama-security-management/page/product/vulnerability-response/task/escalate-sec-issue-3rdparty.html"
		]
	},
	{
		"trackCode": "CIS-VR",
		"order": 1,
		"prompt": "Your team imports scanner findings that reference CVE identifiers not yet represented for a third-party product entry. Which documented task helps associate CVE information with third-party vulnerability data?",
		"choices": [
			"Add a CVE entry related to a third-party vulnerability",
			"Create a procurement contract renewal record",
			"Publish a knowledge article for password policies",
			"Configure single sign-on for mobile email clients"
		],
		"correctIndex": 0,
		"explanation": "The Vulnerability Response documentation describes adding a CVE entry related to a third-party vulnerability so findings can be normalized against authoritative CVE metadata.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-security-management/page/product/vulnerability-response/task/add-cve2thirdparty-entry.html"
		]
	},
	{
		"trackCode": "CIS-VR",
		"order": 2,
		"prompt": "Leadership wants to drive remediation as grouped vulnerability work rather than only isolated tickets. Which documented remediation activity focuses on vulnerability groups?",
		"choices": [
			"Remediate vulnerability groups",
			"Rotate database encryption keys manually each night",
			"Rebuild all service maps from network traffic captures",
			"Archive closed incidents older than seven days"
		],
		"correctIndex": 0,
		"explanation": "Vulnerability Response includes guidance for remediating vulnerability groups, which helps teams prioritize and execute remediation at an aggregated risk level.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-security-management/page/product/vulnerability-response/task/remediate-vuln-groups.html"
		]
	},
	{
		"trackCode": "CIS-VR",
		"order": 3,
		"prompt": "An operations engineer needs to work remediation tasks from the IT Remediation Workspace using Vulnerability Response records. Which task documentation should they follow first?",
		"choices": [
			"Use remediation task records in the IT Remediation Workspace",
			"Import hardware asset leases from a spreadsheet",
			"Create a new procurement vendor record",
			"Configure discovery schedules for IP telephony subnets"
		],
		"correctIndex": 0,
		"explanation": "The Vulnerability Response documentation explains how remediation task records are used within the IT Remediation Workspace to coordinate remediation execution.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/zurich-security-management/page/product/vulnerability-response/task/vr-ws-remed-task.html"
		]
	},
	{
		"trackCode": "CIS-VR",
		"order": 4,
		"prompt": "Your container platform team must address image-level findings using Container Vulnerability Response. Which concept page supports remediation-oriented guidance for that product area?",
		"choices": [
			"Remediate container vulnerabilities",
			"Design employee onboarding checklists",
			"Tune predictive intelligence for HR cases",
			"Configure outbound REST message authentication"
		],
		"correctIndex": 0,
		"explanation": "Container Vulnerability Response documentation includes conceptual guidance on remediating container vulnerabilities, aligning remediation practices with containerized workloads.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-security-management/page/product/container-vulnerability-response/concept/remediate-cvr.html"
		]
	},
	{
		"trackCode": "CIS-CSM",
		"order": 0,
		"prompt": "A new implementation lead wants a structured tour of Customer Service Management capabilities before configuring workspaces. Which concept documentation should they start with?",
		"choices": [
			"Exploring Customer Service Management",
			"Retiring legacy mainframe terminal emulators",
			"Building facility space reservation calendars",
			"Defining payroll tax jurisdiction rules"
		],
		"correctIndex": 0,
		"explanation": "The Customer Service Management documentation provides an exploring topic that introduces key application areas and how teams typically navigate the solution.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-customer-service-management/page/product/customer-service-management/concept/exploring-csm.html"
		]
	},
	{
		"trackCode": "CIS-CSM",
		"order": 1,
		"prompt": "Agents complain that case intake is inconsistent across channels. Which Washington DC-era concept documentation focuses on day-to-day use patterns for Customer Service Management?",
		"choices": [
			"Using Customer Service Management",
			"Hardening database table ACLs for HR payroll",
			"Designing mainframe batch job schedules",
			"Configuring discovery for network printers only"
		],
		"correctIndex": 0,
		"explanation": "The using Customer Service Management concept documentation describes practical usage patterns that help standardize how agents work cases across channels.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/washingtondc-customer-service-management/page/product/customer-service-management/concept/using-csm.html"
		]
	},
	{
		"trackCode": "CIS-CSM",
		"order": 2,
		"prompt": "A B2B retailer needs line-level commercial details captured on cases tied to orders. Which reference documentation should implementers review for the order case line form?",
		"choices": [
			"Order case line form",
			"Employee relations investigation playbook",
			"Hardware asset retirement approval matrix",
			"Software license reclamation policy template"
		],
		"correctIndex": 0,
		"explanation": "Customer Service Management reference documentation for the order case line form explains how order-related line items are represented on cases for structured capture and reporting.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-customer-service-management/page/product/customer-service-management/reference/order-case-line-form.html"
		]
	},
	{
		"trackCode": "CIS-CSM",
		"order": 3,
		"prompt": "Support leadership wants a consolidated operational view for customer service performance. Which concept topic aligns with a customer service dashboard experience?",
		"choices": [
			"Customer service dashboard",
			"Database index rebuild scheduling guide",
			"VPN client certificate pinning procedures",
			"Legacy fax server integration patterns"
		],
		"correctIndex": 0,
		"explanation": "The Customer Service Management documentation includes a customer service dashboard concept that supports leadership visibility into service operations from a single pane.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-customer-service-management/page/product/customer-service-management/concept/customer-service-dashboard.html"
		]
	},
	{
		"trackCode": "CIS-CSM",
		"order": 4,
		"prompt": "Your organization plans to tune AI-assisted agent experiences in CSM. Which configuration-oriented documentation topic should administrators consult?",
		"choices": [
			"Configuring Now Assist for Customer Service Management",
			"Planning data center rack elevation drawings",
			"Defining snow removal vendor SLAs",
			"Creating barcode labels for stockroom shelves"
		],
		"correctIndex": 0,
		"explanation": "Customer Service Management documentation for configuring Now Assist for CSM helps administrators enable and tune AI-assisted experiences for agents and workflows.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-customer-service-management/page/product/customer-service-management/concept/now-assist-csm-configuring.html"
		]
	},
	{
		"trackCode": "CIS-FSM",
		"order": 0,
		"prompt": "A project kickoff asks for a product-oriented map of Field Service Management before scheduling go-live. Which concept documentation should the team read first?",
		"choices": [
			"Explore Field Service Management",
			"Draft employee cafeteria menu rotations",
			"Configure SAML for legacy LDAP directories only",
			"Build a procurement catalog for office supplies"
		],
		"correctIndex": 0,
		"explanation": "The Field Service Management documentation includes an explore topic that introduces the solution scope and how core field service capabilities fit together.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-field-service-management/page/product/field-service-management/concept/explore-fsm.html"
		]
	},
	{
		"trackCode": "CIS-FSM",
		"order": 1,
		"prompt": "Dispatch and technicians need clarity on standard operating usage after foundation data is loaded. Which concept documentation supports ongoing Field Service Management usage?",
		"choices": [
			"Use Field Service Management",
			"Design employee badge printing workflows",
			"Plan annual performance review calibration sessions",
			"Configure email ingestion for legal hold archives"
		],
		"correctIndex": 0,
		"explanation": "The use Field Service Management concept documentation focuses on how teams operate the application day to day after initial implementation milestones.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-field-service-management/page/product/field-service-management/concept/use-fsm.html"
		]
	},
	{
		"trackCode": "CIS-FSM",
		"order": 2,
		"prompt": "Implementation workshops center on how technicians receive, update, and close field jobs. Which concept documentation should anchor work order lifecycle discussions?",
		"choices": [
			"Managing work orders",
			"Publishing corporate social media policies",
			"Tuning antivirus definitions for desktops",
			"Creating procurement blanket purchase orders"
		],
		"correctIndex": 0,
		"explanation": "Field Service Management documentation for managing work orders explains how work orders are handled through execution, which is central to field operations.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-field-service-management/page/product/field-service-management/concept/managing-work-orders.html"
		]
	},
	{
		"trackCode": "CIS-FSM",
		"order": 3,
		"prompt": "A process designer must document the steps planners use to generate work orders from templates. Which task documentation should they reference for creation guidance?",
		"choices": [
			"Create work orders",
			"Rotate database administrator passwords quarterly",
			"Import legacy mainframe job schedules",
			"Configure SNMP traps for warehouse scanners"
		],
		"correctIndex": 0,
		"explanation": "The Field Service Management work order management documentation includes create work orders guidance for establishing the records planners and dispatch rely on.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/r/field-service-management/work-order-management/create-work-orders.html"
		]
	},
	{
		"trackCode": "CIS-FSM",
		"order": 4,
		"prompt": "Before promoting a fix pack, the release manager wants version-specific Field Service Management changes summarized. Which release-notes documentation should they review?",
		"choices": [
			"Field Service Management release notes",
			"Employee relations investigation templates",
			"Hardware asset lease accounting policies",
			"Legacy VPN client compatibility matrices"
		],
		"correctIndex": 0,
		"explanation": "Field Service Management release notes summarize product changes by release, which helps teams assess impact before production promotion.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-release-notes/page/release-notes/field-service-management/field-service-management-rn.html"
		]
	},
	{
		"trackCode": "CIS-HR",
		"order": 0,
		"prompt": "An HR transformation sponsor wants the platform framing for HR case, knowledge, and employee-facing experiences. Which human resources concept documentation introduces HR Service Delivery?",
		"choices": [
			"HR Service Delivery",
			"Employee badge reprint SOP for security",
			"Payroll garnishment legal hold procedures",
			"Facilities snow removal escalation policy"
		],
		"correctIndex": 0,
		"explanation": "The human resources documentation includes an HR Service Delivery concept that frames the suite of HR experiences built on the Now Platform.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-employee-service-management/page/product/human-resources/concept/hr-service-delivery.html"
		]
	},
	{
		"trackCode": "CIS-HR",
		"order": 1,
		"prompt": "Your team is modernizing employee learning and growth experiences alongside HR services. Which concept documentation provides an overview aligned with the learning experience platform area?",
		"choices": [
			"Overview of the Learning Experience Platform (LXP)",
			"Configuring SNMP for building access controllers",
			"Designing data center rack thermal maps",
			"Creating procurement requests for office furniture"
		],
		"correctIndex": 0,
		"explanation": "Employee experience documentation includes an overview of the Learning Experience Platform (LXP), which contextualizes learning capabilities adjacent to HR service delivery.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-employee-service-management/page/product/human-resources/concept/overview-lxp.html"
		]
	},
	{
		"trackCode": "CIS-HR",
		"order": 2,
		"prompt": "Consultants want a guided narrative for HR product planning workshops. Which human resources concept documentation supports playbook-style HR guidance?",
		"choices": [
			"HR playbook",
			"Annual performance review calibration spreadsheets",
			"Legacy mainframe green-screen navigation",
			"VPN split tunneling policies for contractors"
		],
		"correctIndex": 0,
		"explanation": "The human resources documentation includes an HR playbook concept that helps teams structure discovery, design, and adoption conversations for HR products.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-employee-service-management/page/product/human-resources/concept/playbook-hr.html"
		]
	},
	{
		"trackCode": "CIS-HR",
		"order": 3,
		"prompt": "Integration engineers must enable HR data flows between ServiceNow and external human capital systems. Which task documentation should they follow to activate integrations?",
		"choices": [
			"Activate HR integrations",
			"Configure email archiving for legal discovery",
			"Design facilities keycard deprovisioning scripts",
			"Tune antivirus definitions for file servers"
		],
		"correctIndex": 0,
		"explanation": "Human resources task documentation for activating HR integrations covers the steps to turn on integration capabilities needed for authoritative HR system data.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-employee-service-management/page/product/human-resources/task/activate-hr-integrations.html"
		]
	},
	{
		"trackCode": "CIS-HR",
		"order": 4,
		"prompt": "HR operations wants a manager-facing operational view for team requests and workload. Which task documentation should be reviewed for the HR manager dashboard experience?",
		"choices": [
			"Use the HR manager dashboard",
			"Configure SNMP monitoring for warehouse doors",
			"Draft procurement policies for temporary labor",
			"Plan cafeteria vendor contract renewals"
		],
		"correctIndex": 0,
		"explanation": "Human resources task documentation for using the HR manager dashboard explains how managers monitor and act on HR-related work for their teams.",
		"sourceUrls": [
			"https://www.servicenow.com/docs/bundle/xanadu-employee-service-management/page/product/human-resources/task/t_UseTheHRManagerDashboard.html"
		]
	}
];
