import React, { useEffect, useRef, useState } from "react";
import { IoIosInformationCircle } from "react-icons/io";
import { IoSearch, IoClose } from "react-icons/io5";
import { LuSquareArrowOutUpRight } from "react-icons/lu";
import { SuccessIcon } from "@/assets";
import {
  Button,
  RoundedLabel,
  WarningIcon,
  showCustomToast,
} from "@ucc/common-ui";
import api from "@/api/apiService";
import { API_ENDPOINTS, ERROR_MESSAGES, ToastType } from "@/constants";
import { extractDisplayValue } from "@/components/ExtractValue/ExtractDisplayValue";
import "./ChangeLcrmTelemedicineSlider.scss";

interface AccountSearchResult {
  account_uuid: string;
  account_name: string;
  account_guid: string;
  system?: string;
  legacy_account_id?: string;
  account_creation_date?: string;
  opportunity_name?: string;
  opportunity_id?: string;
  opportunity_url?: string;
  revenue_effective_date?: string;
  client_manager?: string;
}

interface SelectedAccount {
  accountName: string;
  accountGuid: string;
  accountCreationDate?: string;
  organizationName: string;
  latestOpportunity?: string;
  latestOpportunityId?: string;
  latestOpportunity_url?: string;
  revenueEffectiveDate?: string;
  client_manager?: string;
  isVerified: boolean;
}

export type LcrmRelationshipType =
  | "direct"
  | "parent_derived"
  | "DIRECT"
  | "PARENT_DERIVED";

interface ChangeLcrmTelemedicineSliderProps {
  isBillingOrg?: boolean;
  currentAccountName?: string;
  currentAccountGuid?: string;
  currentVerificationStatus?: string;
  organizationName?: string;
  organizationUUID?: string;
  organizationId?: string;
  source?: "telemed" | "livongo";
  currentRelationshipType?: LcrmRelationshipType;
  onClose: () => void;
  onSave: () => void;
}

const ChangeLcrmTelemedicineSlider: React.FC<
  ChangeLcrmTelemedicineSliderProps
