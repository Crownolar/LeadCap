import api from "./api";
import { productCategories } from "./constants";

export const getInitialSampleFormState = () => ({
  stateId: "",
  lgaId: "",
  marketId: "",
  marketName: "",
  marketType: "FORMAL",
  productCategoryId: "",
  productVariantId: "",

  productName: "",
  brandName: "",
  batchNumber: "",
  manufacturerName: "",

  vendorType: "",
  vendorTypeOther: "",
  notes: "",
  price: "",
  productOrigin: "LOCAL",
  brandLetter: "",

  gpsLatitude: "",
  gpsLongitude: "",

  isRegistered: false,
  nafdacNumber: "",
  sonNumber: "",

  productPhoto: null,
  calibrationCurveFile: null,
});

/**
 * Map API sample object to form state for edit mode
 */
export const sampleToFormState = (sample) => {
  if (!sample) return getInitialSampleFormState();
  const marketId = sample.marketId || (sample.marketName ? "OTHER" : "");
  return {
    stateId: sample.stateId || "",
    lgaId: sample.lgaId || "",
    marketId: marketId,
    marketName: sample.marketName || "",
    marketType: sample.marketType || "FORMAL",
    sampleType: sample.sampleType || "SOLID",
    productCategoryId:
      sample.productVariant?.category?.id ||
      sample.productVariant?.categoryId ||
      "",
    productVariantId:
      sample.productVariantId || sample.productVariant?.id || "",

    productName: sample.productName || "",
    brandName: sample.brandName || "",
    batchNumber: sample.batchNumber || "",
    brand_letter: sample.brandLetter || "",

    manufacturerName: sample.manufacturerName || "",
    vendorType: sample.vendorType || "",
    vendorTypeOther: sample.vendorTypeOther || "",

    notes: sample.notes || "",
    price: sample.price != null ? String(sample.price) : "",
    gpsLatitude: sample.gpsLatitude != null ? String(sample.gpsLatitude) : "",
    gpsLongitude:
      sample.gpsLongitude != null ? String(sample.gpsLongitude) : "",
    productOrigin: sample.productOrigin || "LOCAL",
    nafdacNumber: sample.nafdacNumber || "",
    sonNumber: sample.sonNumber || "",
    calibrationCurveFile: null,
    isRegistered: Boolean(sample.isRegistered),
    productPhoto: sample.productPhotoUrl ? sample.productPhotoUrl : null,
  };
};

export const fetchFormData = async () => {
  try {
    const [statesRes, lgasRes, marketsRes, categoriesRes] = await Promise.all([
      api.get("/management/states", { params: { activeOnly: "true" } }),
      api.get("/management/lgas"),
      api.get("/management/markets"),
      api.get("/products/categories"),
    ]);

    console.log("States response:", statesRes.data);
    console.log("LGAs response:", lgasRes.data);
    console.log("Markets response:", marketsRes.data);
    console.log("Categories response:", categoriesRes.data);

    const states = statesRes.data?.data || statesRes.data || [];
    const allLgas = lgasRes.data?.data || lgasRes.data || [];
    const allMarkets = marketsRes.data?.data || marketsRes.data || [];
    const categories = categoriesRes.data?.data || categoriesRes.data || [];

    return {
      states: Array.isArray(states) ? states : [],
      allLgas: Array.isArray(allLgas) ? allLgas : [],
      allMarkets: Array.isArray(allMarkets) ? allMarkets : [],
      categories: Array.isArray(categories) ? categories : [],
    };
  } catch (error) {
    console.error("Error fetching form data:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config?.url,
    });
    throw new Error({
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config?.url,
    });
  }
};

