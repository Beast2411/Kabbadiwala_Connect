import React, { useRef, useState } from "react";

export const OTPInput = ({ length = 6, onChangeOTP }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Take last entered digit
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    const combinedOtp = newOtp.join("");
    onChangeOTP(combinedOtp);

    // Auto-focus next input
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 w-full my-4">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          ref={(ref) => (inputRefs.current[index] = ref)}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={`w-12 h-14 text-center font-bold text-2xl rounded-2xl border-2 transition-all focus:outline-none ${
            digit
              ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
              : "border-gray-200 bg-gray-50 focus:border-emerald-500 focus:bg-white"
          }`}
        />
      ))}
    </div>
  );
};
