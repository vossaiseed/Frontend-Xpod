import { Plus, Trash2 } from "lucide-react";

const LANGUAGES = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Gujarati",
  "Punjabi",
];

const PROFICIENCY = [
  "Basic",
  "Intermediate",
  "Advanced",
  "Native",
];

const LanguageSelector = ({ value = [], onChange }) => {
  const addLanguage = () => {
    onChange([
      ...value,
      {
        language: "",
        proficiency: "Basic",
      },
    ]);
  };

  const updateLanguage = (index, field, newValue) => {
    const updated = [...value];
    updated[index][field] = newValue;
    onChange(updated);
  };

  const removeLanguage = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Languages & Proficiency
      </label>

      {value.map((item, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-xl border p-3 md:flex-row border-[#fde68a]"
        >
          <select
            value={item.language}
            onChange={(e) =>
              updateLanguage(index, "language", e.target.value)
            }
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Select Language</option>

            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <select
            value={item.proficiency}
            onChange={(e) =>
              updateLanguage(index, "proficiency", e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:w-48"
          >
            {PROFICIENCY.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => removeLanguage(index)}
            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addLanguage}
        className="inline-flex items-center gap-2 rounded-lg border border-[#fde68a] px-3 py-2 text-sm font-medium hover:bg-teal-50"
      >
        <Plus size={16} />
        Add Language
      </button>
    </div>
  );
};

export default LanguageSelector;