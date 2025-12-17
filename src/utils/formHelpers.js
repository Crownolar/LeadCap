/**
 * Form Helper Utilities
 * Centralized functions to reduce repetition in form components
 */

import api from "./api";
import { productCategories, sampleTypes, vendorTypes } from "./constants";

// ===== FORM INITIALIZATION =====

/**
 * Get initial form state for sample creation
 */
export const getInitialSampleFormState = () => ({
  stateId: "",
  lgaId: "",
  productCategoryId: "",
  productVariantId: "",
  productName: "",
  brandName: "",
  batchNumber: "",
  price: "",
  marketId: "",
  marketName: "",
  sampleType: "SOLID",
  calibrationCurveId: "",
  vendorType: "",
  vendorTypeOther: "",
  isRegistered: false,
  gpsLatitude: "",
  gpsLongitude: "",
  productOrigin: "LOCAL",
  navdacNumber: "",
  sonNumber: "",
  productPhoto: null,
});

// ===== DATA FETCHING =====

/**
 * Fetch all required dropdown data in parallel
 */
export const fetchFormData = async () => {
  try {
    const [statesRes, lgasRes, marketsRes, calibrationsRes, categoriesRes] = await Promise.all([
      api.get("/samples/states/all"),
      api.get("/samples/lgas/all"),
      api.get("/samples/markets/all"),
      api.get("/calibrations"),
      api.get("/products/categories"), // Assuming this endpoint exists
    ]);

    return {
      states: statesRes.data.data || [],
      allLgas: lgasRes.data.data || [],
      allMarkets: marketsRes.data.data || [],
      calibrations: calibrationsRes.data.data || [],
      categories: categoriesRes.data.data || Object.entries(productCategories).map(([key, value]) => ({
        id: key,
        name: value.name
      }))
    };
  } catch (error) {
    console.error("Error fetching form data:", error);
    // Fallback to local constants if API fails
    return {
      states: [],
      allLgas: [],
      allMarkets: [],
      calibrations: [],
      categories: Object.entries(productCategories).map(([key, value]) => ({
        id: key,
        name: value.name
      }))
    };
  }
};

// ===== FILTERING LOGIC =====

/**
 * Filter LGAs based on selected state
 */
export const filterLGAsByState = (stateId, allLgas) => {
  if (!stateId) return [];
  return allLgas.filter((lga) => lga.stateId === stateId);
};

/**
 * Filter markets based on selected LGA
 */
export const filterMarketsByLGA = (lgaId, allMarkets) => {
  if (!lgaId) return [];
  return allMarkets.filter((market) => market.lgaId === lgaId);
};

/**
 * Get product variants for selected category
 */
export const getVariantsForCategory = (categoryId) => {
  const category = productCategories[categoryId];
  if (!category) return [];
  return Object.entries(category.variants).map(([key, value]) => ({
    id: key,
    name: value
  }));
};

// ===== FORM CHANGE HANDLERS =====

/**
 * Handle state selection - reset dependent fields
 */
export const handleStateChange = (stateId, formData, setFormData) => {
  setFormData({
    ...formData,
    stateId,
    lgaId: "",
    marketId: "",
    marketName: ""
  });
};

/**
 * Handle LGA selection - reset dependent fields
 */
export const handleLGAChange = (lgaId, formData, setFormData) => {
  setFormData({
    ...formData,
    lgaId,
    marketId: "",
    marketName: ""
  });
};

/**
 * Handle market selection - support "OTHER" for manual entry
 */
export const handleMarketChange = (marketId, formData, setFormData) => {
  if (marketId === "OTHER") {
    setFormData({
      ...formData,
      marketId: "OTHER",
      marketName: ""
    });
  } else {
    setFormData({
      ...formData,
      marketId,
      marketName: ""
    });
  }
};

/**
 * Handle product category change - reset variant selection
 */
