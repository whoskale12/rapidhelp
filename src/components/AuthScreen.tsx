import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Vehicle } from '../types';
import { User, Phone, ArrowRight, ArrowLeft, CheckCircle2, Lightbulb, Car, Sparkles, Camera, ShieldCheck, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthScreenProps {
  onCompleteAuth: (user: UserProfile) => void;
  initialUser?: UserProfile;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onCompleteAuth, initialUser }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSignInMode, setIsSignInMode] = useState<boolean>(false);
  
  // Form State
  const [fullName, setFullName] = useState<string>(initialUser?.name || 'John Doe');
  const [countryCode, setCountryCode] = useState<string>(initialUser?.countryCode || '+1');
  const [phone, setPhone] = useState<string>(initialUser?.phone || '(555) 000-0000');
  
  // Step 2 Face KYC State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isScanSuccessful, setIsScanSuccessful] = useState<boolean>(false);
  const [useRealCamera, setUseRealCamera] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Step 3 Vehicle State
  const [vehicleMake, setVehicleMake] = useState<string>('Toyota');
  const [vehicleModel, setVehicleModel] = useState<string>('Camry');
  const [vehicleYear, setVehicleYear] = useState<number>(2019);
  const [vehicleColor, setVehicleColor] = useState<string>('Silver');
  const [vehiclePlate, setVehiclePlate] = useState<string>('7ABC123');

  // Real Camera handling
  useEffect(() => {
    if (useRealCamera && currentStep === 2 && !isScanSuccessful) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera access denied or unavailable, using simulated feed.', err);
          setUseRealCamera(false);
        });
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
    }
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useRealCamera, currentStep, isScanSuccessful]);

  const handleStartScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsScanSuccessful(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#b7131a', '#feb300', '#005ea4'],
      });
    }, 2000);
  };

  const handleSkipScan = () => {
    setCurrentStep(3);
  };

  const handleFinishRegistration = () => {
    const newVehicle: Vehicle = {
      id: `veh_${Date.now()}`,
      make: vehicleMake || 'Toyota',
      model: vehicleModel || 'Camry',
      year: vehicleYear || 2020,
      color: vehicleColor || 'Silver',
      licensePlate: vehiclePlate || '7ABC123',
      isDefault: true,
    };

    const finalProfile: UserProfile = {
      name: fullName || 'John Doe',
      phone: phone || '(555) 000-0000',
      countryCode: countryCode,
      isVerified: isScanSuccessful,
      avatarUrl: isScanSuccessful
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwOmyRpRB4TML0zG1WEGJskP3hKEsmM-RSbpYnb7wLNFIUAilOz68QcHUaD9fV3f8l5GjIXgeB4vOvtrorxZ_8pfuZR1m9bdLLqNdBDj6dEoF4XRh-5YF1Fx0JaZp4lkjSVtFFO9mATpumssP1Tn4D7b8pj4sG8Wgr8hZRJw020iU9FqULWIfRYeG3jLHk2XwSIrTgixoMn9RnJo0Qe2IfqUx4wIbAxel3hp4NbpVbjDZ5N36TfdBq'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      vehicles: [newVehicle],
      activeVehicleId: newVehicle.id,
      rewardPoints: (initialUser?.rewardPoints || 4250) + (isScanSuccessful ? 500 : 0),
      silentMode: true,
      emergencyContacts: initialUser?.emergencyContacts || [
        {
          id: 'ec_1',
          name: 'Sarah Doe',
          relationship: 'Spouse',
          phone: '(555) 987-6543',
          notifyOnSos: true,
        },
      ],
    };

    setCurrentStep(4);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#b7131a', '#feb300', '#005ea4'],
    });

    setTimeout(() => {
      onCompleteAuth(finalProfile);
    }, 1400);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      if (currentStep === 2 && isScanSuccessful) {
        setIsScanSuccessful(false);
      } else {
        setCurrentStep((prev) => prev - 1);
      }
    }
  };

  const progressPercentage = ((currentStep - 1) / 3) * 100;

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen flex flex-col font-['Inter',sans-serif]">
      {/* Top App Bar matching screenshot 1 */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-14 bg-[#f9f9f9] shadow-sm border-b border-[#e2e2e2]/60">
        <button
          id="auth-back-btn"
          aria-label="Go back"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`p-2 -ml-2 text-[#b7131a] active:scale-95 transition-all rounded-full flex items-center justify-center cursor-pointer ${
            currentStep === 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-[#eeeeee]'
          }`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h1 className="font-['Inter'] font-bold text-xl text-[#b7131a]">RapidHelp</h1>
        <div className="w-8"></div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mt-14 pb-8 relative w-full max-w-lg mx-auto px-4 flex flex-col">
        {/* Progress Stepper matching screenshot */}
        <div className="py-6">
          <div className="flex items-center justify-between relative">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#e2e2e2] -z-10 rounded-full"></div>
            {/* Active Red Progress Line */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#b7131a] -z-10 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors shadow-sm ${
                  currentStep >= 1 ? 'bg-[#b7131a] text-white' : 'bg-[#e8e8e8] text-[#5b403d]'
                }`}
              >
                1
              </div>
              <span className={`text-xs font-medium ${currentStep >= 1 ? 'text-[#1a1c1c]' : 'text-[#5b403d]'}`}>
                Account
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors shadow-sm ${
                  currentStep >= 2 ? 'bg-[#b7131a] text-white' : 'bg-[#e8e8e8] text-[#5b403d]'
                }`}
              >
                2
              </div>
              <span className={`text-xs font-medium ${currentStep >= 2 ? 'text-[#1a1c1c]' : 'text-[#5b403d]'}`}>
                Verify
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors shadow-sm ${
                  currentStep >= 3 ? 'bg-[#b7131a] text-white' : 'bg-[#e8e8e8] text-[#5b403d]'
                }`}
              >
                3
              </div>
              <span className={`text-xs font-medium ${currentStep >= 3 ? 'text-[#1a1c1c]' : 'text-[#5b403d]'}`}>
                Vehicle
              </span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors shadow-sm ${
                  currentStep >= 4 ? 'bg-[#b7131a] text-white' : 'bg-[#e8e8e8] text-[#5b403d]'
                }`}
              >
                4
              </div>
              <span className={`text-xs font-medium ${currentStep >= 4 ? 'text-[#1a1c1c]' : 'text-[#5b403d]'}`}>
                Done
              </span>
            </div>
          </div>
        </div>

        {/* STEP 1: Create Account Form */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="text-center mt-2">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1a1c1c] mb-2 tracking-tight">
                {isSignInMode ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-[#5b403d] text-sm md:text-base">
                {isSignInMode
                  ? 'Sign in to access your vehicles and roadside coverage.'
                  : 'Enter your details to request roadside assistance instantly when needed.'}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isSignInMode) {
                  // Direct sign in
                  handleFinishRegistration();
                } else {
                  setCurrentStep(2);
                }
              }}
              className="flex flex-col gap-4 mt-2"
            >
              {!isSignInMode && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#1a1c1c]" htmlFor="fullName">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5b403d]">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full h-12 pl-11 pr-4 rounded-lg border-2 border-[#e2e2e2] bg-white text-[#1a1c1c] text-base focus:border-[#005ea4] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#1a1c1c]" htmlFor="phone">
                  Phone Number
                </label>
                <div className="relative flex">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-12 w-24 rounded-l-lg border-2 border-r-0 border-[#e2e2e2] bg-[#f3f3f3] text-[#1a1c1c] text-sm font-semibold px-2 focus:border-[#005ea4] focus:outline-none cursor-pointer"
                  >
                    <option value="+1">+1 (US)</option>
                    <option value="+62">+62 (ID)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+65">+65 (SG)</option>
                  </select>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="flex-1 h-12 px-4 rounded-r-lg border-2 border-[#e2e2e2] bg-white text-[#1a1c1c] text-base focus:border-[#005ea4] focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-xs text-[#5b403d] mt-1">
                  We'll send a code to verify this number during emergencies.
                </p>
              </div>

              <button
                id="auth-continue-btn"
                type="submit"
                className="mt-6 w-full h-12 bg-[#b7131a] hover:bg-[#db322f] text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <span>{isSignInMode ? 'Sign In' : 'Continue'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="text-center mt-2">
                <p className="text-xs text-[#5b403d]">
                  {isSignInMode ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setIsSignInMode(!isSignInMode)}
                    className="text-[#005ea4] font-semibold hover:underline cursor-pointer ml-1"
                  >
                    {isSignInMode ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>

              {/* Demo Quick Fill */}
              <div className="mt-4 pt-4 border-t border-[#e2e2e2] flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setFullName('John Doe');
                    setPhone('(555) 000-0000');
                    setCountryCode('+1');
                    setCurrentStep(2);
                  }}
                  className="text-xs text-[#7e5700] bg-[#ffdeac]/40 hover:bg-[#ffdeac]/70 px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer"
                >
                  ⚡ Quick Demo Auto-Fill & Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Face KYC Identity Verification matching Screenshot 2 */}
        {currentStep === 2 && !isScanSuccessful && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="text-center mt-2">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1a1c1c] mb-2 tracking-tight">
                Identity Verification
              </h2>
              <p className="text-[#5b403d] text-sm md:text-base">
                For your safety and service security, we need a quick face scan.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center my-2">
              {/* Simulated / Real Camera View Oval */}
              <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-[#e2e2e2] shadow-xl bg-[#e2e2e2] flex items-center justify-center">
                {useRealCamera ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwOmyRpRB4TML0zG1WEGJskP3hKEsmM-RSbpYnb7wLNFIUAilOz68QcHUaD9fV3f8l5GjIXgeB4vOvtrorxZ_8pfuZR1m9bdLLqNdBDj6dEoF4XRh-5YF1Fx0JaZp4lkjSVtFFO9mATpumssP1Tn4D7b8pj4sG8Wgr8hZRJw020iU9FqULWIfRYeG3jLHk2XwSIrTgixoMn9RnJo0Qe2IfqUx4wIbAxel3hp4NbpVbjDZ5N36TfdBq')`,
                    }}
                  ></div>
                )}

                {/* Outer Glow Ring */}
                <div className="absolute inset-0 border-[8px] border-[#b7131a]/20 rounded-full z-10 pointer-events-none"></div>

                {/* Laser Scanline animation when scanning */}
                {isScanning && (
                  <div className="absolute inset-0 w-full h-full overflow-hidden z-20 pointer-events-none">
                    <div className="w-full h-24 bg-gradient-to-b from-transparent via-[#b7131a]/60 to-transparent animate-scanline absolute top-0 left-0"></div>
                  </div>
                )}

                {/* Face Alignment Oval Guide */}
                <div className="absolute inset-0 m-auto w-44 h-52 border-2 border-dashed border-white/70 rounded-[42%] z-30 pointer-events-none shadow-inner flex items-center justify-center">
                  {isScanning && (
                    <span className="text-white text-xs font-semibold px-2 py-1 bg-black/40 rounded-full">
                      Hold still...
                    </span>
                  )}
                </div>
              </div>

              {/* Toggle Real Camera / Sample Photo button */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setUseRealCamera(!useRealCamera)}
                  className="text-xs text-[#005ea4] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {useRealCamera ? 'Switch to demo sample photo' : 'Use live device camera'}
                </button>
              </div>

              {/* Lightbulb Hint Card */}
              <div className="bg-[#f3f3f3] border border-[#e2e2e2] px-4 py-3 rounded-lg flex items-start gap-3 w-full max-w-sm mt-4">
                <Lightbulb className="w-5 h-5 text-[#feb300] shrink-0 mt-0.5" />
                <p className="text-xs text-[#5b403d] leading-relaxed">
                  Ensure you are in a well-lit area and remove glasses or hats for a faster scan.
                </p>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-2">
              <button
                id="scan-start-btn"
                type="button"
                disabled={isScanning}
                onClick={handleStartScan}
                className="w-full h-12 bg-[#b7131a] hover:bg-[#db322f] text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-80"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Scanning Face Geometry...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Start Scan</span>
                  </>
                )}
              </button>

              <button
                id="scan-skip-btn"
                type="button"
                onClick={handleSkipScan}
                className="w-full h-12 bg-transparent text-[#5b403d] hover:bg-[#eeeeee] rounded-lg font-semibold flex items-center justify-center active:scale-95 transition-colors border border-[#e4beb9] cursor-pointer text-sm"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* STEP 2.5: Verification Successful State */}
        {currentStep === 2 && isScanSuccessful && (
          <div className="flex flex-col items-center justify-center text-center py-10 animate-fadeIn">
            <div className="w-24 h-24 rounded-full bg-[#ffdad6] text-[#b7131a] flex items-center justify-center mb-6 shadow-md animate-bounce">
              <CheckCircle2 className="w-16 h-16" />
            </div>

            <h2 className="text-2xl font-bold text-[#1a1c1c] mb-2">
              Verification Successful
            </h2>
            <p className="text-[#5b403d] text-sm max-w-xs mb-8">
              Your biometric identity has been securely verified and certified for instant priority dispatch.
            </p>

            <button
              id="verification-continue-btn"
              type="button"
              onClick={() => setCurrentStep(3)}
              className="w-full max-w-xs h-12 bg-[#b7131a] hover:bg-[#db322f] text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <span>Continue to Vehicle Info</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 3: Vehicle Setup */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="text-center mt-2">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1a1c1c] mb-2 tracking-tight">
                Add Your Vehicle
              </h2>
              <p className="text-[#5b403d] text-sm md:text-base">
                Rescue technicians use this info to bring the right spare parts, tow gear, and tools.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-[#e2e2e2] shadow-sm flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#5b403d]">Make</label>
                  <input
                    type="text"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="Toyota"
                    className="h-11 px-3 rounded-lg border border-[#e2e2e2] bg-[#f9f9f9] text-sm text-[#1a1c1c] focus:border-[#005ea4] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#5b403d]">Model</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Camry"
                    className="h-11 px-3 rounded-lg border border-[#e2e2e2] bg-[#f9f9f9] text-sm text-[#1a1c1c] focus:border-[#005ea4] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#5b403d]">Year</label>
                  <input
                    type="number"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(Number(e.target.value))}
                    placeholder="2019"
                    className="h-11 px-3 rounded-lg border border-[#e2e2e2] bg-[#f9f9f9] text-sm text-[#1a1c1c] focus:border-[#005ea4] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#5b403d]">Color</label>
                  <input
                    type="text"
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    placeholder="Silver"
                    className="h-11 px-3 rounded-lg border border-[#e2e2e2] bg-[#f9f9f9] text-sm text-[#1a1c1c] focus:border-[#005ea4] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#5b403d]">Plate #</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="7ABC123"
                    className="h-11 px-3 rounded-lg border border-[#e2e2e2] bg-[#f9f9f9] text-sm text-[#1a1c1c] focus:border-[#005ea4] focus:outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div className="bg-[#f3f3f3] p-3 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e8e8e8] flex items-center justify-center text-[#b7131a] shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-[#1a1c1c] block">
                    {vehicleYear} {vehicleMake} {vehicleModel} ({vehicleColor})
                  </span>
                  <span className="text-[#5b403d] font-mono">{vehiclePlate}</span>
                </div>
              </div>
            </div>

            <button
              id="vehicle-save-btn"
              type="button"
              onClick={handleFinishRegistration}
              className="w-full h-12 bg-[#b7131a] hover:bg-[#db322f] text-white rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <span>Save & Complete Setup</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 4: Registration Complete & Launching */}
        {currentStep === 4 && (
          <div className="flex flex-col items-center justify-center text-center py-10 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-[#feb300]/20 text-[#7e5700] flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-[#feb300] animate-spin" />
            </div>

            <h2 className="text-2xl font-bold text-[#1a1c1c] mb-2">
              Welcome to RapidHelp!
            </h2>
            <p className="text-[#5b403d] text-sm max-w-sm mb-6">
              Your profile is registered and ready. 500 bonus reward points have been credited to your account!
            </p>

            <div className="flex items-center gap-2 bg-[#feb300]/10 border border-[#feb300]/30 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#7e5700]" />
              <span className="text-xs font-bold text-[#6a4800]">+500 Points Claimed</span>
            </div>

            <p className="text-xs text-[#5b403d] animate-pulse">Launching dashboard...</p>
          </div>
        )}
      </main>
    </div>
  );
};
