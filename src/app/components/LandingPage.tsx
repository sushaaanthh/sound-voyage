import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Target, Route, Shuffle, Eye, EyeOff, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useGameSession } from '../context/GameSessionContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import ForgotPasswordModal from './auth/ForgotPasswordModal';

type Role = 'progressor' | 'parent' | 'practitioner';

const WAVEFORM_HEIGHTS = [
  25, 45, 30, 55, 75, 45, 65, 95, 120, 85, 100, 130, 150, 110, 125, 140, 170, 190, 140, 95, 
  115, 80, 85, 65, 55, 35, 45, 25, 35, 50, 65, 90, 115, 135, 115, 100, 85, 65, 55, 45,
  35, 55, 80, 95, 115, 135, 155, 180, 145, 115, 95, 75, 55, 35, 45, 65, 85, 105, 85, 65,
  45, 35, 25
];

const IMPACT_GUIDES = [
  {
    icon: Target,
    title: 'Cognitive Transformation',
    description: 'Sound Voyage rewires how children process language, building neural pathways that strengthen their ability to decode and understand speech patterns with confidence.',
  },
  {
    icon: Shuffle,
    title: 'Vocal Empowerment',
    description: 'Through targeted phonological exercises, children develop clearer articulation, improved pronunciation, and the ability to express themselves more effectively in daily conversations.',
  },
  {
    icon: Route,
    title: 'Lasting Development',
    description: 'Our evidence-based approach creates sustainable improvements in sound awareness, reading readiness, and communication skills that benefit children throughout their academic journey.',
  },
];

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState<Role>('progressor');
  const [progressorId, setProgressorId] = useState('');
  const [practitionerId, setPractitionerId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  // Sign-Up states
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupProgressorId, setSignupProgressorId] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');

  const navigate = useNavigate();
  const loginRef = useRef<HTMLDivElement>(null);
  const { updateSession } = useGameSession();

  // Clear signup error on role change
  useEffect(() => {
    setSignupError('');
  }, [selectedRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let emailToAuth = '';

      if (selectedRole === 'practitioner') {
        emailToAuth = practitionerId;
      } else {
        // Progressor or Parent
        if (progressorId.includes('@')) {
          emailToAuth = progressorId;
        } else {
          const { data: progressorData, error: progressorError } = await supabase
            .from('progressors')
            .select('assigned_email')
            .eq('id', progressorId)
            .maybeSingle();

          if (progressorError || !progressorData) {
            toast.error('Progressor ID not found. Please verify with your practitioner.');
            return;
          }
          emailToAuth = progressorData.assigned_email || '';
        }
      }

      if (!emailToAuth) {
        toast.error('Please enter a valid email or ID.');
        return;
      }

      // Execute supabase.auth.signInWithPassword({ email, password }).
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password: password,
      });

      if (authError || !authData.user) {
        toast.error(authError?.message || 'Login failed. Please check your credentials.');
        return;
      }

      // 1. Query practitioners table for a matching auth_user_id. If found, route to /practitioner.
      const { data: practitionerData } = await supabase
        .from('practitioners')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .maybeSingle();

      if (practitionerData) {
        toast.success('Successfully logged in as Practitioner');
        navigate('/practitioner');
        return;
      }

      // 2. Query progressors table for a matching auth_user_id. If found, route to /progressor/:id.
      const { data: progressorProfile } = await supabase
        .from('progressors')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .maybeSingle();

      if (progressorProfile) {
        updateSession(
          progressorProfile.id,
          progressorProfile.name || '',
          progressorProfile.completed_levels || []
        );

        if (selectedRole === 'parent') {
          toast.success('Successfully logged in as Parent');
          navigate(`/parent/${progressorProfile.id}`);
        } else {
          toast.success('Successfully logged in as Progressor');
          navigate(`/progressor/${progressorProfile.id}`);
        }
        return;
      }

      toast.error('User profile not found in database.');
    } catch (err) {
      console.error('Login error', err);
      toast.error('An unexpected error occurred during login.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRole !== 'progressor') {
      toast.error('Only Progressors can sign up directly.');
      return;
    }

    if (!signupProgressorId) {
      const errMsg = 'Progressor ID is required.';
      setSignupError(errMsg);
      toast.error(errMsg);
      return;
    }

    try {
      // 1. Query the progressors table for the provided progressorId.
      const { data: progressorData, error: progressorError } = await supabase
        .from('progressors')
        .select('*')
        .eq('id', signupProgressorId)
        .maybeSingle();

      // 2. If it does not exist, throw an error: "Invalid ID. Please check with your Practitioner."
      if (progressorError || !progressorData) {
        const errMsg = 'Invalid ID. Please check with your Practitioner.';
        setSignupError(errMsg);
        toast.error(errMsg);
        return;
      }

      // 3. If it exists but auth_user_id is NOT null, throw an error: "This ID is already registered."
      if (progressorData.auth_user_id !== null) {
        const errMsg = 'This ID is already registered.';
        setSignupError(errMsg);
        toast.error(errMsg);
        return;
      }

      // 4. If valid, execute supabase.auth.signUp({ email, password }).
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            name: signupName,
          }
        }
      });

      if (signUpError || !signUpData.user) {
        toast.error(signUpError?.message || 'Failed to create account.');
        return;
      }

      // 5. On success, execute an UPDATE on the progressors table, setting the auth_user_id to the newly created auth.user.id where id === progressorId.
      // 6. Update the name column with the name provided in the sign-up form.
      const { error: updateError } = await supabase
        .from('progressors')
        .update({
          auth_user_id: signUpData.user.id,
          name: signupName,
          assigned_email: signupEmail,
          is_claimed: true
        })
        .eq('id', signupProgressorId);

      if (updateError) {
        toast.error('Account created, but failed to link profile: ' + updateError.message);
        return;
      }

      // Update progressor_ids for database consistency
      await supabase
        .from('progressor_ids')
        .update({
          is_claimed: true,
          auth_user_id: signUpData.user.id,
          assigned_email: signupEmail
        })
        .eq('id', signupProgressorId);

      toast.success('Account successfully created. Please log in.');
      setShowSignUp(false);
      setSignupError('');
      
      // Clear fields
      setSignupName('');
      setSignupEmail('');
      setSignupProgressorId('');
      setSignupPassword('');
    } catch (err) {
      console.error('Sign-up error', err);
      toast.error('An unexpected error occurred during registration.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-secondary/30 flex flex-col items-center justify-start p-6 md:p-12 relative overflow-y-auto overflow-x-hidden">
      {/* Mesh gradient background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,99,71,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,99,71,0.15),transparent_50%)]" />

      {/* Waveform background backdrop */}
      <div className="absolute inset-x-0 top-36 flex items-center justify-center opacity-[0.06] dark:opacity-[0.04] pointer-events-none select-none z-0 overflow-hidden">
        <div className="flex items-center gap-1 md:gap-1.5 w-full max-w-6xl justify-between px-4 md:px-8">
          {WAVEFORM_HEIGHTS.map((height, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full transition-all duration-300"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center pt-12 md:pt-16 pb-8">
        {/* Centered Hero Section */}
        <div className="mb-12 flex flex-col items-center">
          <span className="text-primary tracking-[0.25em] font-bold text-xs md:text-sm uppercase mb-3 block">
            Welcome To
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground mb-4 uppercase">
            Sound Voyage
          </h1>
          <p className="text-lg md:text-xl font-bold text-primary tracking-[0.08em] uppercase mb-4">
            Cognitive Assessment App
          </p>
          <p className="text-xs md:text-sm font-semibold tracking-[0.15em] text-muted-foreground uppercase max-w-xl mx-auto mb-6">
            Strengthen the Bridge between Mind and Voice
          </p>
          <p className="text-sm md:text-base text-foreground/80 max-w-xl mx-auto mb-10 leading-relaxed">
            Evidence-based programs that help children build stronger language processing, clearer communication, and lifelong confidence.
          </p>
          
          {/* Primary actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center z-10 relative">
            <button
              onClick={() => {
                setSignupError('');
                setShowSignUp(true);
                setIsLoginModalOpen(true);
              }}
              className="px-10 py-4.5 rounded-[2rem] bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 text-base cursor-pointer"
            >
              Get Started
            </button>
            <button
              onClick={() => {
                setShowSignUp(false);
                setIsLoginModalOpen(true);
              }}
              className="px-10 py-4.5 rounded-[2rem] bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-full border border-border/50 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 text-base cursor-pointer"
            >
              Log in
            </button>
          </div>
        </div>


        {/* Features List (Impact Guides Grid) */}
        <div className="w-full mb-16 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {IMPACT_GUIDES.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <div
                  key={guide.title}
                  className="bg-card rounded-3xl p-8 border border-border shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                    <Icon className="w-9 h-9 text-primary" />
                  </div>
                  <h3 className="mb-4 text-xl font-bold tracking-tight text-center">{guide.title}</h3>
                  <p className="text-foreground/80 leading-relaxed text-center text-sm md:text-base">{guide.description}</p>
                </div>
              );
            })}
          </div>
        </div>


        {/* Footer */}
        <footer className="mt-12 pb-8 text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm text-muted-foreground border-t border-border/20 pt-8 w-full">
          <p>© 2026 Sound Voyage. All rights reserved.</p>
          <button
            onClick={() => setShowPrivacy(true)}
            className="hover:text-foreground transition-colors underline decoration-dotted underline-offset-4 cursor-pointer"
          >
            Privacy Policy
          </button>
        </footer>
      </div>

      {/* Auth Modal (Login / Sign-up) */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-card rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-border animate-in zoom-in duration-300 relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
              aria-label="Close auth modal"
            >
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>

            {showSignUp ? (
              // Sign Up Form
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-foreground">I am a...</label>
                    <div className="relative flex rounded-[2rem] bg-secondary p-1">
                      <div
                        className="absolute top-1 bottom-1 bg-primary rounded-[1.5rem] shadow-md transition-all duration-300 ease-in-out"
                        style={{
                          width: 'calc(33.333% - 0.25rem)',
                          left: selectedRole === 'progressor' ? '0.25rem' : selectedRole === 'parent' ? 'calc(33.333% + 0.08rem)' : 'calc(66.666% - 0.08rem)',
                        }}
                      />
                      {(['progressor', 'parent', 'practitioner'] as Role[]).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          className={`flex-1 py-2 text-sm rounded-[1.5rem] transition-all duration-300 capitalize relative z-10 cursor-pointer ${
                            selectedRole === role
                              ? 'text-primary-foreground font-semibold'
                              : 'text-foreground/60 hover:text-foreground'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name Field */}
                  <div className="text-left">
                    <label htmlFor="signup-name" className="block mb-1 text-sm font-medium text-foreground">
                      Full Name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-5 py-3 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="text-left">
                    <label htmlFor="signup-email" className="block mb-1 text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-5 py-3 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                    />
                  </div>

                  {/* ID Field (conditional) */}
                  {selectedRole === 'progressor' ? (
                    <div className="text-left">
                      <label htmlFor="signup-progressor-id" className="block mb-1 text-sm font-medium text-foreground">
                        Progressor ID
                      </label>
                      <input
                        id="signup-progressor-id"
                        type="text"
                        required
                        value={signupProgressorId}
                        onChange={(e) => {
                          setSignupProgressorId(e.target.value);
                          if (signupError) setSignupError('');
                        }}
                        placeholder="Enter Progressor ID (e.g. E001)"
                        className={`w-full px-5 py-3 rounded-[1.5rem] bg-input-background border ${
                          signupError ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
                        } text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all text-sm`}
                      />
                      {signupError && (
                        <p className="text-red-500 text-xs mt-1 pl-2">{signupError}</p>
                      )}
                    </div>
                  ) : selectedRole === 'practitioner' ? (
                    <div className="text-left">
                      <label htmlFor="signup-practitioner-id" className="block mb-1 text-sm font-medium text-foreground">
                        Practitioner ID
                      </label>
                      <input
                        id="signup-practitioner-id"
                        type="text"
                        required
                        placeholder="Enter your Practitioner ID"
                        className="w-full px-5 py-3 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                      />
                    </div>
                  ) : selectedRole === 'parent' ? (
                    <div className="text-left">
                      <label htmlFor="signup-child-id" className="block mb-1 text-sm font-medium text-foreground">
                        Child's Progressor ID (if available)
                      </label>
                      <input
                        id="signup-child-id"
                        type="text"
                        placeholder="Enter Progressor ID (optional)"
                        className="w-full px-5 py-3 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                      />
                    </div>
                  ) : null}

                  {/* Password Field */}
                  <div className="text-left">
                    <label htmlFor="signup-password" className="block mb-1 text-sm font-medium text-foreground">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Create a password"
                        className="w-full px-5 py-3 pr-12 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-lg transition-all cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    className="w-full mt-4 px-6 py-3.5 rounded-[2rem] bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 text-sm cursor-pointer"
                  >
                    Create Account
                  </button>

                  {/* Back to Login */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSignupError('');
                        setShowSignUp(false);
                      }}
                      className="text-xs text-muted-foreground hover:text-primary transition-all cursor-pointer bg-transparent border-0"
                    >
                      Already have an account? Login
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Login Form
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Role Switcher */}
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-foreground">I am a...</label>
                    <div className="relative flex rounded-[2rem] bg-secondary p-1">
                      <div
                        className="absolute top-1 bottom-1 bg-primary rounded-[1.5rem] shadow-md transition-all duration-300 ease-in-out"
                        style={{
                          width: 'calc(33.333% - 0.25rem)',
                          left: selectedRole === 'progressor' ? '0.25rem' : selectedRole === 'parent' ? 'calc(33.333% + 0.08rem)' : 'calc(66.666% - 0.08rem)',
                        }}
                      />
                      {(['progressor', 'parent', 'practitioner'] as Role[]).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          className={`flex-1 py-2 text-sm rounded-[1.5rem] transition-all duration-300 capitalize relative z-10 cursor-pointer ${
                            selectedRole === role
                              ? 'text-primary-foreground font-semibold'
                              : 'text-foreground/60 hover:text-foreground'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Login Form Fields */}
                  {selectedRole === 'practitioner' ? (
                    <div className="text-left">
                      <label htmlFor="practitionerId" className="block mb-1 text-sm font-medium text-foreground">
                        Practitioner ID / Username
                      </label>
                      <input
                        id="practitionerId"
                        type="text"
                        value={practitionerId}
                        onChange={(e) => setPractitionerId(e.target.value)}
                        placeholder="Enter your practitioner ID"
                        className="w-full px-5 py-3 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                      />
                    </div>
                  ) : (
                    <div className="text-left">
                      <label htmlFor="progressorId" className="block mb-1 text-sm font-medium text-foreground">
                        Progressor ID
                      </label>
                      <input
                        id="progressorId"
                        type="text"
                        value={progressorId}
                        onChange={(e) => setProgressorId(e.target.value)}
                        placeholder="Enter your ID"
                        className="w-full px-5 py-3 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                      />
                    </div>
                  )}

                  <div className="text-left">
                    <label htmlFor="password" className="block mb-1 text-sm font-medium text-foreground">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-5 py-3 pr-12 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-lg transition-all cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(true)}
                      className="text-xs text-muted-foreground hover:text-primary mt-1.5 inline-block transition-all cursor-pointer bg-transparent border-0"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 px-6 py-3.5 rounded-[2rem] bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 text-sm cursor-pointer"
                  >
                    Login
                  </button>

                  {/* Sign Up Link */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSignupError('');
                        setShowSignUp(true);
                      }}
                      className="text-xs text-primary hover:underline transition-all cursor-pointer bg-transparent border-0"
                    >
                      New User? Sign Up
                    </button>
                  </div>

                  {/* Quick Links */}
                  <div className="text-xs text-muted-foreground space-y-1.5 pt-3 border-t border-border/40">
                    {selectedRole !== 'practitioner' && (
                      <button
                        type="button"
                        onClick={() => setSelectedRole('practitioner')}
                        className="block w-full text-center hover:text-primary transition-colors cursor-pointer bg-transparent border-0"
                      >
                        Are you a Practitioner? Click here
                      </button>
                    )}
                    {selectedRole !== 'parent' && (
                      <button
                        type="button"
                        onClick={() => setSelectedRole('parent')}
                        className="block w-full text-center hover:text-primary transition-colors cursor-pointer bg-transparent border-0"
                      >
                        Are you a Parent? Click here
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <ForgotPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in">
          <div className="bg-card rounded-[2rem] p-8 max-w-lg w-full shadow-2xl border border-border animate-in zoom-in duration-300 text-left">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacy(false)}
                className="p-2 hover:bg-secondary rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                aria-label="Close Privacy Policy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-sm md:text-base text-foreground/90 overflow-y-auto max-h-[60vh] pr-2">
              <div className="space-y-4">
                <div className="bg-secondary/40 p-5 rounded-2xl border border-border/50">
                  <h3 className="font-semibold text-primary mb-2 flex items-center gap-2 text-base">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs text-primary font-bold">1</span>
                    Data Collection
                  </h3>
                  <p className="text-sm opacity-90 pl-8">
                    Sound Voyage operates as a secure clinical utility. We do not use tracking cookies or external background data-harvesting scripts.
                  </p>
                </div>

                <div className="bg-secondary/40 p-5 rounded-2xl border border-border/50">
                  <h3 className="font-semibold text-primary mb-2 flex items-center gap-2 text-base">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs text-primary font-bold">2</span>
                    Clinical Consent
                  </h3>
                  <p className="text-sm opacity-90 pl-8">
                    All personal information and medical history required for therapy are collected exclusively within the physical clinic via written consent.
                  </p>
                </div>

                <div className="bg-secondary/40 p-5 rounded-2xl border border-border/50">
                  <h3 className="font-semibold text-primary mb-2 flex items-center gap-2 text-base">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs text-primary font-bold">3</span>
                    Account Authentication
                  </h3>
                  <p className="text-sm opacity-90 pl-8">
                    We securely store only your email address, an encrypted password hash, and the practitioner-assigned ID to authenticate your session.
                  </p>
                </div>

                <div className="bg-secondary/40 p-5 rounded-2xl border border-border/50">
                  <h3 className="font-semibold text-primary mb-2 flex items-center gap-2 text-base">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs text-primary font-bold">4</span>
                    Third-Party Sharing
                  </h3>
                  <p className="text-sm opacity-90 pl-8">
                    We do not sell, trade, or transfer any user data to external marketing agencies or unauthorized third parties.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="px-8 py-3 rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
