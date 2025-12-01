import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Shield, Mail, Lock, Eye, EyeOff, X, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ParticleBackground } from "@/components/particle-background";
import { useUser } from "@/lib/userContext";
import { useAuth } from "@/lib/authContext";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login } = useUser();
  const { login: authLogin } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Google OAuth password setup flow
  const [showGooglePasswordSetup, setShowGooglePasswordSetup] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<{name: string, email: string, role: string, token: string, id: string} | null>(null);
  const [googlePassword, setGooglePassword] = useState("");
  const [googleConfirmPassword, setGoogleConfirmPassword] = useState("");
  const [showGooglePassword, setShowGooglePassword] = useState(false);
  const [showGoogleConfirmPassword, setShowGoogleConfirmPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [resetEmail, setResetEmail] = useState("");

  /**
   * Handle user login with JWT
   * Sends credentials to backend API and stores JWT token
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoginLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.token) {
        // Store JWT token and user info
        authLogin(data.data.token, {
          id: data.data.user.id,
          email: data.data.user.email,
          username: data.data.user.username,
          role: data.data.user.role,
        });

        // Also update legacy context (for compatibility)
        login(data.data.user.username, data.data.user.email, data.data.user.role === "admin" ? "Admin" : "Tester");

        // Redirect based on role
        if (data.data.user.role === "admin") {
          setLocation("/admin");
        } else {
          setLocation("/dashboard");
        }
      } else {
        setLoginError(data.message || "Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Failed to connect to server. Please try again.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  /**
   * Handle user signup
   * Sends signup data to backend API instead of localStorage
   * Backend will save user to MongoDB with role automatically set to "tester"
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setSignupError("");
    
    // Validate password match
    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }
    
    // Validate terms acceptance
    if (!acceptTerms) {
      setSignupError("Please accept the terms and conditions");
      return;
    }
    
    // Set loading state
    setIsSignupLoading(true);
    
    try {
      // ==================================================
      // CALL BACKEND API
      // ==================================================
      const response = await fetch("http://localhost:8080/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        setSignupError(data.message || "Signup failed. Please try again.");
        setIsSignupLoading(false);
        return;
      }

      // ==================================================
      // SUCCESS - USER CREATED IN DATABASE
      // Show success message and let user login manually
      // ==================================================
      console.log("User created successfully:", data);

      if (data.success) {
        // Show success message (user will click to go to login)
        setSignupSuccess(true);
      } else {
        setSignupError("Signup failed. Please try again.");
      }
      
      // Clear form fields
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirmPassword("");
      setAcceptTerms(false);
      
    } catch (error) {
      // Handle network or other errors
      console.error("Signup error:", error);
      setSignupError("Failed to connect to server. Please try again.");
    } finally {
      setIsSignupLoading(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotPassword(false);
  };

  // Handle Google OAuth SIGNUP (NEW user)
  const handleGoogleSignup = async (credentialResponse: CredentialResponse) => {
    try {
      setIsSignupLoading(true);
      setSignupError("");

      // Send the Google credential to backend SIGNUP endpoint
      const response = await fetch("http://localhost:8080/api/auth/google/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.token && data.data.needsPassword) {
        // Store Google user data and token, then show SET password screen
        setGoogleUserData({
          name: data.data.user.username,
          email: data.data.user.email,
          role: data.data.user.role,
          token: data.data.token,
          id: data.data.user.id,
        });
        setShowGooglePasswordSetup(true);
        setIsLogin(false); // Stay in signup mode
      } else {
        setSignupError(data.message || "Google signup failed");
      }
    } catch (error) {
      console.error("Google signup error:", error);
      setSignupError("Failed to connect to server");
    } finally {
      setIsSignupLoading(false);
    }
  };

  // Handle Google OAuth LOGIN (EXISTING user)
  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      setIsLoginLoading(true);
      setLoginError("");

      // Send the Google credential to backend LOGIN endpoint
      const response = await fetch("http://localhost:8080/api/auth/google/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.requiresPassword) {
        // Store Google user data and show ENTER password verification screen
        setGoogleUserData({
          name: data.data.user.username,
          email: data.data.user.email,
          role: data.data.user.role,
          token: "", // No token yet - need to verify password first
          id: data.data.user.id,
        });
        setShowGooglePasswordSetup(true);
        setIsLogin(true); // Stay in login mode
      } else {
        setLoginError(data.message || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setLoginError("Failed to connect to server");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleGoogleError = () => {
    if (isLogin) {
      setLoginError("Google login failed. Please try again.");
    } else {
      setSignupError("Google signup failed. Please try again.");
    }
  };

  // Handle Google password setup/verification submission
  const handleGooglePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (googlePassword !== googleConfirmPassword) {
      if (isLogin) {
        setLoginError("Passwords do not match");
      } else {
        setSignupError("Passwords do not match");
      }
      return;
    }

    if (googlePassword.length < 6) {
      if (isLogin) {
        setLoginError("Password must be at least 6 characters");
      } else {
        setSignupError("Password must be at least 6 characters");
      }
      return;
    }

    if (!googleUserData) return;

    try {
      setIsSignupLoading(true);
      setIsLoginLoading(true);
      setSignupError("");
      setLoginError("");

      if (isLogin) {
        // LOGIN MODE: Verify existing password
        const response = await fetch("http://localhost:8080/api/auth/google/verify-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: googleUserData.email,
            password: googlePassword,
          }),
        });

        const data = await response.json();

        if (data.success && data.data.token) {
          // Store JWT token and user info
          authLogin(data.data.token, {
            id: data.data.user.id,
            email: data.data.user.email,
            username: data.data.user.username,
            role: data.data.user.role,
          });

          // Also update legacy context (for compatibility)
          login(data.data.user.username, data.data.user.email, data.data.user.role === "admin" ? "Admin" : "Tester");
          
          // Redirect based on role
          if (data.data.user.role === "admin") {
            setLocation("/admin");
          } else {
            setLocation("/dashboard");
          }
        } else {
          setLoginError(data.message || "Invalid password. Please try again.");
        }
      } else {
        // SIGNUP MODE: Set new password
        const response = await fetch("http://localhost:8080/api/users/set-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: googleUserData.email,
            password: googlePassword,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Store JWT token and user info (token was already received during signup)
          authLogin(googleUserData.token, {
            id: googleUserData.id,
            email: googleUserData.email,
            username: googleUserData.name,
            role: googleUserData.role,
          });

          // Also update legacy context (for compatibility)
          login(googleUserData.name, googleUserData.email, googleUserData.role === "admin" ? "Admin" : "Tester");
          
          // Redirect based on role
          if (googleUserData.role === "Admin") {
            setLocation("/admin");
          } else {
            setLocation("/dashboard");
          }
        } else {
          setSignupError(data.message || "Failed to set password");
        }
      }
    } catch (error) {
      console.error("Password setup error:", error);
      if (isLogin) {
        setLoginError("Failed to connect to server");
      } else {
        setSignupError("Failed to connect to server");
      }
    } finally {
      setIsSignupLoading(false);
      setIsLoginLoading(false);
    }
  };

  // Google Password Setup/Verification Screen
  if (showGooglePasswordSetup && googleUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
        <ParticleBackground />
        
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        <div className="relative z-20 w-full max-w-lg px-4 animate-in zoom-in-95 duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/20 mb-4">
                <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {isLogin ? "Enter Your Password" : "Set Your Password"}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {isLogin 
                  ? `Welcome back, ${googleUserData.name}! Please enter your password to continue.`
                  : `Welcome, ${googleUserData.name}! Set a password to access your account with email/password login.`
                }
              </p>
            </div>

            {signupError && !isLogin && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{signupError}</p>
              </div>
            )}

            {loginError && isLogin && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{loginError}</p>
              </div>
            )}

            <form onSubmit={handleGooglePasswordSetup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email (from Google)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={googleUserData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {isLogin ? "Password" : "Create Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showGooglePassword ? "text" : "password"}
                    value={googlePassword}
                    onChange={(e) => setGooglePassword(e.target.value)}
                    placeholder={isLogin ? "Enter your password" : "Enter password (min 6 characters)"}
                    className="w-full pl-10 pr-12 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-white"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGooglePassword(!showGooglePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showGooglePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showGoogleConfirmPassword ? "text" : "password"}
                    value={googleConfirmPassword}
                    onChange={(e) => setGoogleConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-12 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoogleConfirmPassword(!showGoogleConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showGoogleConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSignupLoading || isLoginLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
              >
                {(isSignupLoading || isLoginLoading) ? (
                  <>
                    <span className="animate-spin">⏳</span> 
                    {isLogin ? "VERIFYING..." : "SETTING PASSWORD..."}
                  </>
                ) : (
                  <>
                    {isLogin ? "LOGIN" : "CONTINUE TO DASHBOARD"} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
        <ParticleBackground />
        
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        <div className="relative z-20 w-full max-w-lg px-4 animate-in zoom-in-95 duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Account Created Successfully!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Your account has been created successfully!<br />
              Please click below to go to the login page and enter your credentials to sign in.
            </p>
            <Button 
              onClick={() => {
                setSignupSuccess(false);
                setIsLogin(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go to Login Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      <ParticleBackground />
      
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <Link href="/">
        <Button variant="ghost" size="icon" className="absolute top-6 left-6 z-50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full">
          <X className="w-6 h-6" />
        </Button>
      </Link>

      <div className="relative z-20 w-full max-w-lg px-4 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 mb-6 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            TESTHUB
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Automated Testing Platform</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8">
          
          {isForgotPassword ? (
            <>
              <div className="flex gap-2 mb-8">
                <button 
                  className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setIsForgotPassword(false)}
                >
                  Login
                </button>
                <button 
                  className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Enter your email address and we'll send you a reset link</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="user@thex.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    SEND RESET LINK <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <button
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Back to Login
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-3 mb-8">
                <button 
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                    isLogin 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                    !isLogin 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {isLogin ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && (
                    <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{loginError}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="user@thex.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded cursor-pointer dark:bg-slate-800"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Remember Me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoginLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
                  >
                    {isLoginLoading ? (
                      <>
                        <span className="animate-spin">⏳</span> LOGGING IN...
                      </>
                    ) : (
                      <>
                        LOGIN <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  {signupError && (
                    <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{signupError}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="john@company.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Create a password"
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {signupPassword && signupConfirmPassword && signupPassword !== signupConfirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded cursor-pointer mt-1 dark:bg-slate-800"
                      required
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      I accept the <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">Terms & Conditions</a> and <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">Privacy Policy</a>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={signupPassword !== signupConfirmPassword || isSignupLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
                  >
                    {isSignupLoading ? (
                      <>
                        <span className="animate-spin">⏳</span> CREATING ACCOUNT...
                      </>
                    ) : (
                      <>
                        SIGN UP <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
                    Account will be created with role: Tester
                  </p>
                </form>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-slate-900 px-2 text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">
                    {isLogin ? "OR LOGIN WITH" : "OR SIGN UP WITH"}
                  </span>
                </div>
              </div>

              <div className="w-full">
                <GoogleLogin
                  onSuccess={isLogin ? handleGoogleLogin : handleGoogleSignup}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  width="100%"
                  text={isLogin ? "signin_with" : "signup_with"}
                />
              </div>
            </>
          )}
        </div>

        <p className="text-center mt-6 text-slate-600 dark:text-slate-400 text-xs">
          v1.0.0 | Secured Infrastructure
        </p>
      </div>
    </div>
  );
}