> = ({
  isBillingOrg = false,
  currentAccountName = "",
  currentAccountGuid,
  currentVerificationStatus,
  organizationName = "",
  organizationUUID = "",
  organizationId = "",
  source = "telemed",
  currentRelationshipType = "direct",
  onClose,
  onSave,
}) => {
  const searchUrl = import.meta.env.VITE_SEARCH_BASE_URL;
  const [relationshipType, setRelationshipType] =
    useState<LcrmRelationshipType>(
      isBillingOrg
        ? "direct"
        : (currentRelationshipType?.toLowerCase() as LcrmRelationshipType) ??
            "direct",
    );
  const [searchQuery, setSearchQuery] = useState(currentAccountName);
  const [searchResults, setSearchResults] = useState<AccountSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<SelectedAccount | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUserMadeChange, setHasUserMadeChange] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pre-load the current linked account via GUID lookup on mount
  useEffect(() => {
    if (!currentAccountGuid) return;
    setIsLoadingAccount(true);
    api
      .get<{ results?: AccountSearchResult[] }>(
        API_ENDPOINTS.accountsSearch,
        {
          searchTerm: currentAccountGuid,
          searchType: "account_guid",
          source,
          page: 0,
          limit: 5,
        },
        { baseURL: searchUrl },
      )
      .then((res) => {
        const items: AccountSearchResult[] = (res as any)?.results ?? [];
        const match =
          items.find((r) => r.account_guid === currentAccountGuid) ?? items[0];
        if (match) {
          setSelectedAccount({
            accountName: match.account_name,
            accountGuid: match.account_guid,
            accountCreationDate: match.account_creation_date,
            organizationName,
            latestOpportunity: match.opportunity_name,
            latestOpportunityId: match.opportunity_id,
            latestOpportunity_url: match.opportunity_url,
            revenueEffectiveDate: match.revenue_effective_date,
            isVerified:
              currentVerificationStatus === "VERIFIED" ||
              currentVerificationStatus === "AUTO",
            client_manager: match.client_manager,
          });
          setSearchQuery(match.account_name);
        }
      })
      .catch(() => {
        /* leave field pre-filled with name only */
      })
      .finally(() => setIsLoadingAccount(false));
  }, [
    currentAccountGuid,
    currentVerificationStatus,
    source,
    organizationName,
    searchUrl,
  ]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSelectedAccount(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setIsSearching(true);
      api
        .get<{ results?: AccountSearchResult[] }>(
          API_ENDPOINTS.accountsSearch,
          {
            searchTerm: val.trim(),
            searchType: "name",
            source,
            page: 0,
            limit: 5,
          },
          { baseURL: searchUrl },
        )
        .then((res) => {
          const items: AccountSearchResult[] = (res as any)?.results ?? [];
          setSearchResults(items);
          setShowDropdown(items.length > 0);
        })
        .catch(() => {
          setSearchResults([]);
          setShowDropdown(false);
        })
        .finally(() => setIsSearching(false));
    }, 300);
  };

  const handleSelectResult = (result: AccountSearchResult) => {
    const isSameGuid = result.account_guid === currentAccountGuid;
    setSelectedAccount({
      accountName: result.account_name,
      accountGuid: result.account_guid,
      accountCreationDate: result.account_creation_date,
      organizationName,
      latestOpportunity: result.opportunity_name,
      latestOpportunityId: result.opportunity_id,
      latestOpportunity_url: result.opportunity_url,
      revenueEffectiveDate: result.revenue_effective_date,
      isVerified: isSameGuid
        ? currentVerificationStatus === "VERIFIED" ||
          currentVerificationStatus === "AUTO"
        : false,
      client_manager: result.client_manager,
    });
    setSearchQuery(result.account_name);
    setShowDropdown(false);
    setSearchResults([]);
    setHasUserMadeChange(true);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedAccount(null);
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleSave = async () => {
    if (!selectedAccount) return;
    setIsSaving(true);
    try {
      await api.patch(`${API_ENDPOINTS.updateOrgAccount}/${organizationUUID}`, {
        organizationId: organizationId,
        system: source === "telemed" ? "LCRM - TD" : "LCRM - LV",
        status: selectedAccount.isVerified ? "VERIFIED" : "UNVERIFIED",
        accountGuid: selectedAccount.accountGuid,
        accountName: selectedAccount.accountName,
        linkageType: relationshipType.toUpperCase(),
      });
      showCustomToast({
        type: ToastType.Success,
        title: "Success",
        message: "Account linked successfully.",
      });
      onSave();
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      showCustomToast({
        type: ToastType.Error,
        title: "Failed",
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isSaveEnabled =
    selectedAccount !== null && selectedAccount.isVerified && hasUserMadeChange;

  return (
    <div className="lcrm-telemed-slider">
      <div className="lcrm-slider-body">
        <div className="lcrm-info-banner">
          <IoIosInformationCircle className="lcrm-info-icon" />
          <div>
            {isBillingOrg ? (
              <>
                <p className="banner-header">
                  Billing org must have its direct account linkage
                </p>
                <p className="banner-subheading">
                  Because this organization is marked as a billing org, it must
                  link to its direct LCRM account.
                </p>
              </>
            ) : (
              <>
                <p className="banner-header">
                  Changing account linkage affects production data
                </p>
              </>
            )}
          </div>
        </div>

        <p className="required-note">
          <span className="mandatory-asterisk">* </span>
          indicates a required field
        </p>

        {/* Relationship type selector */}
        <div className="lcrm-section">
          <label className="lcrm-field-label">
            Confirm org and account relationship{" "}
            <span className="mandatory-asterisk">*</span>
          </label>

          <label
            className={`lcrm-radio-card ${relationshipType === "direct" ? "selected" : ""}`}
            onClick={() => {
              setRelationshipType("direct");
              handleClearSearch();
            }}
          >
            <div className="lcrm-radio-card-header">
              <input
                type="radio"
                name="relationship"
                value="direct"
                checked={relationshipType === "direct"}
                onChange={() => {
                  setRelationshipType("direct");
                  handleClearSearch();
                }}
                className="lcrm-radio-input"
              />
              <span className="lcrm-radio-title">Direct (1:1)</span>
              {isBillingOrg && <RoundedLabel text="Required" variant="info" />}
            </div>
            <p className="lcrm-radio-description">
              The org/sub-org created here will map directly to an LCRM Telemed
              account. New groups, contacts, etc. will be built under the LCRM
              Telemed account selected.
            </p>
          </label>

          <label
            className={`lcrm-radio-card ${relationshipType === "parent_derived" ? "selected" : ""} ${isBillingOrg ? "disabled" : ""}`}
            onClick={() => {
              if (!isBillingOrg) {
                setRelationshipType("parent_derived");
                handleClearSearch();
              }
            }}
          >
            <div className="lcrm-radio-card-header">
              <input
                type="radio"
                name="relationship"
                value="parent"
                checked={relationshipType === "parent_derived"}
                onChange={() => {
                  if (!isBillingOrg) {
                    setRelationshipType("parent_derived");
                    handleClearSearch();
                  }
                }}
                disabled={isBillingOrg}
                className="lcrm-radio-input"
              />
              <span className="lcrm-radio-title">
                Parent organization's account
              </span>
            </div>
            <p className="lcrm-radio-description">
              The org/sub-org created here will map to a parent account in LCRM
              Telemed account. New groups, contacts, etc. will be built and
              maintained under the LCRM Telemed account selected.
            </p>
          </label>

          {isBillingOrg && (
            <div className="lcrm-warning-banner">
              <WarningIcon className="lcrm-warning-icon" aria-label="Warning" />
              <div>
                <div>This organization is a billing org.</div>
                <div>
                  Changing the linked account carries downstream financial and
                  reporting risks.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account search — shown for both relationship types */}
        <div className="lcrm-section">
          <label className="lcrm-field-label">
            {relationshipType === "direct"
              ? "Select the direct account"
              : "Select the parent org's account"}
            <span className="mandatory-asterisk"> *</span>
          </label>
          <div className="lcrm-search-wrapper" ref={dropdownRef}>
            <div className="lcrm-search-input-row">
              <IoSearch className="lcrm-search-icon" />
              <input
                type="text"
                className="lcrm-search-input"
                value={
                  isLoadingAccount && !!currentAccountGuid ? "" : searchQuery
                }
                onChange={handleSearchChange}
                placeholder="Search account..."
                autoComplete="off"
                disabled={isLoadingAccount}
              />
              {searchQuery && (
                <button
                  className="lcrm-clear-btn"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <IoClose />
                </button>
              )}
            </div>

            {(isSearching || (showDropdown && searchResults.length > 0)) && (
              <div className="lcrm-search-dropdown">
                <div className="lcrm-dropdown-header">
                  <span>Account name/GUID</span>
                  <span>Latest opportunity</span>
                </div>
                {isSearching ? (
                  <div className="lcrm-search-dropdown-item">
                    <span className="lcrm-result-name">Loading...</span>
                  </div>
                ) : (
                  searchResults.map((result, idx) => (
                    <div
                      key={result.account_guid}
                      className={`lcrm-search-dropdown-item ${idx < searchResults.length - 1 ? "has-divider" : ""}`}
                      onClick={() => handleSelectResult(result)}
                    >
                      <div className="lcrm-result-left">
                        <div className="lcrm-result-name-row">
                          {result.account_guid === currentAccountGuid &&
                          (currentVerificationStatus === "VERIFIED" ||
                            currentVerificationStatus === "AUTO") ? (
                            <span className="lcrm-dropdown-verified-badge">
                              <SuccessIcon className="lcrm-verified-icon" />{" "}
                              Verified
                            </span>
                          ) : (
                            <span className="lcrm-dropdown-not-verified-badge">
                              Not verified
                            </span>
                          )}
                          <span className="lcrm-result-name">
                            {result.account_name}
                          </span>
                        </div>
                        <span className="lcrm-result-guid">
                          {result.account_guid}
                        </span>
                        {result.account_creation_date && (
                          <span className="lcrm-result-created">
                            Created on:{" "}
                            {
                              extractDisplayValue(
                                result.account_creation_date,
                                "date",
                              ).raw
                            }
                          </span>
                        )}
                      </div>
                      <div className="lcrm-result-right">
                        {result.opportunity_name && (
                          <span className="lcrm-result-opportunity">
                            {result.opportunity_name}
                          </span>
                        )}
                        {result.revenue_effective_date && (
                          <span className="lcrm-result-rev-date">
                            Revenue effective date:{" "}
                            <span className="lcrm-result-date">
                              {
                                extractDisplayValue(
                                  result.revenue_effective_date,
                                  "date",
                                ).raw
                              }
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected account card */}
          {selectedAccount && (
            <>
              <div
                className="lcrm-selected-account"
                data-testid="selected-account"
              >
                <p className="lcrm-selected-label">Selected account:</p>
                <table className="lcrm-account-table">
                  <tbody>
                    <tr>
                      <td className="lcrm-account-key">Account name</td>
                      <td className="lcrm-account-value">
                        {selectedAccount.accountName}
                        {selectedAccount.isVerified ? (
                          <span className="lcrm-verified-badge">
                            <SuccessIcon className="lcrm-verified-icon" />{" "}
                            Verified
                          </span>
                        ) : (
                          <span className="lcrm-not-verified-badge">
                            Not verified
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="lcrm-account-key">Account GUID</td>
                      <td className="lcrm-account-value lcrm-guid">
                        {selectedAccount.accountGuid}
                      </td>
                    </tr>
                    <tr>
                      <td className="lcrm-account-key">
                        Account creation date
                      </td>
                      <td className="lcrm-account-value">
                        {
                          extractDisplayValue(
                            selectedAccount.accountCreationDate,
                            "date",
                          ).raw
                        }
                      </td>
                    </tr>
                    <tr>
                      <td className="lcrm-account-key">Organization name</td>
                      <td className="lcrm-account-value">
                        {selectedAccount.organizationName || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="lcrm-account-key">Client Manager</td>
                      <td className="lcrm-account-value">{selectedAccount.client_manager || "-"}</td>
                    </tr>

                    <tr>
                      <td className="lcrm-account-key">Latest opportunity</td>
                      <td className="lcrm-account-value">
                        {selectedAccount.latestOpportunity ? (
                          selectedAccount.latestOpportunity_url ? (
                            <a
                              href={selectedAccount.latestOpportunity_url}
                              className="lcrm-opportunity-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {selectedAccount.latestOpportunity}
                              <LuSquareArrowOutUpRight className="lcrm-opportunity-link-icon" />
                            </a>
                          ) : (
                            <span>{selectedAccount.latestOpportunity}</span>
                          )
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="lcrm-account-key">
                        Revenue effective date
                      </td>
                      <td className="lcrm-account-value lcrm-revenue-date">
                        {
                          extractDisplayValue(
                            selectedAccount.revenueEffectiveDate,
                            "date",
                          ).raw
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {!selectedAccount.isVerified && (
                <Button
                  variant="primary"
                  className="lcrm-verify-account-btn"
                  onClick={() => {
                    setSelectedAccount((prev) =>
                      prev ? { ...prev, isVerified: true } : null,
                    );
                    setHasUserMadeChange(true);
                  }}
                >
                  Verify account
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="lcrm-slider-footer">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!isSaveEnabled || isSaving}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default ChangeLcrmTelemedicineSlider;