export const handleCategoryChange = (categoryId, formData, setFormData) => {
  setFormData({
    ...formData,
    productCategoryId: categoryId,
    productVariantId: ""
  });
};

/**
 * Handle vendor type change
 */
export const handleVendorTypeChange = (vendorType, formData, setFormData) => {
  if (vendorType === "OTHER") {
    setFormData({
      ...formData,
      vendorType,
      vendorTypeOther: ""
    });
  } else {
    setFormData({
      ...formData,
      vendorType,
      vendorTypeOther: ""
    });
  }
};

// ===== FILE HANDLING =====

/**
 * Handle file upload for photo fields
 */
export const handleFileUpload = (e, field, setFormData) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () =>
    setFormData((prev) => ({ ...prev, [field]: reader.result }));
  reader.readAsDataURL(file);
};

/**
 * Remove uploaded file
 */
export const removeFile = (field, setFormData, refInput) => {
  setFormData((prev) => ({ ...prev, [field]: null }));
  if (refInput?.current) {
    refInput.current.value = "";
  }
};

// ===== LOCATION HANDLING =====

/**
 * Get current geolocation using browser API
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({
          gpsLatitude: latitude.toFixed(6),
          gpsLongitude: longitude.toFixed(6),
          error: null
        });
      },
      (error) => {
        let errorMessage = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An error occurred while getting your location.";
        }
        reject(new Error(errorMessage));
      }
    );
  });
};

// ===== PAYLOAD CONSTRUCTION =====

/**
 * Build sample submission payload
 */
export const buildSamplePayload = (formData) => {
  return {
    stateId: formData.stateId,
    lgaId: formData.lgaId,
    marketId: formData.marketId === "OTHER" ? null : formData.marketId,
    marketName: formData.marketId === "OTHER" ? formData.marketName : null,
    vendorType: formData.vendorType,
    vendorTypeOther: formData.vendorTypeOther || null,
    productVariantId: formData.productVariantId,
    productName: formData.productName,
    sampleType: formData.sampleType,
    calibrationCurveId: formData.calibrationCurveId,
    price: parseFloat(formData.price),
    batchNumber: formData.batchNumber || null,
    brandName: formData.brandName || null,
    gpsLatitude: formData.gpsLatitude ? parseFloat(formData.gpsLatitude) : null,
    gpsLongitude: formData.gpsLongitude ? parseFloat(formData.gpsLongitude) : null,
    isRegistered: formData.isRegistered,
    productOrigin: formData.productOrigin,
    navdacNumber: formData.navdacNumber || null,
    sonNumber: formData.sonNumber || null,
    productPhotoUrl: formData.productPhotoUrl || null,
  };
};

// ===== VALIDATION =====

/**
 * Validate sample form data before submission
 */
export const validateSampleForm = (formData) => {
  const errors = {};

  if (!formData.stateId) errors.stateId = "State is required";
  if (!formData.lgaId) errors.lgaId = "LGA is required";
  if (!formData.marketId) errors.marketId = "Market is required";
  if (formData.marketId === "OTHER" && !formData.marketName) {
    errors.marketName = "Market name is required when selecting 'Other'";
  }
  if (!formData.productCategoryId) errors.productCategoryId = "Product category is required";
  if (!formData.productVariantId) errors.productVariantId = "Product variant is required";
  if (!formData.productName) errors.productName = "Product name is required";
  if (!formData.sampleType) errors.sampleType = "Sample type is required";
  if (!formData.calibrationCurveId) errors.calibrationCurveId = "Calibration curve is required";
  if (!formData.vendorType) errors.vendorType = "Vendor type is required";
  if (formData.vendorType === "OTHER" && !formData.vendorTypeOther) {
    errors.vendorTypeOther = "Vendor type specification is required";
  }
  if (!formData.price) errors.price = "Price is required";
  if (isNaN(parseFloat(formData.price))) errors.price = "Price must be a number";

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
