/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Optional, ensureString } from '@salesforce/ts-types';
import getApiVersion from './config/getApiVersion';

/**
 * Org Preferences are exposed through different APIs
 * Singleton object encapsulating registry of supported Org Preference types
 */
// P R I V A T E

let currentApiVersion: number;

// pref APIs
const AccountSettingsApi = 'accountSettings';
const ActivitiesSettingsApi = 'activitiesSettings';
const ApexSettingsApi = 'apexSettings';
const ChatterSettingsApi = 'chatterSettings';
const ContractSettingsApi = 'contractSettings';
const CommunitiesSettingsApi = 'communitiesSettings';
const DevHubSettingsApi = 'devhubSettings';
const EmailAdministrationSettingsApi = 'emailAdministrationSettings';
const EnhancedNotesSettingsApi = 'enhancedNotesSettings';
const EntitlementSettingsApi = 'entitlementSettings';
const EventSettingsApi = 'eventSettings';
const ForecastingSettingsApi = 'forecastingSettings';
const IdeasSettingsApi = 'ideasSettings';
const KnowledgeSettingsApi = 'knowledgeSettings';
const LanguageSettingsApi = 'languageSettings';
const LightningExperienceSettingsApi = 'lightningExperienceSettings';
const LiveAgentSettingsApi = 'liveAgentSettings';
const MobileSettingsApi = 'mobileSettings';
const NameSettingsApi = 'nameSettings';
const OpportunitySettingsApi = 'opportunitySettings';
const OrderSettingsApi = 'orderSettings';
const PardotSettingsApi = 'pardotSettings';
const PartyDataModelSettingsApi = 'partyDataModelSettings';
const ProductSettingsApi = 'productSettings';
const OrgPreferenceSettingsApi = 'orgPreferenceSettings';
const QuoteSettingsApi = 'quoteSettings';
const SecuritySessionSettingsApi = 'securitySettings.sessionSettings';
const SearchSettingsApi = 'searchSettings';
const SharingSettingsApi = 'sharingSettings';
const SocialProfileSettingsApi = 'socialProfileSettings';
const OrganizationSettingsDetailApi = 'orgPreferenceSettings';
const Territory2SettingsApi = 'territory2Settings';
const PathAssistantSettingsApi = 'pathAssistantSettings';
const VoiceSettingsApi = 'voiceSettings';
const SecuritySettingsPasswordPoliciesApi = 'securitySettings.passwordPolicies';
const DeprecatedSettingsApi = 'DEPRECATED';

