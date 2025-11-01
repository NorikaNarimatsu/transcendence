import signup_image from "../../assets/SignUp.jpg";
import ButtonPurple from "../../components/decoration/ButtonPurple";
import mail_icon from "../../assets/icons/mail.png";
import arrow_icon from "../../assets/icons/arrow.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../user/UserContext";
import { sanitizeEmail, getEmailErrorMessage } from "../../utils/emailValidation";
import SafeError from "../../components/SafeError";
import { useLanguage } from "../../contexts/LanguageContext";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();
  const { logout } = useUser();

  const { lang, t } = useLanguage();
  const translation = t[lang];

  useEffect(() => {
    logout(); // This will clear user state and localStorage
  }, [logout]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    //real-time validation
    const errorMessage = getEmailErrorMessage(newEmail);
    setEmailError(errorMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errorMessage = getEmailErrorMessage(email);
    if (errorMessage) {
      setEmailError(errorMessage);
      return;
    }

    const sanitizedEmail = sanitizeEmail(email);

    try {
      const response = await fetch("https://localhost:8443/validateEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: sanitizedEmail }),
      });
      const data = await response.json();
      if (response.status === 200) {
        navigate("/signupUnkownUser", { state: { email: sanitizedEmail } });
      } else if (response.status === 409) {
        navigate("/login", { state: { email: sanitizedEmail } });
      } else {
        setError(data.message || "Validation failed");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to validate email");
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 bg-pink-grid flex items-center justify-center">
        <div className="bg-pink-dark shadow-no-blur-70 flex m-8 overflow-hidden">
          {/* Left column for form */}
          <section className="p-8 flex flex-col justify-between min-w-80">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div>
                <h1 className="text-4xl text-blue-deep font-pixelify mb-[20px] text-shadow font-bold">
                  {translation.pages.signup.signup}
                </h1>
                {/* Email input */}
                <div className="relative mb-6">
                  <img
                    src={mail_icon}
                    alt="Mail icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-[30px] w-auto"
                  />
                  <input
                    type="text"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="name_0000@gmail.com"
                    className={`w-full px-4 py-2 bg-blue-deep text-white placeholder-color font-dotgothic border-2 border-black ${
                      emailError ? "border-red-500" : ""
                    } focus:outline-none shadow-no-blur-50-reverse-no-active tracking-widest`}
                  />
                </div>
                {/* Message displays */}
                <SafeError error={emailError} className="text-sm mb-4" />
              </div>
              <SafeError error={error} className="text-sm mb-4" />
              <div className="flex-grow"></div>
              <div className="flex-shrink-0">
                {/* Continue button */}
                {/* <button type="submit" className="w-full"> */}
                <ButtonPurple type="submit">
                  <span className="flex items-center justify-end gap-2">
                    {translation.common.continue}
                    <img src={arrow_icon} alt="Arrow" className="h-4 w-auto" />
                    <img src={arrow_icon} alt="Arrow" className="h-4 w-auto" />
                  </span>
                </ButtonPurple>
                {/* </button> */}
              </div>
            </form>
          </section>

          {/* Right column for image */}
          <section className="flex items-center justify-center m-4">
            <img
              src={signup_image}
              alt="Login Image"
              className="h-[500px] w-auto object-cover"
            />
          </section>
        </div>
      </div>
    </main>
  );
}
