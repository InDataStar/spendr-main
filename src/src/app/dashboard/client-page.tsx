import FullPageLoader from "@/components/ui/full-page-loader";
import { CARD_STATUS } from "@/constants/card";
import { AccountService } from "@/services/account-service";
import {
  AccountBalanceResponse,
  AccountBalances,
  AccountDetail,
  accountInvoice,
  AccountInvoicesResponse,
} from "@/types/account";
import { CookieManager } from "@/utils/cookies";
import { getCurrentDateWithoutSuffix, parseDbUtcDate } from "@/utils/date";
import { createLogger } from "@/utils/log";
import { formatMoney } from "@/utils/money";
import { IgrButton } from "@infragistics/igniteui-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import commonStyles from "./client-page.module.css";
import SpendByMonthChart from "@/components/graphs/spend-by-month-chart";
import config from "@/services/config-service";
import { Features } from "@/types/features";
import { Footer } from "@/components/layout/footer";
import { useAccountStore } from "@/stores/account-store";
import { ROLES } from "@/constants/roles";
import SpendByMonthPieChart from "@/components/graphs/spend-by-month-pie-chart";
import FilterChart from "@/components/graphs/filter-chart";
import { positioning, TotalsData } from "@/types/graphs";
import { UserService } from "@/services/user-service";
import Image from "next/image";
import { X } from "lucide-react";
import { INFO_ICON } from "@/constants/icons";
import { ContactDetails } from "@/types/contact";
import { InvoiceDownloadHandle } from "@/types/invoice";
import InvoiceDownload from "@/components/transactions/invoice-download";

const logger = createLogger("Home page client-page");

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

const startDate = new Date(currentYear, currentMonth - 2, 1);

const featuresConfig = config.FEATURES as Features;