// This map is used in the migration from orgPreferences -> settings types before 47.0
// pre apiVersion 47.0 supported org preferences and the API through which they are set
const orgPreferenceApiMapPre47 = new Map([
  ['IsAccountTeamsEnabled', AccountSettingsApi],
  ['ShowViewHierarchyLink', AccountSettingsApi],
  ['IsActivityRemindersEnabled', ActivitiesSettingsApi],
  ['IsDragAndDropSchedulingEnabled', ActivitiesSettingsApi],
  ['IsEmailTrackingEnabled', ActivitiesSettingsApi],
  ['IsGroupTasksEnabled', ActivitiesSettingsApi],
  ['IsMultidayEventsEnabled', ActivitiesSettingsApi],
  ['IsRecurringEventsEnabled', ActivitiesSettingsApi],
  ['IsRecurringTasksEnabled', ActivitiesSettingsApi],
  ['IsSidebarCalendarShortcutEnabled', ActivitiesSettingsApi],
  ['IsSimpleTaskCreateUIEnabled', ActivitiesSettingsApi],
  ['ShowEventDetailsMultiUserCalendar', ActivitiesSettingsApi],
  ['ShowHomePageHoverLinksForEvents', ActivitiesSettingsApi],
  ['ShowMyTasksHoverLinks', ActivitiesSettingsApi],
  ['ShowRequestedMeetingsOnHomePage', ActivitiesSettingsApi],
  ['AutoCalculateEndDate', ContractSettingsApi],
  ['IsContractHistoryTrackingEnabled', ContractSettingsApi],
  ['NotifyOwnersOnContractExpiration', ContractSettingsApi],
  ['AssetLookupLimitedToActiveEntitlementsOnAccount', EntitlementSettingsApi],
  ['AssetLookupLimitedToActiveEntitlementsOnContact', EntitlementSettingsApi],
  ['AssetLookupLimitedToSameAccount', EntitlementSettingsApi],
  ['AssetLookupLimitedToSameContact', EntitlementSettingsApi],
  ['IsEntitlementsEnabled', EntitlementSettingsApi],
  ['EntitlementLookupLimitedToActiveStatus', EntitlementSettingsApi],
  ['EntitlementLookupLimitedToSameAccount', EntitlementSettingsApi],
  ['EntitlementLookupLimitedToSameAsset', EntitlementSettingsApi],
  ['EntitlementLookupLimitedToSameContact', EntitlementSettingsApi],
  ['IsForecastsEnabled', ForecastingSettingsApi],
  ['IsChatterProfileEnabled', IdeasSettingsApi],
  ['IsIdeaThemesEnabled', IdeasSettingsApi],
  ['IsIdeasEnabled', IdeasSettingsApi],
  ['IsIdeasReputationEnabled', IdeasSettingsApi],
  ['IsCreateEditOnArticlesTabEnabled', KnowledgeSettingsApi],
  ['IsExternalMediaContentEnabled', KnowledgeSettingsApi],
  ['IsKnowledgeEnabled', KnowledgeSettingsApi],
  ['ShowArticleSummariesCustomerPortal', KnowledgeSettingsApi],
  ['ShowArticleSummariesInternalApp', KnowledgeSettingsApi],
  ['ShowArticleSummariesPartnerPortal', KnowledgeSettingsApi],
  ['ShowValidationStatusField', KnowledgeSettingsApi],
  ['IsLiveAgentEnabled', LiveAgentSettingsApi],
  ['IsMiddleNameEnabled', NameSettingsApi],
  ['IsNameSuffixEnabled', NameSettingsApi],
  ['IsOpportunityTeamEnabled', OpportunitySettingsApi],
  ['IsOrdersEnabled', OrderSettingsApi],
  ['IsNegativeQuantityEnabled', OrderSettingsApi],
  ['IsReductionOrdersEnabled', OrderSettingsApi],
  ['IsCascadeActivateToRelatedPricesEnabled', ProductSettingsApi],
  ['IsQuantityScheduleEnabled', ProductSettingsApi],
  ['IsRevenueScheduleEnabled', ProductSettingsApi],
  ['IsQuoteEnabled', QuoteSettingsApi],
  ['DocumentContentSearchEnabled', SearchSettingsApi],
  ['OptimizeSearchForCjkEnabled', SearchSettingsApi],
  ['RecentlyViewedUsersForBlankLookupEnabled', SearchSettingsApi],
  ['SidebarAutoCompleteEnabled', SearchSettingsApi],
  ['SidebarDropDownListEnabled', SearchSettingsApi],
  ['SidebarLimitToItemsIownCheckboxEnabled', SearchSettingsApi],
  ['SingleSearchResultShortcutEnabled', SearchSettingsApi],
  ['SpellCorrectKnowledgeSearchEnabled', SearchSettingsApi],
  ['AnalyticsSharingEnable', OrganizationSettingsDetailApi],
  ['DisableParallelApexTesting', OrganizationSettingsDetailApi],
  ['EnhancedEmailEnabled', OrganizationSettingsDetailApi],
  ['EventLogWaveIntegEnabled', OrganizationSettingsDetailApi],
  ['SendThroughGmailPref', OrganizationSettingsDetailApi],
  ['Translation', OrganizationSettingsDetailApi],
  ['S1OfflinePref', OrganizationSettingsDetailApi],
  ['S1EncryptedStoragePref2', OrganizationSettingsDetailApi],
  ['OfflineDraftsEnabled', OrganizationSettingsDetailApi],
  ['AsyncSaveEnabled', OrganizationSettingsDetailApi],
  ['ChatterEnabled', OrganizationSettingsDetailApi],
  ['SelfSetPasswordInApi', OrganizationSettingsDetailApi],
  ['SocialProfilesEnable', OrganizationSettingsDetailApi],
  ['PathAssistantsEnabled', OrganizationSettingsDetailApi],
  ['LoginForensicsEnabled', OrganizationSettingsDetailApi],
  ['S1DesktopEnabled', OrganizationSettingsDetailApi],
  ['NetworksEnabled', OrganizationSettingsDetailApi],
  ['NotesReservedPref01', OrganizationSettingsDetailApi],
  ['CompileOnDeploy', OrganizationSettingsDetailApi],
  ['VoiceEnabled', OrganizationSettingsDetailApi],
  ['TerritoryManagement2Enable', OrganizationSettingsDetailApi],
  ['ApexApprovalLockUnlock', OrganizationSettingsDetailApi],
]);

