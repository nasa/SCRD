
DELETE FROM PaymentInterestDetails;
DELETE FROM Invoices;
DELETE FROM PaymentRefundLinks;
DELETE FROM RefundTransaction;
DELETE FROM ServicePeriods;
DELETE FROM PaymentMoveTransaction;
DELETE FROM AdjustmentTransaction;
DELETE FROM BatchDailyPayments;
DELETE FROM Users;

DELETE FROM AnnuityRollExtract;
DELETE FROM LookUpGLCodes;
DELETE FROM LookupPayTransStatusCode;
DELETE FROM LookUpPaymentAppliedOrder;
DELETE FROM LookupAccountStatus;
DELETE FROM LookupAgencyCode;
DELETE FROM LookupAppointmentTypeCode;
DELETE FROM LookupAuditActivity;
DELETE FROM LookupCalculationStatus;
DELETE FROM LookupChangeTransFieldNumberCode;
DELETE FROM LookupInterestRates;
DELETE FROM BackupServicePeriods;
DELETE FROM ClaimsWithoutService;
DELETE FROM LookupPayTypeCode;
DELETE FROM LookupPeriodTypeCode;
DELETE FROM A01_PrintSuppressionCases;
DELETE FROM LookupRetirementTypeCode;
DELETE FROM LookupSCMPayCode;
DELETE FROM PayDateFix;
DELETE FROM NotificationAddressInfo;
DELETE FROM AddressDataFix;
DELETE FROM LookupUserStatusCode;
DELETE FROM CalculatedServicePeriods;
DELETE FROM ConfigurationSettings;
DELETE FROM ContactInfo;
DELETE FROM Holidays;
DELETE FROM PaymentTransaction;
DELETE FROM LookupServiceTypeCode;
DELETE FROM LookupInterestSuppression;
DELETE FROM ServiceCreditMaster;
DELETE FROM LookupDeductionRates;
DELETE FROM StoredProcedureReturnCodes;
DELETE FROM LookupInterestSuppressionAudit;
DELETE FROM LookupUserRoleCode;
DELETE FROM USStates;
DELETE FROM UserAccountAssignments;
DELETE FROM LookupInterestGracePeriod;
DELETE FROM UsersAudit;
DELETE FROM ExportDates;
DELETE FROM AuditBatch;
DELETE FROM SCMFirstInsert;
DELETE FROM StoredProcPermissions;
DELETE FROM NewClaimNumbers;
DELETE FROM NewClaims;
DELETE FROM LookUpGLPaymentType;
DELETE FROM ServiceCreditMasterAudit;
DELETE FROM TimeFactor;
DELETE FROM NameSuffix;
DELETE FROM CalculatedServicePeriodsAudit;
DELETE FROM UserRoleAssignmentAudit;
DELETE FROM LookupInterestGracePeriodAudit;
DELETE FROM NewDuplicateAccounts;
DELETE FROM UserRoleAssignment_Save;
DELETE FROM PaymentTransactionAudit;
DELETE FROM PaymentTranactionNotesAudit;
DELETE FROM AnnuitantList;
DELETE FROM AccountNote;
DELETE FROM AccountNoteAudit;
DELETE FROM AnnualPayIncreaseChart;
DELETE FROM ServicePeriodsAudit;
DELETE FROM PaymentTranactionNotes;
DELETE FROM BalanceExceptions;
DELETE FROM UserRoleAssignment;
DELETE FROM SupervisorRoles;
DELETE FROM BatchImportErrorLog;
DELETE FROM MainframeImport;
DELETE FROM BatchProcessingErrorLog;