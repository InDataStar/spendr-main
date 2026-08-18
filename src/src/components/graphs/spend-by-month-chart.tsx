import { createLogger } from "@/utils/log";
import {
  IgrCategoryChart,
  IgrCategoryChartModule,
  IgrCategoryXAxis,
  IgrDataChart,
  IgrDataChartAnnotationModule,
  IgrDataChartCategoryCoreModule,
  IgrDataChartCategoryModule,
  IgrDataChartCoreModule,
  IgrDataChartInteractivityModule,
  IgrDataChartStackedModule,
  IgrDataToolTipLayer,
  IgrLegend,
  IgrLegendModule,
  IgrNumericYAxis,
  IgrStackedColumnSeries,
  IgrStackedFragmentSeries,
  IgrStackedFragmentSeriesModule,
} from "@infragistics/igniteui-react-charts";
import { useEffect, useMemo, useRef, useState } from "react";
import commonStyles from "@/app/dashboard/client-page.module.css";
import styles from "./spend-by-month-chart.module.css";
import { SummariesService } from "@/services/summaries-service";
import { FuelTransactionsResponse } from "@/types/summaries";
import { useUserStore } from "@/stores/userStore";

const logger = createLogger("SpendByMonthChart");

type IgniteUIModule = { register: () => void };

const mods: IgniteUIModule[] = [
  IgrLegendModule,
  IgrCategoryChartModule,
  IgrDataChartCoreModule,
  IgrDataChartCategoryModule,
  IgrDataChartCategoryCoreModule,
  IgrDataChartInteractivityModule,
  IgrDataChartAnnotationModule,
  IgrDataChartStackedModule,
  IgrStackedFragmentSeriesModule,
];
mods.forEach((m) => m.register());

interface MonthlyProductSummary {
  month: string; // e.g., "Jan", "Feb"
  [product: string]: number | string; // product names as keys
}

const productKeys = [
  "Diesel",
  "Premium Diesel",
  "Premium Unleaded",
  "Unleaded",
  "LPG",
  "EV",
  "Others",
];
const evProductKeys = ["Fast Charge", "Standard Charge"];