// This map is used in the migration from orgPreferences -> settings types before 47.0
const orgPreferenceMdMapPre47 = new Map([
  ['IsAccountTeamsEnabled', 'enableAccountTeams'],
  ['ShowViewHierarchyLink', 'showViewHierarchyLink'],
  ['IsActivityRemindersEnabled', 'enableActivityReminders'],
  ['IsDragAndDropSchedulingEnabled', 'enableDragAndDropScheduling'],
  ['IsEmailTrackingEnabled', 'enableEmailTracking'],
  ['IsGroupTasksEnabled', 'enableGroupTasks'],
  ['IsMultidayEventsEnabled', 'enableMultidayEvents'],
  ['IsRecurringEventsEnabled', 'enableRecurringEvents'],
  ['IsRecurringTasksEnabled', 'enableRecurringTasks'],
  ['IsSidebarCalendarShortcutEnabled', 'enableSidebarCalendarShortcut'],
  ['IsSimpleTaskCreateUIEnabled', 'enableSimpleTaskCreateUI'],
  ['ShowEventDetailsMultiUserCalendar', 'showEventDetailsMultiUserCalendar'],
  ['ShowHomePageHoverLinksForEvents', 'showHomePageHoverLinksForEvents'],
  ['ShowMyTasksHoverLinks', 'showMyTasksHoverLinks'],
  ['ShowRequestedMeetingsOnHomePage', 'showRequestedMeetingsOnHomePage'],
  ['AutoCalculateEndDate', 'autoCalculateEndDate'],
  ['IsContractHistoryTrackingEnabled', 'enableContractHistoryTracking'],
  ['NotifyOwnersOnContractExpiration', 'notifyOwnersOnContractExpiration'],
  ['AssetLookupLimitedToActiveEntitlementsOnAccount', 'assetLookupLimitedToActiveEntitlementsOnAccount'],
  ['AssetLookupLimitedToActiveEntitlementsOnContact', 'assetLookupLimitedToActiveEntitlementsOnContact'],
  ['AssetLookupLimitedToSameAccount', 'assetLookupLimitedToSameAccount'],
  ['AssetLookupLimitedToSameContact', 'assetLookupLimitedToSameContact'],
  ['IsEntitlementsEnabled', 'enableEntitlements'],
  ['EntitlementLookupLimitedToActiveStatus', 'entitlementLookupLimitedToActiveStatus'],
  ['EntitlementLookupLimitedToSameAccount', 'entitlementLookupLimitedToSameAccount'],
  ['EntitlementLookupLimitedToSameAsset', 'entitlementLookupLimitedToSameAsset'],
  ['EntitlementLookupLimitedToSameContact', 'entitlementLookupLimitedToSameContact'],
  ['IsForecastsEnabled', 'enableForecasts'],
  ['IsChatterProfileEnabled', 'enableChatterProfile'],
  ['IsIdeaThemesEnabled', 'enableIdeaThemes'],
  ['IsIdeasEnabled', 'enableIdeas'],
  ['IsIdeasReputationEnabled', 'enableIdeasReputation'],
  ['IsCreateEditOnArticlesTabEnabled', 'enableCreateEditOnArticlesTab'],
  ['IsExternalMediaContentEnabled', 'enableExternalMediaContent'],
  ['IsKnowledgeEnabled', 'enableKnowledge'],
  ['ShowArticleSummariesCustomerPortal', 'showArticleSummariesCustomerPortal'],
  ['ShowArticleSummariesInternalApp', 'showArticleSummariesInternalApp'],
  ['ShowArticleSummariesPartnerPortal', 'showArticleSummariesPartnerPortal'],
  ['ShowValidationStatusField', 'showValidationStatusField'],
  ['IsLiveAgentEnabled', 'enableLiveAgent'],
  ['IsMiddleNameEnabled', 'enableMiddleName'],
  ['IsNameSuffixEnabled', 'enableNameSuffix'],
  ['IsOpportunityTeamEnabled', 'enableOpportunityTeam'],
  ['IsOrdersEnabled', 'enableOrders'],
  ['IsNegativeQuantityEnabled', 'enableNegativeQuantity'],
  ['IsReductionOrdersEnabled', 'enableReductionOrders'],
  ['IsCascadeActivateToRelatedPricesEnabled', 'enableCascadeActivateToRelatedPrices'],
  ['IsQuantityScheduleEnabled', 'enableQuantitySchedule'],
  ['IsRevenueScheduleEnabled', 'enableRevenueSchedule'],
  ['IsQuoteEnabled', 'enableQuote'],
  ['DocumentContentSearchEnabled', 'documentContentSearchEnabled'],
  ['OptimizeSearchForCjkEnabled', 'optimizeSearchForCJKEnabled'],
  ['RecentlyViewedUsersForBlankLookupEnabled', 'recentlyViewedUsersForBlankLookupEnabled'],
  ['SidebarAutoCompleteEnabled', 'sidebarAutoCompleteEnabled'],
  ['SidebarDropDownListEnabled', 'sidebarDropDownListEnabled'],
  ['SidebarLimitToItemsIownCheckboxEnabled', 'sidebarLimitToItemsIOwnCheckboxEnabled'],
  ['SingleSearchResultShortcutEnabled', 'singleSearchResultShortcutEnabled'],
  ['SpellCorrectKnowledgeSearchEnabled', 'spellCorrectKnowledgeSearchEnabled'],
  ['AnalyticsSharingEnable', 'analyticsSharingEnable'],
  ['DisableParallelApexTesting', 'disableParallelApexTesting'],
  ['EnhancedEmailEnabled', 'enhancedEmailEnabled'],
  ['EventLogWaveIntegEnabled', 'eventLogWaveIntegEnabled'],
  ['SendThroughGmailPref', 'sendThroughGmailPref'],
  ['Translation', 'translation'],
  ['S1OfflinePref', 's1OfflinePref'],
  ['S1EncryptedStoragePref2', 's1EncryptedStoragePref2'],
  ['OfflineDraftsEnabled', 'offlineDraftsEnabled'],
  ['AsyncSaveEnabled', 'asyncSaveEnabled'],
  ['ChatterEnabled', 'chatterEnabled'],
  ['SelfSetPasswordInApi', 'selfSetPasswordInApi'],
  ['SocialProfilesEnable', 'socialProfilesEnable'],
  ['PathAssistantsEnabled', 'pathAssistantsEnabled'],
  ['LoginForensicsEnabled', 'loginForensicsEnabled'],
  ['S1DesktopEnabled', 's1DesktopEnabled'],
  ['NetworksEnabled', 'networksEnabled'],
  ['NotesReservedPref01', 'notesReservedPref01'],
  ['CompileOnDeploy', 'compileOnDeploy'],
  ['VoiceEnabled', 'voiceEnabled'],
  ['TerritoryManagement2Enable', 'territoryManagement2Enable'],
  ['ApexApprovalLockUnlock', 'apexApprovalLockUnlock'],
]);

