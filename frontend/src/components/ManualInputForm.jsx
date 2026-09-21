import React, { useState } from "react";
import AnalysisResult from "./AnalysisResult";
import api from "../services/api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

// MOVE THIS OUTSIDE (fixes focus issue)
const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  colSpan = 1,
  value,
  onChange,
}) => (
  <div className={`${colSpan === 2 ? "sm:col-span-2" : ""}`}>
    <label className="block text-sm font-bold text-gray-600 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      step={type === "number" ? "any" : undefined}
      placeholder={placeholder}
      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-brand-500 transition-colors bg-white"
    />
  </div>
);

const ManualInputForm = () => {
  const [formData, setFormData] = useState({
    District_Name: "",
    Nitrogen: "",
    Phosphorus: "",
    Potassium: "",
    pH: "",
    Rainfall: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const parseNumber = (val) => {
    return val === "" ? null : parseFloat(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.District_Name) {
      toast.error("District name is required");
      return;
    }

    try {
      setLoading(true);
      const toastId = toast.loading("Analyzing soil data...");

      const res = await api.post(
        "/soil/analyze",
        {
          source: "manual",
          nutrients: JSON.stringify({
            District_Name: formData.District_Name,
            Nitrogen: parseNumber(formData.Nitrogen),
            Phosphorus: parseNumber(formData.Phosphorus),
            Potassium: parseNumber(formData.Potassium),
            pH: parseNumber(formData.pH),
            Rainfall: parseNumber(formData.Rainfall),
          }),
        },
      );

      toast.dismiss(toastId);

      if (res.data?.data) {
        toast.success("✅ Analysis Completed!");
        setResultData(res.data.data);
        setSubmitted(true);
      } else {
        toast.error("No response data from server.");
      }
    } catch (err) {
      toast.dismiss();
      console.error("Manual analysis error:", err);
      toast.error(
        err.response?.data?.message || "Failed to analyze soil data."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted)
    return <AnalysisResult data={resultData} inputValues={formData} />;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Manual Parameters
        </h3>
        <p className="text-gray-500 font-medium">
          Enter precise soil values for AI evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
        <InputField
          label="District Name"
          name="District_Name"
          placeholder="e.g. Nashik"
          colSpan={2}
          value={formData.District_Name}
          onChange={handleChange}
        />
        <InputField
          label="Nitrogen (ppm)"
          name="Nitrogen"
          type="number"
          placeholder="45"
          value={formData.Nitrogen}
          onChange={handleChange}
        />
        <InputField
          label="Phosphorus (ppm)"
          name="Phosphorus"
          type="number"
          placeholder="35"
          value={formData.Phosphorus}
          onChange={handleChange}
        />
        <InputField
          label="Potassium (ppm)"
          name="Potassium"
          type="number"
          placeholder="150"
          value={formData.Potassium}
          onChange={handleChange}
        />
        <InputField
          label="pH Level"
          name="pH"
          type="number"
          placeholder="6.8"
          value={formData.pH}
          onChange={handleChange}
        />
        <InputField
          label="Annual Rainfall (mm)"
          name="Rainfall"
          type="number"
          placeholder="120"
          colSpan={2}
          value={formData.Rainfall}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`mt-10 w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-extrabold text-white text-lg transition-all transform active:scale-[0.98]
          ${
            loading
              ? "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-brand-600 hover:bg-brand-700 shadow-xl shadow-brand-500/30 hover:-translate-y-1"
          }
        `}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={24} />
            Processing Data...
          </>
        ) : (
          "Run AI Analysis"
        )}
      </button>
    </form>
  );
};

export default ManualInputForm;