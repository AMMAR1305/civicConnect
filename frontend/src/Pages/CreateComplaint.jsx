import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateComplaint = ({ isModal = false, onClose = null, onSuccess = null }) => {
    const navigate = useNavigate();
    
    // Tamil Nadu Districts
    const districts = [
        "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli",
        "Tiruppur", "Ranipet", "Vellore", "Erode", "Thoothukkudi", "Dindigul",
        "Thanjavur", "Krishnagiri", "Kanchipuram", "Viluppuram", "Cuddalore",
        "Nagapattinam", "Tiruvannamalai", "Dharmapuri", "Namakkal", "Karur",
        "Pudukkottai", "Sivaganga", "Ramanathapuram", "Virudhunagar", "Theni",
        "Kanyakumari", "Nilgiris", "Perambalur", "Ariyalur", "Kallakurichi",
        "Chengalpattu", "Tenkasi", "Tirupattur", "Mayiladuthurai"
    ];
    
    // Indian States
    const states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ];
    
    // Municipal Complaint Titles
    const complaintTitles = [
        "Pothole on Road",
        "Broken Street Light",
        "Garbage Not Collected",
        "Blocked Drainage",
        "Water Supply Issue",
        "Sewage Overflow",
        "Stray Animals",
        "Illegal Construction",
        "Tree Trimming Required",
        "Public Toilet Maintenance",
        "Park Maintenance Issue",
        "Road Repair Needed",
        "Traffic Signal Not Working",
        "Footpath Damage",
        "Broken Water Pipeline",
        "Open Manhole",
        "Unauthorized Encroachment",
        "Noise Pollution",
        "Air Pollution Issue",
        "Bus Stop Maintenance",
        "Public Property Damage",
        "Illegal Parking",
        "Waterlogging Issue",
        "Mosquito Menace",
        "Public Urination Issue",
        "Illegal Dumping of Waste",
        "Cemetery Maintenance",
        "Community Hall Issue",
        "Sports Ground Maintenance",
        "Other Municipal Issue"
    ];
    
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Infrastructure",
        landmark: "",
        area: "",
        district: "",
        state: "",
        pincode: "",
        location: "",
        priority: "Medium",
        priorityReason: "",
        suggestedDepartment: ""
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPriorityReason, setShowPriorityReason] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // ESC key to close modal
    useEffect(() => {
        if (isModal) {
            const handleEsc = (e) => {
                if (e.key === 'Escape' && onClose) {
                    onClose();
                }
            };
            window.addEventListener('keydown', handleEsc);
            return () => window.removeEventListener('keydown', handleEsc);
        }
    }, [isModal, onClose]);

    // Validate if text looks like a real location (not gibberish)
    const validateLocation = (text, fieldName) => {
        if (!text || text.trim().length < 2) {
            return { valid: false, message: `${fieldName} is required` };
        }

        // Check for gibberish patterns
        const hasVowels = /[aeiouAEIOU]/.test(text);
        const hasConsonants = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/.test(text);
        const hasRepeatedChars = /(.)\1{3,}/.test(text); // 4+ same characters in a row
        const hasOnlySpecialChars = /^[^a-zA-Z0-9\s]+$/.test(text);
        const tooManyConsonants = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{7,}/.test(text);
        
        // Check if it's likely gibberish
        if (!hasVowels || !hasConsonants) {
            return { valid: false, message: `${fieldName} doesn't look like a real place name` };
        }
        
        if (hasRepeatedChars) {
            return { valid: false, message: `${fieldName} has too many repeated characters` };
        }
        
        if (hasOnlySpecialChars) {
            return { valid: false, message: `${fieldName} must contain letters` };
        }
        
        if (tooManyConsonants) {
            return { valid: false, message: `${fieldName} doesn't look like a valid location` };
        }

        // Check for minimum meaningful length
        const words = text.trim().split(/\s+/);
        const hasShortWords = words.some(word => word.length >= 3);
        
        if (!hasShortWords) {
            return { valid: false, message: `${fieldName} seems too short or invalid` };
        }

        return { valid: true, message: '' };
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        
        setFormData({
            ...formData,
            [name]: value
        });

        // Real-time validation for location fields (only landmark and area need validation now)
        if (['landmark', 'area'].includes(name)) {
            const validation = validateLocation(value, name.charAt(0).toUpperCase() + name.slice(1));
            
            setValidationErrors(prev => ({
                ...prev,
                [name]: validation.valid ? '' : validation.message
            }));
        }
        
        // Clear validation errors for district and state when selected from dropdown
        if (['district', 'state'].includes(name)) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Validate pincode
        if (name === 'pincode') {
            if (value && !/^\d{6}$/.test(value)) {
                setValidationErrors(prev => ({
                    ...prev,
                    pincode: 'Pincode must be exactly 6 digits'
                }));
            } else {
                setValidationErrors(prev => ({
                    ...prev,
                    pincode: ''
                }));
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Show priority reason field only for High and Critical
        if (name === "priority") {
            setShowPriorityReason(value === "High" || value === "Critical");
            // Clear priority reason if switching to Low/Medium
            if (value !== "High" && value !== "Critical") {
                setFormData({
                    ...formData,
                    [name]: value,
                    priorityReason: ""
                });
                return;
            }
        }
        
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const capturePhoto = async () => {
        // Check if on mobile - use input capture
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Mobile: Open camera directly
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';
            input.onchange = (e) => handlePhotoChange(e);
            input.click();
        } else {
            // Desktop: Try to use webcam with getUserMedia
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                
                // Create video element to show camera feed
                const video = document.createElement('video');
                video.srcObject = stream;
                video.autoplay = true;
                video.style.position = 'fixed';
                video.style.top = '50%';
                video.style.left = '50%';
                video.style.transform = 'translate(-50%, -50%)';
                video.style.zIndex = '9999';
                video.style.maxWidth = '90vw';
                video.style.maxHeight = '90vh';
                video.style.backgroundColor = '#000';
                
                // Create capture button
                const captureBtn = document.createElement('button');
                captureBtn.textContent = '📸 Take Photo';
                captureBtn.style.position = 'fixed';
                captureBtn.style.bottom = '20px';
                captureBtn.style.left = '50%';
                captureBtn.style.transform = 'translateX(-50%)';
                captureBtn.style.zIndex = '10000';
                captureBtn.style.padding = '15px 30px';
                captureBtn.style.fontSize = '18px';
                captureBtn.style.backgroundColor = '#3b82f6';
                captureBtn.style.color = 'white';
                captureBtn.style.border = 'none';
                captureBtn.style.borderRadius = '8px';
                captureBtn.style.cursor = 'pointer';
                
                // Create close button
                const closeBtn = document.createElement('button');
                closeBtn.textContent = '✖ Close';
                closeBtn.style.position = 'fixed';
                closeBtn.style.top = '20px';
                closeBtn.style.right = '20px';
                closeBtn.style.zIndex = '10000';
                closeBtn.style.padding = '10px 20px';
                closeBtn.style.backgroundColor = '#ef4444';
                closeBtn.style.color = 'white';
                closeBtn.style.border = 'none';
                closeBtn.style.borderRadius = '8px';
                closeBtn.style.cursor = 'pointer';
                
                document.body.appendChild(video);
                document.body.appendChild(captureBtn);
                document.body.appendChild(closeBtn);
                
                const cleanup = () => {
                    stream.getTracks().forEach(track => track.stop());
                    document.body.removeChild(video);
                    document.body.removeChild(captureBtn);
                    document.body.removeChild(closeBtn);
                };
                
                captureBtn.onclick = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0);
                    
                    canvas.toBlob((blob) => {
                        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
                        setPhotoFile(file);
                        setPhotoPreview(canvas.toDataURL('image/jpeg'));
                        cleanup();
                    }, 'image/jpeg', 0.8);
                };
                
                closeBtn.onclick = cleanup;
                
            } catch (err) {
                console.error('Camera access error:', err);
                alert('Camera access denied or not available. Opening file picker instead.');
                // Fallback to file picker
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => handlePhotoChange(e);
                input.click();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validate location fields before submission
        const landmarkValidation = validateLocation(formData.landmark, 'Landmark');
        const areaValidation = validateLocation(formData.area, 'Area');
        
        const errors = {};
        if (!landmarkValidation.valid) errors.landmark = landmarkValidation.message;
        if (!areaValidation.valid) errors.area = areaValidation.message;
        
        // Check if district and state are selected from dropdown
        if (!formData.district) errors.district = 'Please select a district';
        if (!formData.state) errors.state = 'Please select a state';
        
        if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
            errors.pincode = 'Pincode must be exactly 6 digits';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setError("Please enter valid location details. Avoid gibberish or fake names.");
            setLoading(false);
            
            // Show alert to user
            alert("⚠️ Invalid Location Details!\n\nPlease enter real location names:\n" + 
                  Object.values(errors).join('\n'));
            return;
        }

        try {
            const token = localStorage.getItem("token");
            
            // Create FormData for multipart upload
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('landmark', formData.landmark);
            formDataToSend.append('area', formData.area);
            formDataToSend.append('district', formData.district);
            formDataToSend.append('state', formData.state);
            formDataToSend.append('pincode', formData.pincode);
            formDataToSend.append('location', `${formData.landmark}, ${formData.area}`);
            formDataToSend.append('address', `${formData.landmark}, ${formData.area}, ${formData.district}, ${formData.state} - ${formData.pincode}`);
            formDataToSend.append('priority', formData.priority);
            
            // Add priority reason if applicable
            if (formData.priorityReason) {
                formDataToSend.append('priorityReason', formData.priorityReason);
            }
            
            // Add suggested department if provided
            if (formData.suggestedDepartment) {
                formDataToSend.append('suggestedDepartment', formData.suggestedDepartment);
            }
            
            // Add photo file if exists
            if (photoFile) {
                formDataToSend.append('photo', photoFile);
            }

            await axios.post("http://localhost:4000/complaints/createcomplaint", formDataToSend, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert("Complaint created successfully!");
            
            // Reset form
            setFormData({
                title: "",
                description: "",
                category: "Infrastructure",
                landmark: "",
                area: "",
                district: "",
                state: "",
                pincode: "",
                location: "",
                priority: "Medium",
                priorityReason: "",
                suggestedDepartment: ""
            });
            setPhotoPreview(null);
            setPhotoFile(null);
            
            if (isModal && onSuccess) {
                onSuccess();
            } else {
                navigate("/citizen");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create complaint");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={isModal ? "bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto" : "min-h-screen bg-slate-100 p-4 sm:p-6 md:p-8"}>
            <div className={isModal ? "" : "max-w-3xl mx-auto"}>

                {/* Header */}
                <div className={`${isModal ? 'sticky top-0 bg-white z-10 border-b p-4 sm:p-6' : 'mb-4 sm:mb-6'}`}>
                    {!isModal && (
                        <button
                            onClick={() => navigate("/citizen")}
                            className="text-indigo-600 hover:underline mb-3 sm:mb-4 text-sm sm:text-base"
                        >
                            ← Back to Dashboard
                        </button>
                    )}
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                                Create New Complaint
                            </h1>
                            <p className="text-slate-500 mt-1 text-sm sm:text-base">
                                Submit a service request or issue
                            </p>
                        </div>
                        {isModal && onClose && (
                            <button
                                onClick={onClose}
                                className="ml-4 text-gray-400 hover:text-gray-600 text-3xl leading-none"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* Form */}
                <div className={isModal ? "p-4 sm:p-6" : "bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-md"}>
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm sm:text-base">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="mb-4">
                            <label className="block text-slate-700 font-semibold mb-2 text-sm sm:text-base">
                                Complaint Type *
                            </label>
                            <select
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                            >
                                <option value="">-- Select Complaint Type --</option>
                                {complaintTitles.map(title => (
                                    <option key={title} value={title}>{title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-slate-700 font-semibold mb-2 text-sm sm:text-base">
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                            >
                                <option>Infrastructure</option>
                                <option>Sanitation</option>
                                <option>Water Supply</option>
                                <option>Electricity</option>
                                <option>Roads</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-slate-700 font-semibold mb-2 text-sm sm:text-base">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>

                        {/* Show reason field only for High/Critical priority */}
                        {showPriorityReason && (
                            <div className="mb-4 p-3 sm:p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                                <label className="block text-orange-900 font-semibold mb-2 text-sm sm:text-base">
                                    Why do you think this is {formData.priority} priority? *
                                </label>
                                <textarea
                                    name="priorityReason"
                                    value={formData.priorityReason}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full px-3 sm:px-4 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                                    placeholder="Please explain why this complaint requires urgent attention..."
                                />
                                <p className="text-xs text-orange-700 mt-1">
                                    This helps officers understand the urgency and prioritize accordingly.
                                </p>
                            </div>
                        )}

                        {/* Location Details Section */}
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-md">
                            <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-2 sm:mb-3 flex items-center gap-2">
                                📍 Location Details - Enter Original Names Only
                            </h3>
                            <p className="text-xs sm:text-sm text-blue-700 mb-3 sm:mb-4 bg-blue-100 p-2 rounded border border-blue-200">
                                ⚠️ Please enter real, accurate location information. Fake or gibberish names will not be accepted.
                            </p>
                            
                            <div className="space-y-3 sm:space-y-4">
                                {/* Landmark */}
                                <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-300 shadow-sm">
                                    <label className="block text-slate-700 font-bold mb-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                                        <span>🏛️ Landmark *</span>
                                        <span className="text-xs text-gray-500 font-normal">(e.g., Near City Hall, Bus Stand)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="landmark"
                                        value={formData.landmark}
                                        onChange={handleLocationChange}
                                        required
                                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                                            validationErrors.landmark ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter a real landmark name"
                                    />
                                    {validationErrors.landmark && (
                                        <p className="text-red-600 text-sm mt-2 font-semibold flex items-center gap-1">
                                            ❌ {validationErrors.landmark}
                                        </p>
                                    )}
                                </div>

                                {/* Area */}
                                <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-300 shadow-sm">
                                    <label className="block text-slate-700 font-bold mb-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                                        <span>🏘️ Area/Locality *</span>
                                        <span className="text-xs text-gray-500 font-normal">(e.g., Anna Nagar, MG Road)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleLocationChange}
                                        required
                                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                                            validationErrors.area ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter a real area name"
                                    />
                                    {validationErrors.area && (
                                        <p className="text-red-600 text-sm mt-2 font-semibold flex items-center gap-1">
                                            ❌ {validationErrors.area}
                                        </p>
                                    )}
                                </div>

                                {/* District */}
                                <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-300 shadow-sm">
                                    <label className="block text-slate-700 font-bold mb-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                                        <span>🏙️ District *</span>
                                        <span className="text-xs text-gray-500 font-normal">(Select from list)</span>
                                    </label>
                                    <select
                                        name="district"
                                        value={formData.district}
                                        onChange={handleLocationChange}
                                        required
                                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                                            validationErrors.district ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">-- Select District --</option>
                                        {districts.map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                    {validationErrors.district && (
                                        <p className="text-red-600 text-sm mt-2 font-semibold flex items-center gap-1">
                                            ❌ {validationErrors.district}
                                        </p>
                                    )}
                                </div>

                                {/* State */}
                                <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-300 shadow-sm">
                                    <label className="block text-slate-700 font-bold mb-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                                        <span>🗺️ State *</span>
                                        <span className="text-xs text-gray-500 font-normal">(Select from list)</span>
                                    </label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleLocationChange}
                                        required
                                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                                            validationErrors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">-- Select State --</option>
                                        {states.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                    {validationErrors.state && (
                                        <p className="text-red-600 text-sm mt-2 font-semibold flex items-center gap-1">
                                            ❌ {validationErrors.state}
                                        </p>
                                    )}
                                </div>

                                {/* Pincode */}
                                <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-300 shadow-sm">
                                    <label className="block text-slate-700 font-bold mb-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                                        <span>📮 Pincode *</span>
                                        <span className="text-xs text-gray-500 font-normal">(6 digits only)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleLocationChange}
                                        required
                                        pattern="[0-9]{6}"
                                        maxLength="6"
                                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                                            validationErrors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="e.g., 600001"
                                    />
                                    {validationErrors.pincode && (
                                        <p className="text-red-600 text-sm mt-2 font-semibold flex items-center gap-1">
                                            ❌ {validationErrors.pincode}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-slate-700 font-semibold mb-2 text-sm sm:text-base">
                                Upload Photo (Optional)
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="flex-1 bg-blue-500 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-600 text-sm sm:text-base"
                                >
                                    📷 Capture Photo
                                </button>
                                <label className="flex-1 bg-slate-500 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-slate-600 text-center cursor-pointer text-sm sm:text-base">
                                    📁 Choose File
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            {photoPreview && (
                                <div className="mt-2">
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPhotoPreview(null);
                                            setPhotoFile(null);
                                        }}
                                        className="mt-2 text-red-600 text-sm hover:underline"
                                    >
                                        Remove Photo
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-slate-700 font-semibold mb-2 text-sm sm:text-base">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="5"
                                className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                                placeholder="Detailed description of the complaint"
                            />
                        </div>

                        {/* Optional: Suggested Department/Officer */}
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <label className="block text-blue-900 font-semibold mb-2 text-sm sm:text-base">
                                Who should take action? (Optional)
                            </label>
                            <input
                                type="text"
                                name="suggestedDepartment"
                                value={formData.suggestedDepartment}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                placeholder="e.g., Public Works Department, Water Board, Electricity Department..."
                            />
                            <p className="text-xs text-blue-700 mt-1">
                                Suggest which department or officer should handle this complaint. This helps route your complaint faster.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-400 text-sm sm:text-base"
                        >
                            {loading ? "Submitting..." : "Submit Complaint"}
                        </button>

                    </form>
                </div>

            </div>
        </div>
    );
};

export default CreateComplaint;