// This map is used in the migration from orgPreferences -> settings types
// supported org preferences and the API through which they are set
const orgPreferenceApiMap = new Map([
  ['IsAccountTeamsEnabled', AccountSettingsApi],
  ['ShowViewHierarchyLink', AccountSettingsApi],
  ['IsActivityRemindersEnabled', ActivitiesSettingsApi],
  ['IsDragAndDropSchedulingEnabled', ActivitiesSettingsApi],
  ['IsEmailTrackingEnabled', ActivitiesSettingsApi],
  ['IsGroupTasksEnabled', ActivitiesSettingsApi],
  ['IsMultidayEventsEnabled', ActivitiesSettingsApi],
  ['IsRecurringEventsEnabled', ActivitiesSettingsApi],
  ['IsRecurringTasksEnabled', ActivitiesSettingsApi],
  ['IsSidebarCalendarShortcutEnabled', ActivitiesSettingsApi],
  ['IsSimpleTaskCreateUIEnabled', ActivitiesSettingsApi],
  ['ShowEventDetailsMultiUserCalendar', ActivitiesSettingsApi],
  ['ShowHomePageHoverLinksForEvents', ActivitiesSettingsApi],
  ['ShowMyTasksHoverLinks', ActivitiesSettingsApi],
  ['ShowRequestedMeetingsOnHomePage', ActivitiesSettingsApi],
  ['AutoCalculateEndDate', ContractSettingsApi],
  ['IsContractHistoryTrackingEnabled', ContractSettingsApi],
  ['NotifyOwnersOnContractExpiration', ContractSettingsApi],
  ['AssetLookupLimitedToActiveEntitlementsOnAccount', EntitlementSettingsApi],
  ['AssetLookupLimitedToActiveEntitlementsOnContact', EntitlementSettingsApi],
  ['AssetLookupLimitedToSameAccount', EntitlementSettingsApi],
  ['AssetLookupLimitedToSameContact', EntitlementSettingsApi],
  ['IsEntitlementsEnabled', EntitlementSettingsApi],
  ['EntitlementLookupLimitedToActiveStatus', EntitlementSettingsApi],
  ['EntitlementLookupLimitedToSameAccount', EntitlementSettingsApi],
  ['EntitlementLookupLimitedToSameAsset', EntitlementSettingsApi],
  ['EntitlementLookupLimitedToSameContact', EntitlementSettingsApi],
  ['IsForecastsEnabled', ForecastingSettingsApi],
  ['IsChatterProfileEnabled', IdeasSettingsApi],
  ['IsIdeaThemesEnabled', IdeasSettingsApi],
  ['IsIdeasEnabled', IdeasSettingsApi],
  ['IsIdeasReputationEnabled', IdeasSettingsApi],
  ['IsCreateEditOnArticlesTabEnabled', KnowledgeSettingsApi],
  ['IsExternalMediaContentEnabled', KnowledgeSettingsApi],
  ['IsKnowledgeEnabled', KnowledgeSettingsApi],
  ['ShowArticleSummariesCustomerPortal', KnowledgeSettingsApi],
  ['ShowArticleSummariesInternalApp', KnowledgeSettingsApi],
  ['ShowArticleSummariesPartnerPortal', KnowledgeSettingsApi],
  ['ShowValidationStatusField', KnowledgeSettingsApi],
  ['IsLiveAgentEnabled', LiveAgentSettingsApi],
  ['IsMiddleNameEnabled', NameSettingsApi],
  ['IsNameSuffixEnabled', NameSettingsApi],
  ['IsOpportunityTeamEnabled', OpportunitySettingsApi],
  ['IsOrdersEnabled', OrderSettingsApi],
  ['IsNegativeQuantityEnabled', OrderSettingsApi],
  ['IsReductionOrdersEnabled', OrderSettingsApi],
  ['IsCascadeActivateToRelatedPricesEnabled', ProductSettingsApi],
  ['IsQuantityScheduleEnabled', ProductSettingsApi],
  ['IsRevenueScheduleEnabled', ProductSettingsApi],
  ['IsQuoteEnabled', QuoteSettingsApi],
  ['DocumentContentSearchEnabled', SearchSettingsApi],
  ['OptimizeSearchForCjkEnabled', SearchSettingsApi],
  ['RecentlyViewedUsersForBlankLookupEnabled', SearchSettingsApi],
  ['SidebarAutoCompleteEnabled', SearchSettingsApi],
  ['SidebarDropDownListEnabled', SearchSettingsApi],
  ['SidebarLimitToItemsIownCheckboxEnabled', SearchSettingsApi],
  ['SingleSearchResultShortcutEnabled', SearchSettingsApi],
  ['SpellCorrectKnowledgeSearchEnabled', SearchSettingsApi],
  ['DisableParallelApexTesting', ApexSettingsApi],
  ['EnhancedEmailEnabled', EmailAdministrationSettingsApi],
  ['EventLogWaveIntegEnabled', EventSettingsApi],
  ['SendThroughGmailPref', EmailAdministrationSettingsApi],
  ['Translation', LanguageSettingsApi],
  ['S1OfflinePref', MobileSettingsApi],
  ['S1EncryptedStoragePref2', MobileSettingsApi],
  ['OfflineDraftsEnabled', MobileSettingsApi],
  ['ChatterEnabled', ChatterSettingsApi],
  ['SelfSetPasswordInApi', SecuritySettingsPasswordPoliciesApi],
  ['SocialProfilesEnable', SocialProfileSettingsApi],
  ['PathAssistantsEnabled', PathAssistantSettingsApi],
  ['LoginForensicsEnabled', EventSettingsApi],
  ['S1DesktopEnabled', LightningExperienceSettingsApi],
  ['NetworksEnabled', CommunitiesSettingsApi],
  ['NotesReservedPref01', EnhancedNotesSettingsApi],
  ['CompileOnDeploy', ApexSettingsApi],
  ['TerritoryManagement2Enable', Territory2SettingsApi],
  ['ApexApprovalLockUnlock', ApexSettingsApi],
]);

