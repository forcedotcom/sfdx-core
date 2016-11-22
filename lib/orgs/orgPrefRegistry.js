/**
 * Org Preferences are exposed through different APIs
 * Singleton object encapsulating registry of supported Org Preference types
 */
// P R I V A T E

// pref APIs
const AccountSettingsApi = 'AccountSettings';
const ActivitiesSettingsApi = 'ActivitiesSettings';
const ContractSettingsApi = 'ContractSettings';
const EntitlementSettingsApi = 'EntitlementSettings';
const ForecastingSettingsApi = 'ForecastingSettings';
const IdeasSettingsApi = 'IdeasSettings';
const KnowledgeSettingsApi = 'KnowledgeSettings';
const LiveAgentSettingsApi = 'LiveAgentSettings';
const MarketingActionSettingsApi = 'MarketingActionSettings';
const NameSettingsApi = 'NameSettings';
const OpportunitySettingsApi = 'OpportunitySettings';
const OrderSettingsApi = 'OrderSettings';
const PersonalJourneySettingsApi = 'PersonalJourneySettings';
const ProductSettingsApi = 'ProductSettings';
const QuoteSettingsApi = 'QuoteSettings';
const SearchSettingsApi = 'SearchSettings';
const OrganizationSettingsDetailApi = 'OrganizationSettingsDetail';

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
    ['IsMarketingActionEnabled', MarketingActionSettingsApi],
    ['IsMiddleNameEnabled', NameSettingsApi],
    ['IsNameSuffixEnabled', NameSettingsApi],
    ['IsOpportunityTeamEnabled', OpportunitySettingsApi],
    ['IsOrdersEnabled', OrderSettingsApi],
    ['IsExactTargetForSalesforceAppsEnabled', PersonalJourneySettingsApi],
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
    ['SocialProfilesEnable', OrganizationSettingsDetailApi],
    ['PathAssistantsEnabled', OrganizationSettingsDetailApi],
    ['LoginForensicsEnabled', OrganizationSettingsDetailApi],
    ['S1DesktopEnabled', OrganizationSettingsDetailApi],
    ['VoiceEnabled', OrganizationSettingsDetailApi]
]);

// P U B L I C
// vars and functions below exposed in API
module.exports = {
    ACCOUNT_SETTINGS_API: AccountSettingsApi,
    ACTIVITIES_SETTINGS_API: ActivitiesSettingsApi,
    CONTRACT_SETTINGS_API: ContractSettingsApi,
    ENTITLEMENT_SETTINGS_API: EntitlementSettingsApi,
    FORECASTING_SETTINGS_API: ForecastingSettingsApi,
    IDEAS_SETTINGS_API: IdeasSettingsApi,
    KNOWLEDGE_SETTINGS_API: KnowledgeSettingsApi,
    LIVE_AGENT_SETTINGS_API: LiveAgentSettingsApi,
    MARKETING_ACTION_SETTINGS_API: MarketingActionSettingsApi,
    NAME_SETTINGS_API: NameSettingsApi,
    OPPORTUNITY_SETTINGS_API: OpportunitySettingsApi,
    ORDER_SETTINGS_API: OrderSettingsApi,
    PERSONAL_JOURNEY_SETTINGS_API: PersonalJourneySettingsApi,
    PRODUCT_SETTINGS_API: ProductSettingsApi,
    QUOTE_SETTINGS_API: QuoteSettingsApi,
    SEARCH_SETTINGS_API: SearchSettingsApi,
    ORGANIZATION_SETTINGS_DETAIL_API: OrganizationSettingsDetailApi,

    /**
     * Takes in an org preference name and returns the API through which it is set
     * @param prefName The org preference name
     * @returns the API name for the org preference
     */
    whichApi(prefName) {
        return orgPreferenceApiMap.get(prefName);
    },
    /**
     * Convenience method for testing to get Org Preference Map
     * @returns the Org Preference Map
     */
    allPrefsMap() {
        return orgPreferenceApiMap;
    }
};