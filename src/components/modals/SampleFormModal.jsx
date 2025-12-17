import { X, Camera, Trash2, Loader, MapPin } from "lucide-react";
import { productCategories, vendorTypes, sampleTypes } from "../../utils/constants";
import { useRef, useState, useEffect } from "react";
import {
  getInitialSampleFormState,
  fetchFormData,
  filterLGAsByState,
  filterMarketsByLGA,
  getVariantsForCategory,
  handleStateChange,
  handleLGAChange,
  handleMarketChange,
  handleCategoryChange,
  handleVendorTypeChange,
  handleFileUpload,
  removeFile,
  getCurrentLocation,
  buildSamplePayload,
  validateSampleForm,
} from "../../utils/formHelpers";

const SampleFormModal = ({ theme, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(getInitialSampleFormState());

  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [variants, setVariants] = useState([]);
  const [calibrations, setCalibrationsState] = useState([]);
  const [allLgas, setAllLgas] = useState([]);
  const [allMarkets, setAllMarkets] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const productPhotoRef = useRef(null);

  // Initialize form data
  useEffect(() => {
    const initFormData = async () => {
      setLoadingData(true);
      try {
        const data = await fetchFormData();
        setStates(data.states);
        setAllLgas(data.allLgas);
        setAllMarkets(data.allMarkets);
        setCalibrationsState(data.calibrations);
      } catch (err) {
        console.error("Error fetching form data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    initFormData();
  }, []);

  // Handle state change
  useEffect(() => {
    if (formData.stateId) {
      const filtered = filterLGAsByState(formData.stateId, allLgas);
      setLgas(filtered);
    } else {
      setLgas([]);
      setMarkets([]);
    }
  }, [formData.stateId, allLgas]);

  // Handle LGA change
  useEffect(() => {
    if (formData.lgaId) {
      const filtered = filterMarketsByLGA(formData.lgaId, allMarkets);
      setMarkets(filtered);
    } else {
      setMarkets([]);
    }
  }, [formData.lgaId, allMarkets]);

  // Handle category change
  useEffect(() => {
    if (formData.productCategoryId) {
      const filteredVariants = getVariantsForCategory(formData.productCategoryId);
      setVariants(filteredVariants);
    } else {
      setVariants([]);
    }
  }, [formData.productCategoryId]);

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    setLocationError(null);
    try {
      const location = await getCurrentLocation();
      setFormData((prev) => ({
        ...prev,
        gpsLatitude: location.gpsLatitude,
        gpsLongitude: location.gpsLongitude,
      }));
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validation = validateSampleForm(formData);
    if (!validation.valid) {
      setError(Object.values(validation.errors).join(", "));
      setLoading(false);
      return;
    }

    try {
      const payload = buildSamplePayload(formData);
      await onSubmit(payload);
      alert("Sample created successfully!");
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create sample";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[5000]'>
      <div
        className={`${theme.card} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col border ${theme.border} mx-auto sm:mx-2`}
      >
        <div
          className={`p-4 sm:p-6 border-b ${theme.border} sticky top-0 z-20 ${theme.card}`}
        >
          <div className='flex items-center justify-between flex-wrap gap-2'>
            <h2 className='text-xl sm:text-2xl font-bold text-center sm:text-left w-full sm:w-auto'>
              New Sample Entry
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${theme.hover}`}
            >
              <X className='w-6 h-6' />
            </button>
          </div>
        </div>

        {loadingData && (
          <div className='flex items-center justify-center p-12'>
            <Loader className='animate-spin mr-2' />
            <span>Loading form data...</span>
          </div>
        )}

        {!loadingData && (
          <form
            onSubmit={handleSubmit}
            className='flex-1 overflow-y-auto p-6 space-y-6'
          >
            <section>
              <h3 className='text-lg font-semibold mb-4 text-emerald-500'>
                Location Details
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    State *
                  </label>
                  <select
                    required
                    value={formData.stateId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stateId: e.target.value,
                        lgaId: "",
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  >
                    <option value=''>Select State</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    LGA *
                  </label>
                  <select
                    required
                    value={formData.lgaId}
                    onChange={(e) =>
                      setFormData({ ...formData, lgaId: e.target.value })
                    }
                    disabled={!formData.stateId}
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50`}
                  >
                    <option value=''>Select LGA</option>
                    {lgas.map((lga) => (
                      <option key={lga.id} value={lga.id}>
                        {lga.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Market *
                  </label>
                  <select
                    required
                    value={formData.marketId}
                    onChange={(e) =>
                      setFormData({ ...formData, marketId: e.target.value })
                    }
                    disabled={!formData.lgaId}
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50`}
                  >
                    <option value=''>Select Market</option>
                    {markets.map((market) => (
                      <option key={market.id} value={market.id}>
                        {market.name}
                      </option>
                    ))}
                    <option value='OTHER'>Other (Manual Entry)</option>
                  </select>
                </div>

                {formData.marketId === "OTHER" && (
                  <div className='md:col-span-1 animate-in fade-in'>
                    <label
                      className={`block text-sm font-medium mb-2 ${theme.text}`}
                    >
                      Market Name *
                    </label>
                    <input
                      type='text'
                      required={formData.marketId === "OTHER"}
                      value={formData.marketName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          marketName: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                      placeholder='e.g., Local Market, Community Center'
                    />
                  </div>
                )}

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Vendor Type *
                  </label>
                  <select
                    required
                    value={formData.vendorType}
                    onChange={(e) => {
                      handleVendorTypeChange(e.target.value, formData, setFormData);
                    }}
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  >
                    <option value=''>Select Vendor Type</option>
                    {vendorTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.vendorType === "OTHER" && (
                  <div className='md:col-span-1 animate-in fade-in'>
                    <label
                      className={`block text-sm font-medium mb-2 ${theme.text}`}
                    >
                      Specify Vendor Type *
                    </label>
                    <input
                      type='text'
                      required={formData.vendorType === "OTHER"}
                      value={formData.vendorTypeOther}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vendorTypeOther: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                      placeholder='e.g., Online Store, Wholesale Distributor'
                    />
                  </div>
                )}

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    GPS Latitude
                  </label>
                  <input
                    type='number'
                    step='any'
                    value={formData.gpsLatitude}
                    onChange={(e) =>
                      setFormData({ ...formData, gpsLatitude: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                    placeholder='e.g., 8.4799'
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    GPS Longitude
                  </label>
                  <input
                    type='number'
                    step='any'
                    value={formData.gpsLongitude}
                    onChange={(e) =>
                      setFormData({ ...formData, gpsLongitude: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                    placeholder='e.g., 4.5418'
                  />
                </div>

                <div className='md:col-span-2'>
                  <button
                    type='button'
                    onClick={handleGetCurrentLocation}
                    disabled={gettingLocation}
                    className={`w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                      gettingLocation
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    <MapPin className='w-5 h-5' />
                    {gettingLocation
                      ? "Getting Location..."
                      : "Get Current Location"}
                  </button>
                  {locationError && (
                    <p className='text-red-500 text-sm mt-2'>{locationError}</p>
                  )}
                  {formData.gpsLatitude && formData.gpsLongitude && (
                    <p className='text-green-600 text-sm mt-2'>
                      ✓ Location captured: ({formData.gpsLatitude},{" "}
                      {formData.gpsLongitude})
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className='text-lg font-semibold mb-4 text-emerald-500'>
                Product Details
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Product Category *
                  </label>
                  <select
                    required
                    value={formData.productCategoryId}
                    onChange={(e) =>
                      handleCategoryChange(e.target.value, formData, setFormData)
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  >
                    <option value=''>Select Product Category</option>
                    {Object.entries(productCategories).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Product Variant *
                  </label>
                  <select
                    required
                    disabled={!formData.productCategoryId}
                    value={formData.productVariantId}
                    onChange={(e) =>
                      setFormData({ ...formData, productVariantId: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50`}
                  >
                    <option value=''>Select Product Variant</option>
                    {variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Sample Type *
                  </label>
                  <select
                    required
                    value={formData.sampleType}
                    onChange={(e) =>
                      setFormData({ ...formData, sampleType: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  >
                    <option value='SOLID'>Solid (mg/kg)</option>
                    <option value='LIQUID'>Liquid (mg/L)</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Product Name *
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                    placeholder='e.g., Tiró Kohl'
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Calibration Curve *
                  </label>
                  <select
                    required
                    value={formData.calibrationCurveId}
                    onChange={(e) =>
                      setFormData({ ...formData, calibrationCurveId: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  >
                    <option value=''>Select Calibration Curve</option>
                    {calibrations.map((calib) => (
                      <option key={calib.id} value={calib.id}>
                        {calib.fileName} ({calib.calibrationDate?.split('T')[0] || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Brand Name
                  </label>
                  <input
                    type='text'
                    value={formData.brandName}
                    onChange={(e) =>
                      setFormData({ ...formData, brandName: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                    placeholder='e.g., BeautyGlow or N/A'
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Batch Number
                  </label>
                  <input
                    type='text'
                    value={formData.batchNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, batchNumber: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                    placeholder='e.g., BT2025001'
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Price (₦) *
                  </label>
                  <input
                    type='number'
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                    placeholder='e.g., 500'
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Product Origin *
                  </label>
                  <select
                    required
                    value={formData.productOrigin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productOrigin: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  >
                    <option value='LOCAL'>Local</option>
                    <option value='IMPORTED'>Imported</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    NAFDAC Number
                  </label>
                  <input
                    type='text'
                    value={formData.navdacNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, navdacNumber: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                    placeholder='e.g., A7-0001-2023'
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    SON Number
                  </label>
                  <input
                    type='text'
                    value={formData.sonNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, sonNumber: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                    placeholder='e.g., SON/CL/2023-0001'
                  />
                </div>

                <div className='flex items-center mt-2'>
                  <input
                    type='checkbox'
                    id='registered'
                    checked={formData.isRegistered}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isRegistered: e.target.checked,
                      })
                    }
                    className='w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500'
                  />
                  <label
                    htmlFor='registered'
                    className={`ml-2 text-sm font-medium ${theme.text}`}
                  >
                    Registered Product (NAFDAC/SON)
                  </label>
                </div>
              </div>
            </section>

            <section>
              <h3 className='text-lg font-semibold mb-4 text-emerald-500'>
                Documentation
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <PhotoUpload
                  label='Product Photo'
                  photo={formData.productPhoto}
                  refInput={productPhotoRef}
                  onUpload={(e) => handleFileUpload(e, "productPhoto")}
                  onRemove={() => removePhoto("productPhoto")}
                  theme={theme}
                />
              </div>
            </section>

            <div className='flex gap-4 pt-4'>
              <button
                type='button'
                onClick={onClose}
                className={`flex-1 px-6 py-3 border ${theme.border} rounded-lg font-medium ${theme.hover}`}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading}
                className={`flex-1 px-6 py-3 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600"
                } text-white rounded-lg font-medium transition-colors`}
              >
                {loading ? "Saving..." : "Save Sample"}
              </button>
            </div>

            {error && (
              <p className='text-red-500 text-sm text-center mt-2'>
                {error?.toString()}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

const PhotoUpload = ({ label, photo, refInput, onUpload, onRemove, theme }) => {
  const [previewError, setPreviewError] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      e.target.value = "";
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

    onUpload(e);
    setPreviewError(false);
  };

  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
        {label}
      </label>
      {photo ? (
        <div className='relative group'>
          <img
            src={photo}
            alt={label}
            className='w-full h-48 object-cover rounded-lg shadow-md'
            onError={() => setPreviewError(true)}
          />
          {previewError && (
            <div className='absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center'>
              <p className='text-red-400 text-sm'>Image preview error</p>
            </div>
          )}
          <button
            type='button'
            onClick={onRemove}
            className='absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100'
            title='Remove image'
          >
            <Trash2 className='w-4 h-4' />
          </button>
          <div className='absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
            <span className='text-white text-sm font-medium'>
              Click X to remove
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => refInput.current?.click()}
          className={`border-2 border-dashed ${theme.border} rounded-lg p-8 text-center ${theme.hover} cursor-pointer transition-all hover:border-emerald-500`}
        >
          <Camera className={`w-12 h-12 mx-auto mb-2 ${theme.textMuted}`} />
          <p className={`text-sm font-medium ${theme.text}`}>
            Click to upload image
          </p>
          <p className={`text-xs ${theme.textMuted} mt-1`}>
            JPG, PNG up to 5MB
          </p>
        </div>
      )}
      <input
        ref={refInput}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleUpload}
      />
    </div>
  );
};

export default SampleFormModal;