// This map is used in the migration from orgPreferences -> settings types
const orgPreferenceMdMap = new Map([
  ['IsAccountTeamsEnabled', 'enableAccountTeams'],
  ['ShowViewHierarchyLink', 'showViewHierarchyLink'],
  ['IsActivityRemindersEnabled', 'enableActivityReminders'],
  ['IsDragAndDropSchedulingEnabled', 'enableDragAndDropScheduling'],
  ['IsEmailTrackingEnabled', 'enableEmailTracking'],
  ['IsGroupTasksEnabled', 'enableGroupTasks'],
  ['IsMultidayEventsEnabled', 'enableMultidayEvents'],
  ['IsRecurringEventsEnabled', 'enableRecurringEvents'],
  ['IsRecurringTasksEnabled', 'enableRecurringTasks'],
  ['IsSidebarCalendarShortcutEnabled', 'enableSidebarCalendarShortcut'],
  ['IsSimpleTaskCreateUIEnabled', 'enableSimpleTaskCreateUI'],
  ['ShowEventDetailsMultiUserCalendar', 'showEventDetailsMultiUserCalendar'],
  ['ShowHomePageHoverLinksForEvents', 'showHomePageHoverLinksForEvents'],
  ['ShowMyTasksHoverLinks', 'showMyTasksHoverLinks'],
  ['ShowRequestedMeetingsOnHomePage', 'showRequestedMeetingsOnHomePage'],
  ['AutoCalculateEndDate', 'autoCalculateEndDate'],
  ['IsContractHistoryTrackingEnabled', 'enableContractHistoryTracking'],
  ['NotifyOwnersOnContractExpiration', 'notifyOwnersOnContractExpiration'],
  ['AssetLookupLimitedToActiveEntitlementsOnAccount', 'assetLookupLimitedToActiveEntitlementsOnAccount'],
  ['AssetLookupLimitedToActiveEntitlementsOnContact', 'assetLookupLimitedToActiveEntitlementsOnContact'],
  ['AssetLookupLimitedToSameAccount', 'assetLookupLimitedToSameAccount'],
  ['AssetLookupLimitedToSameContact', 'assetLookupLimitedToSameContact'],
  ['IsEntitlementsEnabled', 'enableEntitlements'],
  ['EntitlementLookupLimitedToActiveStatus', 'entitlementLookupLimitedToActiveStatus'],
  ['EntitlementLookupLimitedToSameAccount', 'entitlementLookupLimitedToSameAccount'],
  ['EntitlementLookupLimitedToSameAsset', 'entitlementLookupLimitedToSameAsset'],
  ['EntitlementLookupLimitedToSameContact', 'entitlementLookupLimitedToSameContact'],
  ['IsForecastsEnabled', 'enableForecasts'],
  ['IsChatterProfileEnabled', 'enableChatterProfile'],
  ['IsIdeaThemesEnabled', 'enableIdeaThemes'],
  ['IsIdeasEnabled', 'enableIdeas'],
  ['IsIdeasReputationEnabled', 'enableIdeasReputation'],
  ['IsCreateEditOnArticlesTabEnabled', 'enableCreateEditOnArticlesTab'],
  ['IsExternalMediaContentEnabled', 'enableExternalMediaContent'],
  ['IsKnowledgeEnabled', 'enableKnowledge'],
  ['ShowArticleSummariesCustomerPortal', 'showArticleSummariesCustomerPortal'],
  ['ShowArticleSummariesInternalApp', 'showArticleSummariesInternalApp'],
  ['ShowArticleSummariesPartnerPortal', 'showArticleSummariesPartnerPortal'],
  ['ShowValidationStatusField', 'showValidationStatusField'],
  ['IsLiveAgentEnabled', 'enableLiveAgent'],
  ['IsMiddleNameEnabled', 'enableMiddleName'],
  ['IsNameSuffixEnabled', 'enableNameSuffix'],
  ['IsOpportunityTeamEnabled', 'enableOpportunityTeam'],
  ['IsOrdersEnabled', 'enableOrders'],
  ['IsNegativeQuantityEnabled', 'enableNegativeQuantity'],
  ['IsReductionOrdersEnabled', 'enableReductionOrders'],
  ['IsCascadeActivateToRelatedPricesEnabled', 'enableCascadeActivateToRelatedPrices'],
  ['IsQuantityScheduleEnabled', 'enableQuantitySchedule'],
  ['IsRevenueScheduleEnabled', 'enableRevenueSchedule'],
  ['IsQuoteEnabled', 'enableQuote'],
  ['DocumentContentSearchEnabled', 'documentContentSearchEnabled'],
  ['OptimizeSearchForCjkEnabled', 'optimizeSearchForCJKEnabled'],
  ['RecentlyViewedUsersForBlankLookupEnabled', 'recentlyViewedUsersForBlankLookupEnabled'],
  ['SidebarAutoCompleteEnabled', 'sidebarAutoCompleteEnabled'],
  ['SidebarDropDownListEnabled', 'sidebarDropDownListEnabled'],
  ['SidebarLimitToItemsIownCheckboxEnabled', 'sidebarLimitToItemsIOwnCheckboxEnabled'],
  ['SingleSearchResultShortcutEnabled', 'singleSearchResultShortcutEnabled'],
  ['SpellCorrectKnowledgeSearchEnabled', 'spellCorrectKnowledgeSearchEnabled'],
  ['AnalyticsSharingEnable', 'analyticsSharingEnable'],
  ['DisableParallelApexTesting', 'enableDisableParallelApexTesting'],
  ['EnhancedEmailEnabled', 'enableEnhancedEmailEnabled'],
  ['EventLogWaveIntegEnabled', 'enableEventLogWaveIntegration'],
  ['SendThroughGmailPref', 'enableSendThroughGmailPref'],
  ['Translation', 'EnableTranslationWorkbench'],
  ['S1OfflinePref', 'enableS1OfflinePref'],
  ['S1EncryptedStoragePref2', 'enableS1EncryptedStoragePref2'],
  ['OfflineDraftsEnabled', 'enableOfflineDraftsEnabled'],
  ['AsyncSaveEnabled', 'asyncSaveEnabled'],
  ['ChatterEnabled', 'enableChatter'],
  ['SelfSetPasswordInApi', 'selfSetPasswordInApi'],
  ['SocialProfilesEnable', 'enableSocialProfiles'],
  ['PathAssistantsEnabled', 'pathAssistantsEnabled'],
  ['LoginForensicsEnabled', 'enableLoginForensics'],
  ['S1DesktopEnabled', 'enableS1DesktopEnabled'],
  ['NetworksEnabled', 'enableNetworksEnabled'],
  ['NotesReservedPref01', 'enableEnhancedNotes'],
  ['CompileOnDeploy', 'enableCompileOnDeploy'],
  ['VoiceEnabled', 'voiceEnabled'],
  ['TerritoryManagement2Enable', 'territoryManagement2Enable'],
  ['ApexApprovalLockUnlock', 'enableApexApprovalLockUnlock'],
]);