const networkBrandAbvKeys: Record<string, string> = {
  "BP Australia Pty Ltd": "BP Aus",
  "Mobil Oil Australia Pty Ltd": "Mobil Aus",
  "Shell Oil Company of Australia": "Shell Aus",
  "Shell Third Party Sites": "Shell 3rd Party",
  "EG Fuelco (Australia) Limited": "EG Fuelco",
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface TotalsData {
  x: string;
  y: number;
  percent: string;
}

function getMonthlyProductSummary(
  data: FuelTransactionsResponse,
  fromYearMonth: string,
  toYearMonth: string,
): MonthlyProductSummary[] {
  // Generate all months in range
  const allMonths: MonthlyProductSummary[] = [];
  const [fromYear, fromMonth] = fromYearMonth.split("-").map(Number);
  const [toYear, toMonth] = toYearMonth.split("-").map(Number);

  let currentYear = fromYear;
  let currentMonth = fromMonth;

  while (
    currentYear < toYear ||
    (currentYear === toYear && currentMonth <= toMonth)
  ) {
    const yearMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
    const monthName = new Date(currentYear, currentMonth - 1).toLocaleString(
      "en-US",
      { month: "short" },
    );

    // Initialize result with month name
    const result: MonthlyProductSummary = { month: monthName };

    // Find existing data for this month
    const monthData = data.monthsData.find((m) => m.yearMonth === yearMonth);

    if (monthData) {
      // Sum totalPrice by product
      monthData.records.forEach((record) => {
        let product = record.product;
        if (evProductKeys.includes(product)) {
          product = "EV";
        } else if (productKeys.indexOf(product) === -1) {
          logger.warn(
            `Unknown product "${product}" found, categorizing as "Others"`,
          );
          product = "Others";
        }
        if (typeof result[product] === "number") {
          result[product] = (result[product] as number) + record.totalPrice;
        } else {
          result[product] = record.totalPrice;
        }
      });
    }
    allMonths.push(result);

    // Move to next month
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return allMonths;
}

// Commented out in case we need this in future
// function getTotalsByProduct(data: MonthlyProductSummary[]): TotalsData[] {
//   const productNames = new Set<string>();
//   data.forEach((monthData) => {
//     Object.keys(monthData).forEach((key) => {
//       if (key !== "month") {
//         productNames.add(key);
//       }
//     });
//   });

//   // Calculate totals for each product
//   const productTotals = Array.from(productNames).map((product) => {
//     const total = data.reduce((sum, monthData) => {
//       const value = monthData[product];
//       return sum + (typeof value === "number" ? value : 0);
//     }, 0);
//     return { product, total };
//   });

//   // Calculate grand total
//   const grandTotal = productTotals.reduce((sum, item) => sum + item.total, 0);

//   // Format as combined data with percentages
//   return productTotals.map((item) => ({
//     x: item.product,
//     y: item.total,
//     percent: ((item.total / grandTotal) * 100).toFixed(1) + "%",
//   }));
// }

function getTotalsByNetworkBrand(data: FuelTransactionsResponse): TotalsData[] {
  // Calculate totals for each dlpGroup
  const dlpGroupTotals = new Map<string, number>();

  data.monthsData.forEach((month) => {
    month.records.forEach((record) => {
      let dlpGroup = record.dlpGroup;
      dlpGroup = networkBrandAbvKeys[dlpGroup] || dlpGroup;
      const currentTotal = dlpGroupTotals.get(dlpGroup) || 0;
      dlpGroupTotals.set(dlpGroup, currentTotal + record.totalPrice);
    });
  });

  // Calculate grand total
  const grandTotal = Array.from(dlpGroupTotals.values()).reduce(
    (sum, total) => sum + total,
    0,
  );

  // Format as combined data with percentages
  return Array.from(dlpGroupTotals.entries()).map(([dlpGroup, total]) => ({
    x: dlpGroup,
    y: total,
    percent: ((total / grandTotal) * 100).toFixed(1) + "%",
  }));
}

function formatDecimal(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function cleanupIgniteChartTooltips() {
  if (typeof document === "undefined") return;

  const selectors = [".ui-chart-pointer-tooltip-container"];

  for (const selector of selectors) {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      el.remove();
    });
  }
}

interface SpendByMonthChartProps {
  setSpend: (spend: number) => void;
  setTotalTransactionsData: (total: number) => void;
  setTotalKWhData: (kwh: number) => void;
  setTotalLitresData: (litres: number) => void;
  setUpdateTextData: (text: string) => void;
  hasFinishedLoading: boolean;
  setHasFinishedLoading: (finished: boolean) => void;
  setPieChartData: (data: TotalsData[]) => void;
  setIsGraphFiltersOpen: (isGrapFiltersOpen: boolean) => void;
  isGraphFiltersOpen: boolean;
  stackedGraph: boolean;
  fromYearMonth: string;
  setFromYearMonth: (fromYearMonth: string) => void;
  toYearMonth: string;
  setToYearMonth: (toYearMonth: string) => void;
}

export default function SpendByMonthChart({
  setSpend,
  setPieChartData,
  fromYearMonth,
  toYearMonth,
  stackedGraph,
  isGraphFiltersOpen,
  setIsGraphFiltersOpen,
  hasFinishedLoading,
  setHasFinishedLoading,
  setTotalTransactionsData,
  setUpdateTextData,
  setTotalLitresData,
  setTotalKWhData,
}: SpendByMonthChartProps) {
  const [graphRangeText, setGraphRangeText] = useState<string>("");
  const [fuelTransactionsData, setFuelTransactionsData] =
    useState<FuelTransactionsResponse | null>(null);
  const [normalizedColumnData, setNormalizedColumnData] = useState<
    MonthlyProductSummary[] | undefined
  >(undefined);
  const [maxMonthTotalSpend, setMaxMonthTotalSpend] = useState<number>(0);
  const [maxMonthSpend, setMaxMonthSpend] = useState<number>(0);
  const columnLegendRef = useRef<IgrLegend>(null);
  const stackedLegendRef = useRef<IgrLegend>(null);
  const [updateText, setUpdateText] = useState("");

  // --- Resize observer for chart container ---
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setChartSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // ------------------------------------------

  useEffect(() => {
    (async () => {
      try {
        useUserStore.getState().retrieveUserId();

        await useUserStore.getState().fetchAccessibleAccounts();
        const accountId = useUserStore.getState().currentAccountId ?? 0;
        const response = await SummariesService.getFuelTransactions(
          accountId,
          fromYearMonth,
          toYearMonth,
        );
        setFuelTransactionsData(response);
      } catch (error) {
        logger.error(error);
      } finally {
        setHasFinishedLoading(true);
      }
    })();
  }, [fromYearMonth, setHasFinishedLoading, toYearMonth]);

  useEffect(() => {
    return () => {
      cleanupIgniteChartTooltips();
    };
  }, []);

  useEffect(() => {
    if (fuelTransactionsData) {
      //   logger.log("Fuel Transactions Data:", fuelTransactionsData);
      const columnData = getMonthlyProductSummary(
        fuelTransactionsData,
        fromYearMonth,
        toYearMonth,
      );

      const normalizedColumnData = (() => {
        return columnData.map((month) => {
          const normalized: MonthlyProductSummary = { month: month.month };
          productKeys.forEach((product) => {
            normalized[product] =
              typeof month[product] === "number" ? month[product] : 0;
          });
          return normalized;
        });
      })();
      setNormalizedColumnData(normalizedColumnData);
      // logger.log("Normalized Column Data:", normalizedColumnData);

      //   const doughnutData = getTotalsByProduct(normalizedColumnData);
      const doughnutData = getTotalsByNetworkBrand(fuelTransactionsData);
      setPieChartData(doughnutData);
      // logger.log("Doughnut Data:", doughnutData);

      // Calculate totals from fuel transactions data

      setSpend(
        fuelTransactionsData.monthsData.reduce(
          (sum, month) =>
            sum +
            month.records.reduce(
              (monthSum, record) => monthSum + record.totalPrice,
              0,
            ),
          0,
        ),
      );

      const monthSums = normalizedColumnData.map((month) =>
        productKeys.reduce(
          (sum, p) =>
            sum + (typeof month[p] === "number" ? (month[p] as number) : 0),
          0,
        ),
      );
      const maxMonth = monthSums.length ? Math.max(...monthSums) : 0;
      setMaxMonthTotalSpend(Math.max(Math.ceil(maxMonth / 100), 1) * 100);

      // compute max single-product monthly spend across all months
      if (normalizedColumnData.length === 0) {
        setMaxMonthSpend(100);
      } else {
        const perProductMax = productKeys.map((p) =>
          normalizedColumnData.reduce(
            (mx, m) => Math.max(mx, Number((m[p] as number) || 0)),
            0,
          ),
        );
        const overallMaxProduct = perProductMax.length
          ? Math.max(...perProductMax)
          : 0;
        setMaxMonthSpend(Math.max(Math.ceil(overallMaxProduct / 100), 1) * 100);
      }

      setTotalTransactionsData(
        fuelTransactionsData.monthsData.reduce(
          (sum, month) =>
            sum +
            month.records.reduce(
              (monthSum, record) => monthSum + record.totalTransactions,
              0,
            ),
          0,
        ),
      );
      setTotalLitresData(
        fuelTransactionsData.monthsData.reduce(
          (sum, month) =>
            sum +
            month.records.reduce(
              (monthSum, record) =>
                monthSum +
                (record.quantityType === "Litres" ? record.totalQuantity : 0),
              0,
            ),
          0,
        ),
      );

      setTotalKWhData(
        fuelTransactionsData.monthsData.reduce(
          (sum, month) =>
            sum +
            month.records.reduce(
              (monthSum, record) =>
                monthSum +
                (record.quantityType === "KiloWattHours"
                  ? record.totalQuantity
                  : 0),
              0,
            ),
          0,
        ),
      );
    }
  }, [
    fuelTransactionsData,
    setSpend,
    setTotalKWhData,
    setTotalLitresData,
    setTotalTransactionsData,
    setPieChartData,
    fromYearMonth,
    toYearMonth,
  ]);

  useEffect(() => {
    setUpdateTextData(" ");
  }, [normalizedColumnData, setUpdateTextData, stackedGraph]);

  useEffect(() => {
    const [fromYear, fromMonth] = fromYearMonth.split("-").map(Number);
    const [toYear, toMonth] = toYearMonth.split("-").map(Number);

    const text =
      (fromYear && fromMonth ? months[fromMonth - 1] + " " + fromYear : "") +
      " - " +
      (toYear && toMonth ? months[toMonth - 1] + " " + toYear : "");

    logger.log("Selected range:", fromYearMonth, toYearMonth, text);
    setGraphRangeText(text);
  }, [fromYearMonth, toYearMonth]);

  // Close picker when clicking outside
  useEffect(() => {
    // const handleClickOutside = (event: MouseEvent) => {
    //   event.preventDefault();
    //   event.stopPropagation();
    //   if (
    //     filterPopoutRef.current &&
    //     !filterPopoutRef.current.contains(event.target as Node) &&
    //     filterButtonRef.current &&
    //     !filterButtonRef.current.contains(event.target as Node)
    //   ) {
    //     setIsGraphFiltersOpen(false);
    //   }
    // };

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
      // document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        // document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isGraphFiltersOpen, setIsGraphFiltersOpen]);

  const cssSeries = useMemo(() => {
    if (typeof window === "undefined") return [];
    const raw = getComputedStyle(document.documentElement).getPropertyValue(
      "--charts-default-series",
    );
    return raw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }, []);

  useEffect(() => {
    setUpdateText((prev) => (prev ? "" : " "));
  }, [normalizedColumnData, stackedGraph]);

  const chartWidth = chartSize.w > 0 ? `${chartSize.w}px` : "100%";
  // Fall back to 360px (matches CSS min-height) until ResizeObserver fires
  const chartHeight = chartSize.h > 0 ? `${chartSize.h}px` : "100%";

  return (
    <>
      <div className={` ${styles.fullView} ${styles.topContainer}  `}>
        <div className={`${styles.mainCard} ${styles.innerChartHolder}`}>
          <div
            className={`${commonStyles.graphHeaderRowContents} ${styles.detailSpaced}`}
          >
            {/* LEFT SIDE */}
            <div className={styles.chartTitleWrapper}>
              <div className={styles.iconHolder}>
                <div
                  className={`${commonStyles.iconMask} + ${styles.chartIconWrapper}`}
                  style={{
                    maskImage: `url(/icons/calendar.svg)`,
                    WebkitMaskImage: `url(/icons/calendar.svg)`,
                  }}
                />
              </div>

              <div className={styles.chartTitleContainer}>
                <h3
                  className={`${commonStyles.cardTitle} + ${styles.noMargin}`}
                >
                  Spend by Month
                </h3>
                <p className={commonStyles.subContent}>From {graphRangeText}</p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className={styles.rightHeaderDetailContainer}>
              {stackedGraph ? (
                <IgrLegend
                  key={`stack-legend`}
                  ref={stackedLegendRef}
                  orientation="Horizontal"
                  textStyle="14px Poppins"
                ></IgrLegend>
              ) : (
                <IgrLegend
                  key={`series-legend`}
                  ref={columnLegendRef}
                  orientation="Horizontal"
                  textStyle="14px Poppins"
                ></IgrLegend>
              )}
            </div>
          </div>
          <div className={commonStyles.chartWrapper}>
            {hasFinishedLoading ? (
              <div className={commonStyles.chartInner}>
                {normalizedColumnData && (
                  <div ref={chartContainerRef} className={commonStyles.chartFill}>
                    {stackedGraph ? (
                      <IgrDataChart
                        width={chartWidth}
                        height={chartHeight}
                        key="stacked-chart"
                        legend={stackedLegendRef.current}
                        isHorizontalZoomEnabled={false}
                        isVerticalZoomEnabled={false}
                      >
                        <IgrCategoryXAxis
                          name="xAxis"
                          label="month"
                          dataSource={normalizedColumnData}
                          interval={1}
                          gap="1.5"
                        />
                        <IgrNumericYAxis
                          name="yAxis"
                          labelFormat="${0}"
                          formatLabel={(v: number) =>
                            new Intl.NumberFormat("en-AU", {
                              style: "currency",
                              currency: "AUD",
                              notation: "compact",
                              maximumFractionDigits: 1,
                            }).format(Number(v))
                          }
                          minimumValue={0}
                          maximumValue={maxMonthTotalSpend}
                        />
                        <IgrStackedColumnSeries
                          name="stackedBarSeries"
                          dataSource={normalizedColumnData}
                          xAxisName="xAxis"
                          yAxisName="yAxis"
                          showDefaultTooltip={true}
                          areaFillOpacity="1"
                        >
                          <IgrStackedFragmentSeries
                            name="s1"
                            valueMemberPath="Unleaded"
                            title="Unleaded"
                          ></IgrStackedFragmentSeries>
                          <IgrStackedFragmentSeries
                            name="s2"
                            valueMemberPath="Premium Unleaded"
                            title="Premium Unleaded"
                          ></IgrStackedFragmentSeries>
                          <IgrStackedFragmentSeries
                            name="s3"
                            valueMemberPath="Diesel"
                            title="Diesel"
                          ></IgrStackedFragmentSeries>
                          <IgrStackedFragmentSeries
                            name="s4"
                            valueMemberPath="Premium Diesel"
                            title="Premium Diesel"
                          ></IgrStackedFragmentSeries>
                          <IgrStackedFragmentSeries
                            name="s5"
                            valueMemberPath="LPG"
                            title="LPG"
                          ></IgrStackedFragmentSeries>
                          <IgrStackedFragmentSeries
                            name="s6"
                            valueMemberPath="EV"
                            title="EV"
                          ></IgrStackedFragmentSeries>
                          <IgrStackedFragmentSeries
                            name="s7"
                            valueMemberPath="Others"
                            title="Others"
                          ></IgrStackedFragmentSeries>
                        </IgrStackedColumnSeries>
                        <IgrDataToolTipLayer
                          name="Tooltips"
                          valueFormatMode="Currency"
                          valueFormatAbbreviation="None"
                        />
                      </IgrDataChart>
                    ) : (
                      <IgrCategoryChart
                        width={chartWidth}
                        height={chartHeight}
                        chartType="Column"
                        key="category-chart"
                        dataSource={normalizedColumnData}
                        legend={columnLegendRef.current}
                        xAxisInterval="1"
                        yAxisFormatLabel={(c) => `$${c}`}
                        yAxisMinimumValue={0}
                        yAxisMaximumValue={maxMonthSpend}
                        yAxisTitleLeftMargin="10"
                        yAxisTitleRightMargin="5"
                        yAxisLabelLeftMargin="0"
                        isHorizontalZoomEnabled="false"
                        isVerticalZoomEnabled="false"
                        isCategoryHighlightingEnabled="false"
                        crosshairsDisplayMode="None"
                        dataToolTipValueFormatMode="Currency"
                        toolTipType="None"
                        tooltipTemplate={(context) => {
                          const item = context?.dataContext?.item as
                            | MonthlyProductSummary
                            | undefined;
                          if (!item) return null;
                          const total = productKeys.reduce(
                            (sum, p) =>
                              sum +
                              (typeof item[p] === "number"
                                ? (item[p] as number)
                                : 0),
                            0,
                          );
                          return (
                            <div className={styles.columnTooltip}>
                              <div className={styles.columnTooltipHeader}>
                                {item.month}
                              </div>
                              <table className={styles.columnTooltipTable}>
                                <tbody>
                                  {productKeys.map((p, i) => {
                                    const raw = item[p];
                                    const val =
                                      typeof raw === "number" ? raw : 0;
                                    const color = cssSeries[i] ?? "transparent";
                                    return (
                                      <tr key={p}>
                                        <td
                                          className={styles.columnTooltipCell}
                                        >
                                          <span
                                            className={
                                              styles.columnTooltipCellColour
                                            }
                                            style={{
                                              backgroundColor: color,
                                            }}
                                          />
                                        </td>
                                        <td
                                          className={styles.columnTooltipCell}
                                        >
                                          {p}
                                        </td>
                                        <td
                                          className={
                                            styles.columnTooltipCell +
                                            " " +
                                            styles.columnTooltipCellRight
                                          }
                                        >
                                          ${formatDecimal(val)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  <tr>
                                    <td
                                      colSpan={2}
                                      className={styles.columnTooltipCellTotal}
                                    >
                                      Total
                                    </td>
                                    <td
                                      className={
                                        styles.columnTooltipCellTotalRight
                                      }
                                    >
                                      ${formatDecimal(total)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          );
                        }}
                      ></IgrCategoryChart>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="skeletonMain">{updateText}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