export const fetchVariantsForCategory = async (categoryId) => {
  try {
    const response = await api.get(
      `/products/categories/${categoryId}/variants`,
    );
    const variants = response.data?.data || response.data || [];

    if (!Array.isArray(variants)) {
      console.warn("Variants response is not an array:", variants);
      return [];
    }

    return variants;
  } catch (error) {
    console.error("Error fetching variants:", {
      categoryId,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const filterLGAsByState = (stateId, allLgas) => {
  if (!stateId) return [];
  return allLgas.filter((lga) => lga.stateId === stateId);
};

export const filterMarketsByLGA = (lgaId, allMarkets) => {
  if (!lgaId) return [];
  return allMarkets.filter((market) => market.lgaId === lgaId);
};

export const getVariantsForCategory = (categoryId) => {
  const category = productCategories[categoryId];
  if (!category) return [];
  return Object.entries(category.variants).map(([key, value]) => ({
    id: key,
    name: value,
  }));
};

export const handleStateChange = (stateId, formData, setFormData) => {
  setFormData({
    ...formData,
    stateId,
    lgaId: "",
    marketId: "",
    marketName: "",
  });
};

export const handleLGAChange = (lgaId, formData, setFormData) => {
  setFormData({
    ...formData,
    lgaId,
    marketId: "",
    marketName: "",
  });
};

export const handleMarketChange = (marketId, formData, setFormData) => {
  if (marketId === "OTHER") {
    setFormData({
      ...formData,
      marketId: "OTHER",
      marketName: "",
    });
  } else {
    setFormData({
      ...formData,
      marketId,
      marketName: "",
    });
  }
};

export const handleCategoryChange = (categoryId, formData, setFormData) => {
  setFormData({
    ...formData,
    productCategoryId: categoryId,
    productVariantId: "",
  });
};

export const handleVendorTypeChange = (vendorType, formData, setFormData) => {
  if (vendorType === "OTHER") {
    setFormData({
      ...formData,
      vendorType,
      vendorTypeOther: "",
    });
  } else {
    setFormData({
      ...formData,
      vendorType,
      vendorTypeOther: "",
    });
  }
};

export const handleFileUpload = (e, field, setFormData) => {
  const file = e.target.files?.[0];
  console.log(file);
  if (!file) throw new Error("No file selected");

  const reader = new FileReader();
  if (field == "calibrationCurveFile") {
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          name: file.name,
          size: file.size,
          data: reader.result,
        },
      }));
    };
  } else {
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [field]: reader.result }));
    };
  }

  reader.readAsDataURL(file);
};

export const removeFile = (field, setFormData, refInput) => {
  setFormData((prev) => ({ ...prev, [field]: null }));
  if (refInput?.current) {
    refInput.current.value = "";
  }
};

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
          error: null,
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
      },
    );
  });
};

export const buildSamplePayload = (formData) => {
  return {
    stateId: formData.stateId,
    lgaId: formData.lgaId,
    marketId:
      formData.marketId === "OTHER"
        ? null
        : formData.marketId
          ? formData.marketId
          : null,
    marketName:
      formData.marketId === "OTHER" ? formData.marketName || null : null,

    vendorType: formData.vendorType,
    vendorTypeOther: formData.vendorTypeOther || null,

    productVariantId: formData.productVariantId,
    productName: formData.productName,

    price: formData.price ? parseFloat(formData.price) : null,
    batchNumber: formData.batchNumber || null,
    manufacturerName: formData.manufacturerName || "",

    brand_letter: formData.brandLetter || null,
    brandName: formData.brandName || null,

    gpsLatitude: formData.gpsLatitude ? parseFloat(formData.gpsLatitude) : null,
    gpsLongitude: formData.gpsLongitude
      ? parseFloat(formData.gpsLongitude)
      : null,
    notes: formData.notes || null,
    isRegistered: formData.isRegistered || false,
    productOrigin: formData.productOrigin || "LOCAL",
    nafdacNumber: formData.nafdacNumber || null,
    sonNumber: formData.sonNumber || null,

    productPhotoUrl: formData.productPhoto || null,
    calibrationCurveFile: formData.calibrationCurveFile?.data || null,
  };
};

export const buildFieldSampleId = (sample) => {
  const stateCode =
    sample?.state?.code || sample?.state?.name?.slice(0, 2)?.toUpperCase();
  const lgaCode =
    sample?.lga?.code || sample?.lga?.name?.slice(0, 2)?.toUpperCase();
  const productCode = sample?.productCode || "XX";
  const sampleNumber = sample?.sampleNumber || "00";

  if (!stateCode || !lgaCode) return "N/A";

  return `${stateCode}-${lgaCode}-${productCode}-${sampleNumber}`;
};

export const validateSampleForm = (formData) => {
  const errors = {};

  if (!formData.stateId) errors.stateId = "State is required";
  if (!formData.lgaId) errors.lgaId = "LGA is required";

  // if (!formData.marketId && !formData.marketName) {
  //   errors.marketId =
  //     "Either select a market from the list or enter a custom market name";
  // }
  // if (formData.marketId === "OTHER" && !formData.marketName) {
  //   errors.marketName = "Market name is required when selecting 'Other'";
  // }
  if (!formData.productCategoryId)
    errors.productCategoryId = "Product category is required";
  if (!formData.productVariantId)
    errors.productVariantId = "Product variant is required";
  if (!formData.productName) errors.productName = "Product name is required";
  if (!formData.vendorType) errors.vendorType = "Vendor type is required";
  // if (!formData.brandLetter) errors.brandLetter = "Brand letter is required";
  if (formData.vendorType === "OTHER" && !formData.vendorTypeOther) {
    errors.vendorTypeOther = "Vendor type specification is required";
  }
  // if (!formData.price) errors.price = "Price is required";
  // if (isNaN(parseFloat(formData.price)))
  //   errors.price = "Price must be a number";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