// this maps the old orgPreferenceSettings preference names to the
// new preference names
const orgPreferenceSettingsPrefNameMigrateMap = new Map([
  ['apexApprovalLockUnlock', 'enableApexApprovalLockUnlock'],
  ['b2bmaAppEnabled', 'enableB2bmaAppEnabled'],
  ['callDispositionEnabled', 'enableCallDisposition'],
  ['chatterEnabled', 'enableChatter'],
  ['compileOnDeploy', 'enableCompileOnDeploy'],
  ['consentManagementEnabled', 'enableConsentManagement'],
  ['contentSniffingProtection', 'enableContentSniffingProtection'],
  ['deleteMonitoringDataEnabled', 'enableDeleteMonitoringData'],
  ['disableParallelApexTesting', 'enableDisableParallelApexTesting'],
  ['enhancedEmailEnabled', 'enableEnhancedEmailEnabled'],
  ['eventLogWaveIntegEnabled', 'enableEventLogWaveIntegration'],
  ['hstsSitesCommunities', 'hstsOnForecomSites'],
  ['localNames', 'enableLocalNamesForStdObjects'],
  ['loginForensicsEnabled', 'enableLoginForensics'],
  ['networksEnabled', 'enableNetworksEnabled'],
  ['notesReservedPref01', 'enableEnhancedNotes'],
  ['offlineDraftsEnabled', 'enableOfflineDraftsEnabled'],
  ['packaging2', 'enablePackaging2'],
  ['pathAssistantsEnabled', 'pathAssistantEnabled'],
  ['pRMAccRelPref', 'enablePRMAccRelPref'],
  ['pardotAppV1Enabled', 'enablePardotAppV1Enabled'],
  ['pardotEmbeddedAnalyticsPref', 'enableEngagementHistoryDashboards'],
  ['pardotEnabled', 'enablePardotEnabled'],
  ['portalUserShareOnCase', 'enablePortalUserCaseSharing'],
  ['removeThemeBrandBanner', 'enableRemoveThemeBrandBanner'],
  ['s1OfflinePref', 'enableS1OfflinePref'],
  ['s1DesktopEnabled', 'enableS1DesktopEnabled'],
  ['s1EncryptedStoragePref2', 'enableS1EncryptedStoragePref2'],
  ['scratchOrgManagementPref', 'enableScratchOrgManagementPref'],
  ['shapeExportPref', 'enableShapeExportPref'],
  ['selfSetPasswordInApi', 'enableSetPasswordInApi'],
  ['sendThroughGmailPref', 'enableSendThroughGmailPref'],
  ['socialProfilesEnable', 'enableSocialProfiles'],
  ['territoryManagement2Enable', 'enableTerritoryManagement2'],
  ['translation', 'enableTranslationWorkbench'],
  ['upgradeInsecureRequestsPref', 'enableUpgradeInsecureRequestsPref'],
  ['useLanguageFallback', 'useLanguageFallback'],
  ['usePathCollapsedUserPref', 'canOverrideAutoPathCollapseWithUserPref'],
  ['usersAreLightningOnly', 'enableUsersAreLightningOnly'],
  ['verifyOn2faRegistration', 'identityConfirmationOnTwoFactorRegistrationEnabled'],
  ['verifyOnEmailChange', 'identityConfirmationOnEmailChange'],
  ['voiceCallListEnabled', 'enableVoiceCallList'],
  ['voiceCallRecordingEnabled', 'enableVoiceCallRecording'],
  ['voiceCoachingEnabled', 'enableVoiceCoaching'],
  ['voiceConferencingEnabled', 'enableVoiceConferencing'],
  ['voiceEnabled', 'voiceEnabled'],
  ['voiceLocalPresenceEnabled', 'enableVoiceLocalPresence'],
  ['voiceMailDropEnabled', 'enableVoiceMailDrop'],
  ['voiceMailEnabled', 'enableVoiceMail'],
  ['xssProtection', 'enableXssProtection'],
]);

