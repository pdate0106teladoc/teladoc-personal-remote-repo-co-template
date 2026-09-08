import { Tab, Tabs } from "react-bootstrap";
import "../styles/Products.scss";
import { FailSafePage, SideModal, FilteredByBar, Button, FilterButton, SearchBar } from "@ucc/common-ui";
import ProductSummaryCard from "@/components/ProductCard/ProductSummaryCard";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductViewFilter from "./ProductViewFilter";
import { useParams } from "react-router-dom";
import { LABELS } from "@/constants";
import {
  Bundle,
  Field,
  GroupedForUI,
  Product,
  ProductDetailResponse,
} from "@/types/GrpView";
import { Scope, useFilterStore } from "@/store/filterStore";
import {
  filterStandaaloneProducts,
  productMatchesFilters,
  splitByActivity,
} from "@/utils";
import ProductDetail from "./ProductDetail";
import useGroupStore from "@/store/useGroupStore";

const Products = () => {
  const [openModal, setOpenModal] = useState(false);
  const [productDetailModal, setProductDetailModal] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [searchActiveProducts, setSearchActiveProducts] = useState<string>("");
  const [searchNonActivePrpducts, setSearchNonActiveProducts] =
    useState<string>("");
  const { getProductDetailData, getProductsData } = useGroupStore();
  const [modalScope, setModalScope] = useState<Scope>("active");
  const [productTitle, setProductTitle] = useState<string>("");
  const [productDetail, setProductDetail] = useState<
    Record<
      string,
      { direct: Field[]; groups: { [groupName: string]: Field[] } }
    >
  >({});
  const [productDetailResponse, setProductDetailResponse] =
    useState<ProductDetailResponse | null>(null);
  const data = getProductsData(id!);
  const [category, setCategory] = useState<string>("");
  const allProductDetailData = getProductDetailData(id!);
  const [parentBundles, setParentBundles] = useState<string[]>([]);
  const [productTag, setProductTag] = useState<string>("");
  useEffect(() => {
    const productDetails = allProductDetailData?.filter(
      (product) => product.product === productTitle,
    );
    if (productDetails && productDetails.length > 0) {
      setProductDetailResponse(productDetails[0]);
    }
  }, [productTitle, allProductDetailData]);

  const activeQuery = searchActiveProducts.trim().toLowerCase();
  const nonActiveQuery = searchNonActivePrpducts.trim().toLowerCase();
  const getApplied = useFilterStore((s) => s.getApplied);
  const appliedActiveMeta = getApplied("active");
  const appliedInactiveMeta = getApplied("inactive");
  const appliedActiveCount = appliedActiveMeta.filterApplied;
  const appliedInactiveCount = appliedInactiveMeta.filterApplied;
  const activeFilteredKeys = appliedActiveMeta.filteredAppliedKeys;
  const inactiveFilteredKeys = appliedInactiveMeta.filteredAppliedKeys;

  const activeFilters = useFilterStore((s) => s.getFilters("active"));
  const inactiveFilters = useFilterStore((s) => s.getFilters("inactive"));

  const clearRefActive = useRef<() => void>(null);
  const clearRefInactive = useRef<() => void>(null);

  const { candidateId } = useParams<{ candidateId?: string }>();
  const mode = candidateId ? "edit" : "view";

  // Map to track which bundles each product belongs to (array to handle multiple bundles)
  const productToBundleMap = useRef<Map<string, Bundle[]>>(new Map());

  const openFiltersFor = useCallback((scope: Scope) => {
    setModalScope(scope);
    setOpenModal(true);
  }, []);

  const handleClearAllActive = useCallback(() => {
    clearRefActive.current?.();
  }, []);
  const handleClearAllInactive = useCallback(() => {
    clearRefInactive.current?.();
  }, []);

  const { active, expired } = splitByActivity(
    data || { bundles: [], standaloneProducts: [] },
  );

  const filterStandalone = useCallback(
    (standalone?: any[], filters?: any) =>
      (standalone || []).filter((p) => productMatchesFilters(p, filters)),
    [],
  );

  // Recursively extract all products from bundle tree (deduplicated by productId)
  const extractProductsFromBundles = useCallback(
    (bundles?: any[], filters?: any, searchQuery?: string): Product[] => {
      if (!bundles) return [];
      const products: Product[] = [];
      const seenProductIds = new Set<string>();
      const query = (searchQuery || "").trim().toLowerCase();

      const walk = (nodes?: any[]) => {
        if (!nodes) return;
        nodes.forEach((bundle: Bundle) => {
          if (bundle.products && bundle.products.length > 0) {
            bundle.products.forEach((product: Product) => {
              if (product.productId) {
                // Check if product matches filters and search query
                const matchesFilter =
                  !filters || productMatchesFilters(product, filters);
                const matchesSearch =
                  !query ||
                  (product.productName || "").toLowerCase().includes(query);

                if (matchesFilter && matchesSearch) {
                  // Add to products array only if not seen before
                  if (!seenProductIds.has(product.productId)) {
                    seenProductIds.add(product.productId);
                    products.push(product);
                  }
                  // Add bundle to the array for this product (check for duplicates by bundleId)
                  const existingBundles =
                    productToBundleMap.current.get(product.productId) || [];
                  const bundleAlreadyExists = existingBundles.some(
                    (b) => b.bundleId === bundle.bundleId,
                  );
                  if (!bundleAlreadyExists) {
                    productToBundleMap.current.set(product.productId, [
                      ...existingBundles,
                      bundle,
                    ]);
                  }
                }
              }
            });
          }
          if (bundle.bundles && bundle.bundles.length > 0) {
            walk(bundle.bundles);
          }
        });
      };
      walk(bundles);
      return products;
    },
    [],
  );

  const filteredActiveData = useMemo(
    () => ({
      bundles: active?.bundles || [],
      standaloneProducts: filterStandalone(
        active?.standaloneProducts,
        activeFilters,
      ),
    }),
    [active, activeFilters, filterStandalone],
  );

  const filteredExpiredData = useMemo(
    () => ({
      bundles: expired?.bundles || [],
      standaloneProducts: filterStandalone(
        expired?.standaloneProducts,
        inactiveFilters,
      ),
    }),
    [expired, inactiveFilters, filterStandalone],
  );

  const activeDisplayBundles = useMemo(
    () => filteredActiveData.bundles || [],
    [filteredActiveData],
  );
  const activeDisplayStandalone = useMemo(
    () =>
      filterStandaaloneProducts(
        filteredActiveData.standaloneProducts,
        activeQuery,
      ) || [],
    [filteredActiveData, activeQuery],
  );

  // Extract all products from bundles for flat display (with filters and search)
  const activeBundleProducts = useMemo(
    () =>
      extractProductsFromBundles(
        activeDisplayBundles,
        activeFilters,
        activeQuery,
      ),
    [
      activeDisplayBundles,
      activeFilters,
      activeQuery,
      extractProductsFromBundles,
    ],
  );

  // Deduplicate standalone products by filtering out those with productIds already in bundle products
  const activeDeduplicatedStandalone = useMemo(() => {
    const bundleProductIds = new Set(
      activeBundleProducts.map((p) => p.productId).filter(Boolean),
    );
    return activeDisplayStandalone.filter(
      (p) => !p.productId || !bundleProductIds.has(p.productId),
    );
  }, [activeBundleProducts, activeDisplayStandalone]);

  // Filter by productEnabled - only show products where productEnabled is true
  const activeEnabledBundleProducts = useMemo(
    () => activeBundleProducts.filter((p) => p.productEnabled === true),
    [activeBundleProducts],
  );

  const activeEnabledStandaloneProducts = useMemo(
    () => activeDeduplicatedStandalone.filter((p) => p.productEnabled === true),
    [activeDeduplicatedStandalone],
  );

  const inactiveDisplayBundles = useMemo(
    () => filteredExpiredData.bundles || [],
    [filteredExpiredData],
  );
  const inactiveDisplayStandalone = useMemo(
    () =>
      filterStandaaloneProducts(
        filteredExpiredData.standaloneProducts,
        nonActiveQuery,
      ) || [],
    [filteredExpiredData, nonActiveQuery],
  );

  // Extract all products from bundles for flat display (with filters and search)
  const inactiveBundleProducts = useMemo(
    () =>
      extractProductsFromBundles(
        inactiveDisplayBundles,
        inactiveFilters,
        nonActiveQuery,
      ),
    [
      inactiveDisplayBundles,
      inactiveFilters,
      nonActiveQuery,
      extractProductsFromBundles,
    ],
  );

  // Deduplicate standalone products by filtering out those with productIds already in bundle products
  const inactiveDeduplicatedStandalone = useMemo(() => {
    const bundleProductIds = new Set(
      inactiveBundleProducts.map((p) => p.productId).filter(Boolean),
    );
    return inactiveDisplayStandalone.filter(
      (p) => !p.productId || !bundleProductIds.has(p.productId),
    );
  }, [inactiveBundleProducts, inactiveDisplayStandalone]);

  // Filter by productEnabled - only show products where productEnabled is true
  const inactiveEnabledBundleProducts = useMemo(
    () => inactiveBundleProducts.filter((p) => p.productEnabled === true),
    [inactiveBundleProducts],
  );

  const inactiveEnabledStandaloneProducts = useMemo(
    () =>
      inactiveDeduplicatedStandalone.filter((p) => p.productEnabled === true),
    [inactiveDeduplicatedStandalone],
  );

  useEffect(() => {
    function groupForUISinglePass(data: { fields: Field[] }): GroupedForUI {
      const sortedFields = [...data.fields].sort((a, b) => a.order - b.order);
      return sortedFields.reduce<GroupedForUI>((acc, field) => {
        const cat = field.section || "Uncategorized";
        if (!acc[cat]) acc[cat] = { direct: [], groups: {} };

        if (field.group) {
          if (!acc[cat].groups[field.group]) acc[cat].groups[field.group] = [];
          acc[cat].groups[field.group].push(field);
        } else {
          acc[cat].direct.push(field);
        }

        return acc;
      }, {});
    }
    if (productDetailResponse) {
      const response = groupForUISinglePass(productDetailResponse);
      setProductDetail(response);
    }
  }, [productDetailResponse]);

  const handleProductClick = (product: Product) => {
    // Only clear product data if it's a different product
    if (productTitle !== product.productName) {
      setProductDetail({});
    }
    setParentBundles([]);

    if (product.productId) {
      const parentBundles = productToBundleMap.current.get(product.productId);
      if (parentBundles && parentBundles.length > 0) {
        parentBundles.forEach((bundle) => {
          setParentBundles((prev) => [...prev, bundle.bundleName]);
        });
      }
    }

    setProductDetailModal(true);
    setProductTitle(product.productName);
    setCategory(product.category ?? "");
    setProductTag(product.productTag || "");
  };
  if (!data)
    return (
      <div className="no-data">
        <FailSafePage cardType="noData" />
      </div>
    );

  return (
    <div>
      <Tabs defaultActiveKey="active&upcoming" id="uncontrolled-tab-example" className={mode === "edit" ? "edit-mode" : ""}>
        <Tab eventKey="active&upcoming" title="Active & Upcoming">
          <div className="tab-containers">
            <div>
              <SearchBar
                placeholder="Find products..."
                onChange={(e) => setSearchActiveProducts(e.target.value)}
                overlayRequired={false}
                type="md"
                closeIcon={false}
                useLocalSearch={true}
                customClass="product-search"
              />
            </div>
            <div>
              <FilterButton
                count={appliedActiveCount}
                onClick={() => openFiltersFor("active")}
                className="filter-button-style"
              />
              <SideModal
                show={openModal && modalScope === "active"}
                title="Filters"
                onHide={() => setOpenModal(false)}
              >
                <ProductViewFilter
                  scope={modalScope}
                  setOpenModal={setOpenModal}
                  onExposeClear={(fn) => (clearRefActive.current = fn)}
                />
              </SideModal>
            </div>
            {activeFilteredKeys.length > 0 && (
              <>
                <FilteredByBar filters={activeFilteredKeys} />
                <Button
                  className="fbb-clear"
                  type="button"
                  variant="secondary"
                  onClick={handleClearAllActive}
                >
                  {LABELS.products.CLEAR_ALL}
                </Button>
              </>
            )}
          </div>
          <div className="contents">
            {activeEnabledBundleProducts.length === 0 &&
              activeEnabledStandaloneProducts.length === 0 ? (
              <FailSafePage cardType="emptyState" />
            ) : (
              <>
                {activeEnabledBundleProducts.map((product, index) => (
                  <div
                    key={`bundle-product-${index}`}
                    className="standalone-products"
                    onClick={() => handleProductClick(product)}
                  >
                    <ProductSummaryCard data={product} />
                  </div>
                ))}
                {activeEnabledStandaloneProducts.map((product, index) => (
                  <div
                    key={`standalone-${index}`}
                    className="standalone-products"
                    onClick={() => handleProductClick(product)}
                  >
                    <ProductSummaryCard data={product} />
                  </div>
                ))}
              </>
            )}
          </div>
        </Tab>
        <Tab eventKey="inactive" title="Terminated" className="inactive-tab">
          <div className="tab-containers">
            <div>
              <SearchBar
                placeholder="Find products..."
                onChange={(e) => setSearchNonActiveProducts(e.target.value)}
                overlayRequired={false}
                type="md"
                closeIcon={false}
                useLocalSearch={true}
                customClass="product-search"
              />
            </div>
            <div>
              <FilterButton
                count={appliedInactiveCount}
                onClick={() => openFiltersFor("inactive")}
                className="filter-button-style"
              />
              <SideModal
                show={openModal && modalScope === "inactive"}
                title="Filters"
                onHide={() => setOpenModal(false)}
              >
                <ProductViewFilter
                  scope={modalScope}
                  setOpenModal={setOpenModal}
                  onExposeClear={(fn) => (clearRefInactive.current = fn)}
                />
              </SideModal>
            </div>
            {inactiveFilteredKeys.length > 0 && (
              <>
                <FilteredByBar filters={inactiveFilteredKeys} />
                <Button
                  className="fbb-clear"
                  type="button"
                  variant="secondary"
                  onClick={handleClearAllInactive}
                >
                  {LABELS.products.CLEAR_ALL}
                </Button>
              </>
            )}
          </div>
          <div className="contents">
            {inactiveEnabledBundleProducts.length === 0 &&
              inactiveEnabledStandaloneProducts.length === 0 ? (
              <FailSafePage cardType="emptyState" />
            ) : (
              <>
                {inactiveEnabledBundleProducts.map((product, index) => (
                  <div
                    key={`bundle-product-${index}`}
                    className="standalone-products"
                    onClick={() => handleProductClick(product)}
                  >
                    <ProductSummaryCard data={product} />
                  </div>
                ))}
                {inactiveEnabledStandaloneProducts.map((product, index) => (
                  <div
                    key={`standalone-${index}`}
                    className="standalone-products"
                    onClick={() => handleProductClick(product)}
                  >
                    <ProductSummaryCard data={product} />
                  </div>
                ))}
              </>
            )}
          </div>
        </Tab>
      </Tabs>
      <SideModal
        show={productDetailModal}
        title={productTitle}
        onHide={() => setProductDetailModal(false)}
      >
        <ProductDetail
          data={productDetail}
          billingRteOverrides={productDetailResponse?.rteOverrides ?? []}
          opportunities={productDetailResponse?.opportunities ?? []}
          category={category}
          parentBundles={parentBundles}
          marketingDetails={productDetailResponse?.marketing}
          engagementCriteria={productDetailResponse?.engagementCriteria}
          eligibilityDetails={productDetailResponse?.eligibility}
          generalSettings={productDetailResponse?.generalSettings}
          billing={productDetailResponse?.billing}
          productTag={productTag}
          rteOverrideFlag={
            productDetailResponse?.rteAndPayerDisplayFlag || false
          }
          productName={productTitle}
          subscriptions={productDetailResponse?.subscriptions || []}
        />
      </SideModal>
    </div>
  );
};
export default Products;