export default function HomeDashBoardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasInvoices, setHasInvoices] = useState(false);
  const [latestInvoice, setLatestInvoice] = useState<accountInvoice>();
  const [isAccountAdmin, setIsAccountAdmin] = useState(false);
  const [userAccount, setUserAccount] = useState<AccountDetail>();
  const [userAccountBalances, setUserAccountBalances] =
    useState<AccountBalances>();
  const [currentDate, setCurrentDate] = useState<string>("");
  const [statusColor, setStatusColor] = useState<string>("");
  const [updateText, setUpdateText] = useState<string>("");
  //const accountStore = useAccountStore();
  const getAccount = useAccountStore((state) => state.getAccount);
  const [doughnutData, setDoughnutData] = useState<TotalsData[]>();
  const [totalSpend, setTotalSpend] = useState<number>(0);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalLitres, setTotalLitres] = useState<number>(0);
  const [totalKWh, setTotalKWh] = useState<number>(0);
  const [filterPopoutPosition, setFilterPopoutPosition] = useState<positioning>(
    { top: 0, left: 0 },
  );
  const [isGraphFiltersOpen, setIsGraphFiltersOpen] = useState(false);
  const [hasFinishedLoadingData, setHasFinishedLoadingData] = useState(false);
  const [stackedGraph, setStackedGraph] = useState<boolean>(true);
  const [showCreditLimitInfoDialog, setShowCreditLimitInfoDialog] =
    useState<boolean>(false);
  const [fromYearMonth, setFromYearMonth] = useState<string>(
    `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`,
  );
  const [toYearMonth, setToYearMonth] = useState<string>(
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`,
  );
  const contactDetails = config.CONTACT_DETAILS as ContactDetails;
  const invoiceDownloadRef = useRef<InvoiceDownloadHandle>(null);

  const filterPopoutRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getCssVariable = (name: string): string => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  };

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case CARD_STATUS.ACTIVE:
        return getCssVariable("--theme-active");
      case CARD_STATUS.TERMINATED:
        return getCssVariable("--theme-terminated");
      case CARD_STATUS.SUSPENDED:
        return getCssVariable("--theme-suspended");
      default:
        return getCssVariable("--theme-default");
    }
  }, []);

  const getAccountFromAccountId = async (id: string) => {
    try {
      const accountBalanceResponse: AccountBalanceResponse =
        await AccountService.getAccountBalance(id);

      if (accountBalanceResponse.accountBalances) {
        setUserAccountBalances(accountBalanceResponse.accountBalances);
      } else {
        logger.error("No account balance found for this ID:", id);
      }
    } catch (error) {
      logger.error("Failed to fetch account balance:", error);
    }
  };

  const getAccountsInvoiceData = async (accountId: string) => {
    try {
      const accountInvoicesResponse: AccountInvoicesResponse =
        await AccountService.getAccountInvoices(
          Number(accountId),
          undefined,
          undefined,
          undefined,
          undefined,
          Number(config.API_PAGE_SIZE),
        );

      if (
        accountInvoicesResponse &&
        accountInvoicesResponse.accountInvoices.length > 0
      ) {
        setHasInvoices(true);
        setLatestInvoice(accountInvoicesResponse.accountInvoices[0]);
      } else {
        setHasInvoices(false);
      }
    } catch (error) {
      logger.error("Failed to fetch account invoices", error);
    }
  };

  const downloadLatestInvoice = async () => {
    if (!userAccount || !latestInvoice) return;
    const processedDate = parseDbUtcDate(latestInvoice.processDateUTC);
    if (!processedDate) return;
    await invoiceDownloadRef.current?.download(
      latestInvoice.invoiceNo,
      processedDate,
      userAccount.id,
      userAccount.accountNo,
      userAccount.altAccountNo,
    );
  };

  const formatDate = (dueDate: string): string => {
    if (!dueDate) return "";
    return getCurrentDateWithoutSuffix(new Date(dueDate));
  };

  useEffect(() => {
    const fetchData = async () => {
      const userDetails = CookieManager.getUserLoginDetail();
      if (!userDetails) return;
      setIsAccountAdmin(
        userDetails.userRoles.includes(ROLES.AccountAdministrator),
      );
      setIsLoading(true);
      setCurrentDate(getCurrentDateWithoutSuffix(new Date()));

      try {
        const account = await getAccount(true);
        if (account) {
          setUserAccount(account);
          await getAccountFromAccountId(account.id);
          await getAccountsInvoiceData(account.id);
        }
      } catch (error) {
        logger.error("Failed to fetch account:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getAccount]);

  useEffect(() => {
    if (userAccount) {
      setStatusColor(getStatusColor(userAccount.status));
    }
  }, [userAccount, getStatusColor]);

  const navigateToCardManagement = () => {
    router.push("/cards/manage");
  };

  const navigateToOrderCards = () => {
    router.push("/cards/order");
  };
  const navigateToMakePayments = () => {
    router.push(`/billing/payments`);
  };

  const navigateToTransactions = () => {
    router.push(`/activity/transactions`);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (
        filterPopoutRef.current &&
        !filterPopoutRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setIsGraphFiltersOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") {
        setIsGraphFiltersOpen(false);
      }
      if (event.key === "Enter" && isGraphFiltersOpen) {
        setIsGraphFiltersOpen(false);
      }
    };

    if (isGraphFiltersOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isGraphFiltersOpen, setIsGraphFiltersOpen]);

  return (
    <div className={commonStyles.backgroundWrapper}>
      {isLoading && <FullPageLoader />}

      <div className={commonStyles.contentArea}>
        <div className={commonStyles.gridWrapper}>
          <InvoiceDownload
            ref={invoiceDownloadRef}
            contactDetails={contactDetails}
          />

          {showCreditLimitInfoDialog && (
            <div className={commonStyles.dialogOverlay}>
              <div className={commonStyles.dialogContainer}>
                <div className={commonStyles.dialogHeader}>
                  <Image
                    src={INFO_ICON}
                    alt="Information"
                    height={48}
                    width={48}
                    style={{ objectFit: "contain" }}
                  />

                  <h2 className={commonStyles.dialogTitle}>{"Credit Limit"}</h2>
                  <button
                    onClick={() => {
                      setShowCreditLimitInfoDialog(false);
                    }}
                    className={commonStyles.closeBtn}
                    aria-label="Close"
                  >
                    <X className={commonStyles.closeX} strokeWidth={4} />
                  </button>
                </div>
                <div className={commonStyles.infoTextContainer}>
                  <p className={commonStyles.infoTextContent}>
                    The credit limit on your account needs to be sufficient to
                    cover the invoiced transactions for the previous billing
                    period, plus any purchases made in the current billing
                    period prior to payment being made.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className={`${commonStyles.columnWrapper} gap-[18px]`}>
            {" "}
            <div className={` ${commonStyles.mainCard}  `}>
              <div className={`{${commonStyles.headerRow} mb-[23px]`}>
                <div className={commonStyles.headerRowWrapper}>
                  <div className={commonStyles.iconHolder}>
                    <div
                      className={commonStyles.iconMask}
                      style={{
                        maskImage: `url(/icons/account-overview.svg)`,
                        WebkitMaskImage: `url(/icons/account-overview.svg)`,
                      }}
                    />
                  </div>
                  <div className={commonStyles.accountOverViewColumn}>
                    <h3 className={commonStyles.cardTitle}>Account Overview</h3>
                    <div className={commonStyles.columnFlex}>
                      <div className={commonStyles.contentWrapper}>
                        <p className={commonStyles.subContent}>
                          As of {currentDate}{" "}
                          <span
                            className={commonStyles.contentsText}
                            style={{
                              color: statusColor,
                            }}
                          >
                            {" "}
                            {userAccount?.status}
                          </span>
                        </p>
                        {userAccount?.subPlanTypeName && (
                          <p className={commonStyles.subContent}>
                            Plan Type
                            <span className={commonStyles.contentsText}>
                              {userAccount?.subPlanTypeName}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div></div>
              </div>
              <div className={commonStyles.column}>
                <div className={commonStyles.dataRowContainer}>
                  <div className={commonStyles.dataRow}>
                    <p
                      className={
                        userAccountBalances
                          ? `${commonStyles.contentTitle}`
                          : `skeletonMain`
                      }
                    >
                      {userAccountBalances ? "Available Credit" : ""}
                    </p>
                    <p
                      className={
                        userAccountBalances
                          ? `${commonStyles.contentDetails} `
                          : `skeletonMain`
                      }
                    >
                      {userAccountBalances
                        ? formatMoney(userAccountBalances.available)
                        : ""}
                    </p>
                  </div>
                  <div className={commonStyles.dataRow}>
                    <p
                      className={
                        userAccountBalances
                          ? `${commonStyles.contentTitle} `
                          : `skeletonMain`
                      }
                    >
                      {userAccountBalances ? "Current Balance" : ""}
                    </p>
                    <p
                      className={
                        userAccountBalances
                          ? `${commonStyles.contentDetails}`
                          : `skeletonMain`
                      }
                    >
                      {userAccountBalances
                        ? formatMoney(userAccountBalances?.today)
                        : ""}
                    </p>
                  </div>
                  <div className={commonStyles.dataRow}>
                    <div className={commonStyles.dataRowButtonWrapper}>
                      <div
                        className={
                          userAccountBalances
                            ? `${commonStyles.contentTitle}`
                            : `skeletonMain`
                        }
                      >
                        {userAccountBalances ? "Credit Limit" : ""}
                        <div className={commonStyles.infoButtonPosition}>
                          <button
                            className={commonStyles.infoImagePadding}
                            onClick={() => setShowCreditLimitInfoDialog(true)}
                          >
                            <div className={commonStyles.infoBoxPosition}>
                              <Image
                                src={INFO_ICON}
                                alt="Information"
                                fill
                                className={commonStyles.imageContain}
                              />
                            </div>
                          </button>
                        </div>
                      </div>{" "}
                    </div>
                    <p
                      className={
                        userAccountBalances
                          ? `${commonStyles.contentDetails}`
                          : `skeletonMain`
                      }
                    >
                      {userAccountBalances
                        ? formatMoney(userAccount?.limits.creditLimit)
                        : ""}
                    </p>
                  </div>
                </div>
                <div className={commonStyles.buttonRow}>
                  <IgrButton
                    className={"size-large"}
                    variant="outlined"
                    onClick={navigateToTransactions}
                  >
                    View Transactions
                  </IgrButton>
                </div>
              </div>
            </div>
            <div className={` ${commonStyles.mainCard} ${commonStyles.flex}`}>
              <div className={`${commonStyles.headerRow} ${commonStyles.cardManagementHeaderRow} `}>
                <div className={commonStyles.headerRowWrapper}>
                  <div className={commonStyles.iconHolder}>
                    <div
                      className={commonStyles.iconMask}
                      style={{
                        maskImage: `url(/icons/card-management.svg)`,
                        WebkitMaskImage: `url(/icons/card-management.svg)`,
                      }}
                    />
                  </div>
                  <div className={commonStyles.accountOverViewColumn}>
                    <h3 className={commonStyles.cardTitle}>Card Management</h3>
                  </div>
                </div>
                <div></div>
              </div>
              <div
                className={`${commonStyles.column} ${commonStyles.fillColumn}`}
              >
                <div
                  className={`${commonStyles.logo} ${commonStyles.logoMinSize}`}
                />

                <div className={`${commonStyles.buttonRow} ${commonStyles.cardManagementButtonRow}`}>
                  <IgrButton
                    className={commonStyles.saveButton}
                    aria-label="Manage Cards"
                    variant="outlined"
                    onClick={navigateToCardManagement}
                  >
                    {" "}
                    Manage Cards
                  </IgrButton>
                  {userAccount &&
                    (!UserService.isCurrentUserReadOnly() &&
                      userAccount.status !== CARD_STATUS.TERMINATED) && (
                      <>
                        <IgrButton
                          className={commonStyles.saveButton}
                          aria-label="Order Cards"
                          variant="outlined"
                          onClick={navigateToOrderCards}
                        >
                          {" "}
                          Order Cards
                        </IgrButton>
                      </>
                    )}
                </div>
              </div>
            </div>
            <div className={`${commonStyles.mainCard}  `}>
              <div className={`${commonStyles.headerRow}  mb-[23px]`}>
                <div className={commonStyles.headerRowWrapper}>
                  <div className={`${commonStyles.iconHolder} pt-[5px]`}>
                    <div
                      className={commonStyles.iconMask}
                      style={{
                        width: 40,
                        height: 37.5,
                        maskImage: `url(/icons/payments-overview.svg)`,
                        WebkitMaskImage: `url(/icons/payments-overview.svg)`,
                      }}
                    />
                  </div>
                  <div className={commonStyles.accountOverViewColumn}>
                    <h3 className={commonStyles.cardTitle}>Payment Overview</h3>
                    <div className={commonStyles.contentWrapper}>
                      <p className={commonStyles.subContent}>
                        As of{" "}
                        {userAccountBalances &&
                          formatDate(
                            userAccountBalances.closingBalanceDate,
                          )}{" "}
                      </p>
                    </div>
                  </div>
                </div>
                <div></div>
              </div>
              <div className={commonStyles.column}>
                <div className={commonStyles.dataRowContainer}>
                  <div className={commonStyles.dataRow}>
                    <div className={commonStyles.dataRowContents}>
                      <p
                        className={
                          userAccountBalances
                            ? `${commonStyles.contentTitle}`
                            : `skeletonMain`
                        }
                      >
                        {userAccountBalances ? `Next Due Date` : ""}
                      </p>
                    </div>
                    <div className={commonStyles.dataRowContents}>
                      <p
                        className={
                          userAccountBalances
                            ? `${commonStyles.contentDetails} ${commonStyles.boldText}`
                            : `skeletonMain`
                        }
                      >
                        {userAccountBalances
                          ? formatDate(
                              userAccountBalances.closingBalanceDueDate,
                            )
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className={commonStyles.dataRow}>
                    <div className={commonStyles.dataRowContents}>
                      <p
                        className={
                          userAccountBalances
                            ? `${commonStyles.contentTitle}`
                            : `skeletonMain`
                        }
                      >
                        {userAccountBalances ? `Payment Amount Due` : ""}
                      </p>
                    </div>
                    <div className={commonStyles.dataRowContents}>
                      <p
                        className={
                          userAccountBalances
                            ? `${commonStyles.contentDetails} ${commonStyles.boldText}`
                            : `skeletonMain`
                        }
                      >
                        {userAccountBalances
                          ? formatMoney(userAccountBalances.closing)
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={commonStyles.buttonRow}>
                  {hasInvoices && (
                    <IgrButton
                      className={commonStyles.saveButton}
                      variant="outlined"
                      onClick={downloadLatestInvoice}
                    >
                      Get Last Invoice
                    </IgrButton>
                  )}

                  {isAccountAdmin && (
                    <IgrButton
                      className={commonStyles.saveButton}
                      variant="outlined"
                      onClick={navigateToMakePayments}
                    >
                      Make a Payment
                    </IgrButton>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={commonStyles.columnWrapper}>
            <div
              className={`${commonStyles.flexFill} ${commonStyles.mainCard} p-0`}
            >
              {featuresConfig.summariesGraphs && (
                <SpendByMonthChart
                  setSpend={setTotalSpend}
                  setPieChartData={setDoughnutData}
                  setTotalTransactionsData={setTotalTransactions}
                  setTotalKWhData={setTotalKWh}
                  setHasFinishedLoading={setHasFinishedLoadingData}
                  setTotalLitresData={setTotalLitres}
                  setUpdateTextData={setUpdateText}
                  setIsGraphFiltersOpen={setIsGraphFiltersOpen}
                  isGraphFiltersOpen={isGraphFiltersOpen}
                  stackedGraph={stackedGraph}
                  fromYearMonth={fromYearMonth}
                  setFromYearMonth={setFromYearMonth}
                  toYearMonth={toYearMonth}
                  setToYearMonth={setToYearMonth}
                  hasFinishedLoading={hasFinishedLoadingData}
                />
              )}
            </div>
          </div>
          <div className={`${commonStyles.columnWrapper} gap-[20px]`}>
            {featuresConfig.summariesGraphs && (
              <>
                <div className={`${commonStyles.mainCard} `}>
                  <FilterChart
                    hasFinishedLoading={hasFinishedLoadingData}
                    updateText={updateText}
                    setFilterPopoutPosition={setFilterPopoutPosition}
                    isGraphFiltersOpen={isGraphFiltersOpen}
                    setIsGraphFiltersOpen={setIsGraphFiltersOpen}
                    filterButtonRef={filterButtonRef}
                  />
                </div>
                <div
                  className={`${commonStyles.mainCard}  ${commonStyles.flexFill} items-center`}
                >
                  <SpendByMonthPieChart
                    donutData={doughnutData}
                    totalDataKWh={totalKWh}
                    totalDataSpend={totalSpend}
                    totalDataLitres={totalLitres}
                    totalDataTransactions={totalTransactions}
                    hasFinishedLoaded={hasFinishedLoadingData}
                    isGraphFiltersOpen={isGraphFiltersOpen}
                    setIsGraphFiltersOpen={setIsGraphFiltersOpen}
                    filterPopoutPosition={filterPopoutPosition}
                    stackedGraph={stackedGraph}
                    setStackedGraph={setStackedGraph}
                    fromYearMonth={fromYearMonth}
                    setFromYearMonth={setFromYearMonth}
                    toYearMonth={toYearMonth}
                    setToYearMonth={setToYearMonth}
                    filterPopoutRef={filterPopoutRef}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={commonStyles.footerWrapper}>
        <Footer />
      </div>
    </div>
  );
}
