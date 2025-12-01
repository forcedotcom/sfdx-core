/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { z } from 'zod';

/**
 * Settings for scratch org configuration
 * Each settings property corresponds to a metadata type configuration
 */
export const SettingsSchema = z
  .object({
    accountingSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_accountingsettings.htm'
      ),
    accountInsightsSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_accountinsightssettings.htm'
      ),
    accountIntelligenceSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_accountintelligencesettings.htm'
      ),
    accountPlanSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_accountplansettings.htm'
      ),
    accountSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_accountsettings.htm'
      ),
    actionsSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_actionssettings.htm'
      ),
    activitiesSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_activitiessettings.htm'
      ),
    addressSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_addresssettings.htm'
      ),
    agentforceForDevelopersSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_agentforcefordeveloperssettings.htm'
      ),
    agentPlatformSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_agentplatformsettings.htm'
      ),
    aIReplyRecommendationsSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_aireplyrecommendationssettings.htm'
      ),
    analyticsSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_analyticssettings.htm'
      ),
    apexSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_apexsettings.htm'
      ),
    appAnalyticsSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_appanalyticssettings.htm'
      ),
    appExperienceSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_appexperiencesettings.htm'
      ),
    associationEngineSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_associationenginesettings.htm'
      ),
    automatedContactsSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_automatedcontactssettings.htm'
      ),
    botSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_botsettings.htm'
      ),
    branchManagementSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_branchmanagementsettings.htm'
      ),
    businessHoursSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_businesshourssettings.htm'
      ),
    campaignSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_campaignsettings.htm'
      ),
    caseSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_casesettings.htm'
      ),
    chatterAnswersSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_chatteranswerssettings.htm'
      ),
    chatterEmailsMDSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_chatteremailmdsettings.htm'
      ),
    chatterSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_chattersettings.htm'
      ),
    codeBuilderSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_codebuildersettings.htm'
      ),
    collectionsDashboardSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_collectionsdashboardsettings.htm'
      ),
    communitiesSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_communitiessettings.htm'
      ),
    companySettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_companyprofilesettings.htm'
      ),
    connectedAppSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_connectedappsettings.htm'
      ),
    contentSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_contentsettings.htm'
      ),
    contractSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_contractsettings.htm'
      ),
    conversationalIntelligenceSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_conversationalintelligencesettings.htm'
      ),
    conversationChannelDefinition: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_conversationchanneldefinition.htm'
      ),
    currencySettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_currencysettings.htm'
      ),
    customAddressFieldSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_customaddressfieldsettings.htm'
      ),
    dataDotComSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_datadotcomsettings.htm'
      ),
    dataImportManagementSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_dataimportmanagementsettings.htm'
      ),
    deploymentSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_deploymentsettings.htm'
      ),
    devHubSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_devhubsettings.htm'
      ),
    documentGenerationSetting: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_documentgenerationsetting.htm'
      ),
    dynamicFormsSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_dynamicformssettings.htm'
      ),
    eACSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_eacsettings.htm'
      ),
    einsteinAgentSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_einsteinagentsettings.htm'
      ),
    einsteinAISettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_einsteinaisettings.htm'
      ),
    einsteinGptSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_einsteingptsettings.htm'
      ),
    emailAdministrationSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_emailadministrationsettings.htm'
      ),
    emailIntegrationSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_emailintegrationsettings.htm'
      ),
    emailTemplateSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_emailtemplatesettings.htm'
      ),
    employeeUserSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_employeeusersettings.htm'
      ),
    encryptionKeySettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_encryptionkeysettings.htm'
      ),
    enhancedNotesSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_enhancednotessettings.htm'
      ),
    entitlementSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_entitlementsettings.htm'
      ),
    eventSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_eventsettings.htm'
      ),
    experienceBundleSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_experiencebundlesettings.htm'
      ),
    externalClientAppSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_externalclientappsettings.htm'
      ),
    externalServicesSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_externalservicessettings.htm'
      ),
    fieldServiceSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_fieldservicesettings.htm'
      ),
    filesConnectSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_filesconnectsettings.htm'
      ),
    fileUploadAndDownloadSecuritySettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_fileuploadanddownloadsecuritysettings.htm'
      ),
    flowSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_flowsettings.htm'
      ),
    forecastingObjectListSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_forecastingobjectlistsettings.htm'
      ),
    forecastingSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_forecastingsettings.htm'
      ),
    highVelocitySalesSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_highvelocitysalessettings.htm'
      ),
    ideasSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_ideassettings.htm'
      ),
    identityProviderSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_identityprovidersettings.htm'
      ),
    iframeWhiteListUrlSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_iframewhitelisturlsettings.htm'
      ),
    incidentMgmtSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_incidentmgmtsettings.htm'
      ),
    industriesEinsteinFeatureSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/industrieseinsteinfeaturesettings_metadata_api.htm'
      ),
    industriesLoyaltySettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/industriesloyaltysettings_metadata_api.htm'
      ),
    industriesSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_industriessettings.htm'
      ),
    interestTaggingSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_interesttaggingsettings.htm'
      ),
    inventorySettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_inventorysettings.htm'
      ),
    invLatePymntRiskCalcSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_invlatepymntriskcalcsettings.htm'
      ),
    invocableActionSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_invocableactionsettings.htm'
      ),
    ioTSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_iotsettings.htm'
      ),
    knowledgeSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_knowledgesettings.htm'
      ),
    languageSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_languagesettings.htm'
      ),
    leadConfigSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_leadconfigsettings.htm'
      ),
    leadConvertSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_leadconvertsettings.htm'
      ),
    lightningExperienceSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_lightningexperiencesettings.htm'
      ),
    liveAgentSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_liveagentsettings.htm'
      ),
    liveMessageSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_livemessagesettings.htm'
      ),
    macroSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_macrosettings.htm'
      ),
    mailMergeSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_mailmergesettings.htm'
      ),
    mapAndLocationSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_mapandlocationsettings.htm'
      ),
    meetingsSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_meetingssettings.htm'
      ),
    mfgServiceConsoleSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/mfg_mfgserviceconsolesettings_metadata_api.htm'
      ),
    mobileSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_mobilesettings.htm'
      ),
    myDomainSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_mydomainsettings.htm'
      ),
    nameSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_namesettings.htm'
      ),
    notificationsSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_notificationssettings.htm'
      ),
    oauthOidcSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_oauthoidcsettings.htm'
      ),
    objectHierarchyRelationship: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/mfg_objecthierarchyrelationshipsettings_metadata_api.htm'
      ),
    objectLinkingSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_objectlinkingsettings.htm'
      ),
    omniChannelSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_omnichannelsettings.htm'
      ),
    opportunityInsightsSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_opportunityinsightssettings.htm'
      ),
    opportunityScoreSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_opportunityscoresettings.htm'
      ),
    opportunitySettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_opportunityssettings.htm'
      ),
    orderManagementSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_ordermanagementsettings.htm'
      ),
    orderSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_ordersettings.htm'
      ),
    orgPreferenceSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_orgpreferencesettings.htm'
      ),
    orgSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_orgsettings.htm'
      ),
    pardotEinsteinSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_pardoteinsteinsettings.htm'
      ),
    pardotSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_pardotsettings.htm'
      ),
    partyDataModelSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_partydatamodelsettings.htm'
      ),
    pathAssistantSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_pathassistantsettings.htm'
      ),
    paymentsSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_paymentssettings.htm'
      ),
    picklistSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_picklistsettings.htm'
      ),
    platformEncryptionSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_platformencryptionsettings.htm'
      ),
    platformEventSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_platformeventsettings.htm'
      ),
    predictionBuilderSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_predictionbuildersettings.htm'
      ),
    privacySettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_privacysettings.htm'
      ),
    processFlowMigration: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_processflowmigration.htm'
      ),
    productSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_productsettings.htm'
      ),
    quoteSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_quotessettings.htm'
      ),
    realTimeEventSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_realtimeeventsettings.htm'
      ),
    recordPageSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_recordpagesettings.htm'
      ),
    retailExecutionSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/metadata_api_retexset.htm'
      ),
    salesAgreementSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/mfg_salesagreementsettings_metadata_api.htm'
      ),
    sandboxSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_sandboxsettings.htm'
      ),
    schemaSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_schemasettings.htm'
      ),
    searchSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_searchsettings.htm'
      ),
    securitySettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_securitysettings.htm'
      ),
    serviceCloudVoiceSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_servicecloudvoicesettings.htm'
      ),
    serviceSetupAssistantSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_servicesetupassistantsettings.htm'
      ),
    sharingSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_sharingsettings.htm'
      ),
    siteSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_sitesettings.htm'
      ),
    socialCustomerServiceSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_socialcustomerservicesettings.htm'
      ),
    socialProfileSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_socialprofilesettings.htm'
      ),
    sourceTrackingSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_sourcetrackingsettings.htm'
      ),
    subscriptionManagementSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_subscriptionmanagementsettings.htm'
      ),
    surveySettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_surveysettings.htm'
      ),
    territory2Settings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_territory2settings.htm'
      ),
    trailheadSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_trailheadsettings.htm'
      ),
    trialOrgSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_trialorgsettings.htm'
      ),
    userEngagementSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_userengagementsettings.htm'
      ),
    userInterfaceSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_userinterfacesettings.htm'
      ),
    userManagementSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_usermanagementsettings.htm'
      ),
    voiceSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_voicesettings.htm'
      ),
    warrantyLifeCycleMgmtSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_mfg_warrantylifecyclemgmtsettings.htm'
      ),
    workDotComSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_WorkDotComSettings.htm'
      ),
    workforceEngagementSettings: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_workforceengagementsettings.htm'
      ),
  })
  .catchall(z.unknown());