// this maps the old orgPreferenceSettings preferences
// (using their new names) to their proper settings types
const orgPreferenceSettingsTypeMigrateMap = new Map([
  ['activityAnalyticsEnabled', DeprecatedSettingsApi],
  ['analyticsSharingEnable', DeprecatedSettingsApi],
  ['canOverrideAutoPathCollapseWithUserPref', PathAssistantSettingsApi],
  ['channelAccountHierarchyPref', DeprecatedSettingsApi],
  ['dialerBasicEnabled', DeprecatedSettingsApi],
  ['enableApexApprovalLockUnlock', ApexSettingsApi],
  ['enableB2bmaAppEnabled', PardotSettingsApi],
  ['enableCallDisposition', VoiceSettingsApi],
  ['enableChatter', ChatterSettingsApi],
  ['enableCompileOnDeploy', ApexSettingsApi],
  ['enableConsentManagement', PartyDataModelSettingsApi],
  ['enableContentSniffingProtection', SecuritySessionSettingsApi],
  ['enableDeleteMonitoringData', EventSettingsApi],
  ['enableDisableParallelApexTesting', ApexSettingsApi],
  ['enableEngagementHistoryDashboards', PardotSettingsApi],
  ['enableEnhancedEmailEnabled', EmailAdministrationSettingsApi],
  ['enableEnhancedNotes', EnhancedNotesSettingsApi],
  ['enableEventLogWaveIntegration', EventSettingsApi],
  ['enableLocalNamesForStdObjects', LanguageSettingsApi],
  ['enableLoginForensics', EventSettingsApi],
  ['enableNetworksEnabled', CommunitiesSettingsApi],
  ['enablePackaging2', DevHubSettingsApi],
  ['enablePardotAppV1Enabled', PardotSettingsApi],
  ['enablePardotEnabled', PardotSettingsApi],
  ['enablePortalUserCaseSharing', SharingSettingsApi],
  ['enablePRMAccRelPref', CommunitiesSettingsApi],
  ['enableRemoveThemeBrandBanner', LightningExperienceSettingsApi],
  ['enableOfflineDraftsEnabled', MobileSettingsApi],
  ['enableS1OfflinePref', MobileSettingsApi],
  ['enableS1DesktopEnabled', LightningExperienceSettingsApi],
  ['enableS1EncryptedStoragePref2', MobileSettingsApi],
  ['enableScratchOrgManagementPref', DevHubSettingsApi],
  ['enableShapeExportPref', DevHubSettingsApi],
  ['enableSendThroughGmailPref', EmailAdministrationSettingsApi],
  ['enableSetPasswordInApi', SecuritySettingsPasswordPoliciesApi],
  ['enableSocialProfiles', SocialProfileSettingsApi],
  ['expandedSourceTrackingPref', DeprecatedSettingsApi],
  ['enableTerritoryManagement2', Territory2SettingsApi],
  ['enableTranslationWorkbench', LanguageSettingsApi],
  ['enableUpgradeInsecureRequestsPref', SecuritySessionSettingsApi],
  ['enableUsersAreLightningOnly', LightningExperienceSettingsApi],
  ['enableVoiceCallList', VoiceSettingsApi],
  ['enableVoiceCallRecording', VoiceSettingsApi],
  ['enableVoiceCoaching', VoiceSettingsApi],
  ['enableVoiceConferencing', VoiceSettingsApi],
  ['enableVoiceLocalPresence', VoiceSettingsApi],
  ['enableVoiceMailDrop', VoiceSettingsApi],
  ['enableVoiceMail', VoiceSettingsApi],
  ['enableXssProtection', SecuritySessionSettingsApi],
  ['hstsOnForecomSites', SecuritySessionSettingsApi],
  ['identityConfirmationOnEmailChange', SecuritySessionSettingsApi],
  ['identityConfirmationOnTwoFactorRegistrationEnabled', SecuritySessionSettingsApi],
  ['pathAssistantEnabled', PathAssistantSettingsApi],
  ['redirectionWarning', SecuritySessionSettingsApi],
  ['referrerPolicy', SecuritySessionSettingsApi],
  ['useLanguageFallback', LanguageSettingsApi],
  ['voiceEnabled', DeprecatedSettingsApi],
]);

