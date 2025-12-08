import { X, Camera, Trash2, Loader, MapPin } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createSample } from "../../redux/slice/samplesSlice";
import { productTypes, vendorTypes } from "../../utils/constants";
import { useRef, useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "/api";

const SampleFormModal = ({ theme, onClose, samples }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.samples);

  const [formData, setFormData] = useState({
    stateId: "",
    lgaId: "",
    productType: "",
    productName: "",
    brandName: "",
    batchNumber: "",
    price: "",
    marketId: "",
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

  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [allLgas, setAllLgas] = useState([]);
  const [allMarkets, setAllMarkets] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const productPhotoRef = useRef(null);

  // Fetch initial data (states and all LGAs/markets for filtering)
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const token = localStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        const [statesRes, lgasRes, marketsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/samples/states/all`, { headers }),
          axios.get(`${API_BASE_URL}/samples/lgas/all`, { headers }),
          axios.get(`${API_BASE_URL}/samples/markets/all`, { headers }),
        ]);

        setStates(statesRes.data.data || []);
        setAllLgas(lgasRes.data.data || []);
        setAllMarkets(marketsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Filter LGAs based on selected state
  useEffect(() => {
    if (formData.stateId) {
      const filteredLgas = allLgas.filter(
        (lga) => lga.stateId === formData.stateId
      );
      setLgas(filteredLgas);
      setFormData((prev) => ({ ...prev, lgaId: "", marketId: "" })); // Reset LGA and Market selection
    } else {
      setLgas([]);
      setMarkets([]);
    }
  }, [formData.stateId, allLgas]);

  // Filter Markets based on selected LGA
  useEffect(() => {
    if (formData.lgaId) {
      const filteredMarkets = allMarkets.filter(
        (market) => market.lgaId === formData.lgaId
      );
      setMarkets(filteredMarkets);
      setFormData((prev) => ({ ...prev, marketId: "" })); // Reset Market selection
    } else {
      setMarkets([]);
    }
  }, [formData.lgaId, allMarkets]);

  const handleGetCurrentLocation = () => {
    setGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          gpsLatitude: latitude.toFixed(6),
          gpsLongitude: longitude.toFixed(6),
        }));
        setGettingLocation(false);
        setLocationError(null);
      },
      (error) => {
        let errorMessage = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
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
        setLocationError(errorMessage);
        setGettingLocation(false);
      }
    );
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData((prev) => ({ ...prev, [field]: reader.result }));
    reader.readAsDataURL(file);
  };

  const removePhoto = (field) => {
    setFormData((prev) => ({ ...prev, [field]: null }));
    if (field === "productPhoto") productPhotoRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      stateId: formData.stateId,
      lgaId: formData.lgaId,
      marketId: formData.marketId || null,
      vendorType: formData.vendorType,
      vendorTypeOther: formData.vendorTypeOther || null,
      productType: formData.productType,
      productName: formData.productName,
      price: parseFloat(formData.price),
      batchNumber: formData.batchNumber || null,
      brandName: formData.brandName || null,
      gpsLatitude: formData.gpsLatitude
        ? parseFloat(formData.gpsLatitude)
        : null,
      gpsLongitude: formData.gpsLongitude
        ? parseFloat(formData.gpsLongitude)
        : null,
      isRegistered: formData.isRegistered,
      productOrigin: formData.productOrigin,
      navdacNumber: formData.navdacNumber || null,
      sonNumber: formData.sonNumber || null,
      productPhotoUrl: null,
    };

    const result = await dispatch(createSample(payload));

    if (createSample.fulfilled.match(result)) {
      alert("Sample created successfully!");
      onClose();
    } else {
      alert(`${result.payload || "Failed to create sample"}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        className={`${theme.card} rounded-lg shadow-xl max-w-4xl w-full my-8 border ${theme.border} mx-auto sm:mx-2`}
      >
        <div className={`p-4 sm:p-6 border-b ${theme.border}`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left w-full sm:w-auto">
              New Sample Entry
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${theme.hover}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loadingData && (
          <div className="flex items-center justify-center p-12">
            <Loader className="animate-spin mr-2" />
            <span>Loading form data...</span>
          </div>
        )}

        {!loadingData && (
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
          >
          <section>
            <h3 className="text-lg font-semibold mb-4 text-emerald-500">
              Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="">Select State</option>
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
                  <option value="">Select LGA</option>
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
                  <option value="">Select Market</option>
                  {markets.map((market) => (
                    <option key={market.id} value={market.id}>
                      {market.name}
                    </option>
                  ))}
                </select>
              </div>

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
                    setFormData({ 
                      ...formData, 
                      vendorType: e.target.value,
                      vendorTypeOther: e.target.value === "OTHER" ? formData.vendorTypeOther : ""
                    });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                >
                  <option value="">Select Vendor Type</option>
                  {vendorTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {formData.vendorType === "OTHER" && (
                <div className="md:col-span-1 animate-in fade-in">
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Specify Vendor Type *
                  </label>
                  <input
                    type="text"
                    required={formData.vendorType === "OTHER"}
                    value={formData.vendorTypeOther}
                    onChange={(e) =>
                      setFormData({ ...formData, vendorTypeOther: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                    placeholder="e.g., Online Store, Wholesale Distributor"
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
                  type="number"
                  step="any"
                  value={formData.gpsLatitude}
                  onChange={(e) =>
                    setFormData({ ...formData, gpsLatitude: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  placeholder="e.g., 8.4799"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  GPS Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.gpsLongitude}
                  onChange={(e) =>
                    setFormData({ ...formData, gpsLongitude: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  placeholder="e.g., 4.5418"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={gettingLocation}
                  className={`w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                    gettingLocation
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  {gettingLocation ? "Getting Location..." : "Get Current Location"}
                </button>
                {locationError && (
                  <p className="text-red-500 text-sm mt-2">{locationError}</p>
                )}
                {formData.gpsLatitude && formData.gpsLongitude && (
                  <p className="text-green-600 text-sm mt-2">
                    ✓ Location captured: ({formData.gpsLatitude}, {formData.gpsLongitude})
                  </p>
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4 text-emerald-500">
              Product Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Product Type *
                </label>
                <select
                  required
                  value={formData.productType}
                  onChange={(e) =>
                    setFormData({ ...formData, productType: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                >
                  <option value="">Select Product Type</option>
                  {Object.entries(productTypes).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  placeholder="e.g., Tiró Kohl"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) =>
                    setFormData({ ...formData, brandName: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  placeholder="e.g., BeautyGlow or N/A"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Batch Number
                </label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, batchNumber: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  placeholder="e.g., BT2025001"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Price (₦) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  placeholder="e.g., 500"
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
                    setFormData({ ...formData, productOrigin: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                >
                  <option value="LOCAL">Local</option>
                  <option value="IMPORTED">Imported</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  NAFDAC Number
                </label>
                <input
                  type="text"
                  value={formData.navdacNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, navdacNumber: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  placeholder="e.g., A7-0001-2023"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  SON Number
                </label>
                <input
                  type="text"
                  value={formData.sonNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, sonNumber: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                  placeholder="e.g., SON/CL/2023-0001"
                />
              </div>

              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="registered"
                  checked={formData.isRegistered}
                  onChange={(e) =>
                    setFormData({ ...formData, isRegistered: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                />
                <label
                  htmlFor="registered"
                  className={`ml-2 text-sm font-medium ${theme.text}`}
                >
                  Registered Product (NAFDAC/SON)
                </label>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4 text-emerald-500">
              Documentation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PhotoUpload
                label="Product Photo"
                photo={formData.productPhoto}
                refInput={productPhotoRef}
                onUpload={(e) => handleFileUpload(e, "productPhoto")}
                onRemove={() => removePhoto("productPhoto")}
                theme={theme}
              />
            </div>
          </section>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 border ${theme.border} rounded-lg font-medium ${theme.hover}`}
            >
              Cancel
            </button>
            <button
              type="submit"
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
            <p className="text-red-500 text-sm text-center mt-2">
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
        <div className="relative group">
          <img
            src={photo}
            alt={label}
            className="w-full h-48 object-cover rounded-lg shadow-md"
            onError={() => setPreviewError(true)}
          />
          {previewError && (
            <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
              <p className="text-red-400 text-sm">Image preview error</p>
            </div>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
            title="Remove image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-medium">Click X to remove</span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => refInput.current?.click()}
          className={`border-2 border-dashed ${theme.border} rounded-lg p-8 text-center ${theme.hover} cursor-pointer transition-all hover:border-emerald-500`}
        >
          <Camera className={`w-12 h-12 mx-auto mb-2 ${theme.textMuted}`} />
          <p className={`text-sm font-medium ${theme.text}`}>Click to upload image</p>
          <p className={`text-xs ${theme.textMuted} mt-1`}>JPG, PNG up to 5MB</p>
        </div>
      )}
      <input
        ref={refInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
};

export default SampleFormModal;