function getCurrentApiVersion(): number {
  if (!currentApiVersion) {
    currentApiVersion = parseInt(ensureString(getApiVersion()), 10);
  }

  return currentApiVersion;
}

// P U B L I C
// vars and functions below exposed in API
export = {
  ACCOUNT_SETTINGS_API: AccountSettingsApi,
  ACTIVITIES_SETTINGS_API: ActivitiesSettingsApi,
  APEX_SETTINGS_API: ApexSettingsApi,
  CHATTER_SETTINGS_API: ChatterSettingsApi,
  CONTRACT_SETTINGS_API: ContractSettingsApi,
  COMMUNITIES_SETTINGS_API: CommunitiesSettingsApi,
  DEV_HUB_SETTINGS_API: DevHubSettingsApi,
  EMAIL_ADMINISTRATION_SETTINGS_API: EmailAdministrationSettingsApi,
  ENHANCED_NOTE_SETTINGS_API: EnhancedNotesSettingsApi,
  ENTITLEMENT_SETTINGS_API: EntitlementSettingsApi,
  EVENT_SETTINGS_API: EventSettingsApi,
  FORECASTING_SETTINGS_API: ForecastingSettingsApi,
  IDEAS_SETTINGS_API: IdeasSettingsApi,
  KNOWLEDGE_SETTINGS_API: KnowledgeSettingsApi,
  LANGUAGE_SETTINGS_API: LanguageSettingsApi,
  LIGHTNING_EXPERIENCE_SETTINGS_API: LightningExperienceSettingsApi,
  LIVE_AGENT_SETTINGS_API: LiveAgentSettingsApi,
  MOBILE_SETTINGS_API: MobileSettingsApi,
  NAME_SETTINGS_API: NameSettingsApi,
  OPPORTUNITY_SETTINGS_API: OpportunitySettingsApi,
  ORDER_SETTINGS_API: OrderSettingsApi,
  ORG_PREFERENCE_SETTINGS: OrgPreferenceSettingsApi,
  PRODUCT_SETTINGS_API: ProductSettingsApi,
  QUOTE_SETTINGS_API: QuoteSettingsApi,
  SECURITY_SETTINGS_API: SecuritySessionSettingsApi,
  SEARCH_SETTINGS_API: SearchSettingsApi,
  SOCIAL_PROFILE_SETTINGS_API: SocialProfileSettingsApi,
  ORGANIZATION_SETTINGS_DETAIL_API: OrganizationSettingsDetailApi,
  TERRITORY2_SETTINGS_API: Territory2SettingsApi,
  PATH_ASSISTANT_SETTINGS_API: PathAssistantSettingsApi,
  SECURITY_SETTINGS_PASSWORD_POLICY_API: SecuritySettingsPasswordPoliciesApi,

  /**
   *  This method returns the correct name of the preference
   *  only if it is being migrated from the org preference settings
   *  to a new object.
   */
  newPrefNameForOrgSettingsMigration(prefName: string): Optional<string> {
    return orgPreferenceSettingsPrefNameMigrateMap.get(prefName);
  },

  /**
   * Does a lookup for the proper apiName for
   * the given final pref name.
   */
  whichApiFromFinalPrefName(prefName: string): Optional<string> {
    return orgPreferenceSettingsTypeMigrateMap.get(prefName);
  },

  /**
   *
   * Return true if this preference was deprected in the migration from org preference settings to concreate settings types.
   *
   * @param apiVersion
   */
  isMigrationDeprecated(prefType: string): boolean {
    return DeprecatedSettingsApi === prefType;
  },

  /**
   * Takes in an org preference name and returns the MD-API name
   *
   * @param prefName The org preference name
   * @returns the MDAPI name for the org preference
   */
  forMdApi(prefName: string, apiVersion: number = getCurrentApiVersion()): Optional<string> {
    if (apiVersion >= 47.0) {
      return orgPreferenceMdMap.get(prefName);
    } else {
      return orgPreferenceMdMapPre47.get(prefName);
    }
  },

  /**
   * Takes in an org preference name and returns the API through which it is set
   *
   * @param prefName The org preference name
   * @returns the API name for the org preference
   */
  whichApi(prefName: string, apiVersion: number = getCurrentApiVersion()): Optional<string> {
    if (apiVersion >= 47.0) {
      return orgPreferenceApiMap.get(prefName);
    } else {
      return orgPreferenceApiMapPre47.get(prefName);
    }
  },

  /**
   * Convenience method for testing to get Org Preference Map
   *
   * @returns the Org Preference Map
   */
  allPrefsMap(apiVersion: number = getCurrentApiVersion()): Map<string, string> {
    if (apiVersion >= 47.0) {
      return orgPreferenceApiMap;
    } else {
      return orgPreferenceApiMapPre47;
    }
  },
};
