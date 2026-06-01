import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Target, Route, Shuffle, Eye, EyeOff, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useGameSession } from '../context/GameSessionContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import ForgotPasswordModal from './auth/ForgotPasswordModal';

type Role = 'progressor' | 'parent' | 'practitioner';

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
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
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
    if (selectedRole === 'practitioner') {
      navigate('/practitioner');
      return;
    }

    try {
      let emailToAuth = '';
      let activeProgressorId = '';

      if (progressorId.includes('@')) {
        emailToAuth = progressorId;
        const { data: progressorData } = await supabase
          .from('progressors')
          .select('id')
          .eq('email', progressorId)
          .single();
        if (progressorData) {
          activeProgressorId = progressorData.id;
        }
      } else {
        activeProgressorId = progressorId;
        const { data: progressorData, error: progressorError } = await supabase
          .from('progressors')
          .select('email')
          .eq('id', progressorId)
          .single();

        if (progressorError || !progressorData) {
          toast.error('Progressor ID not found. Please verify with your practitioner.');
          return;
        }
        emailToAuth = progressorData.email;
      }

      // Authenticate via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password: password,
      });

      if (authError || !authData.user) {
        toast.error(authError?.message || 'Login failed. Please check your credentials.');
        return;
      }

      // Fetch dynamic historical progress
      const { data: progressorProfile } = await supabase
        .from('progressors')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (progressorProfile) {
        updateSession(
          activeProgressorId || 'demo',
          progressorProfile.name || '',
          progressorProfile.completed_levels || []
        );
      }

      toast.success('Successfully logged in');
      
      if (selectedRole === 'progressor') {
        navigate(`/progressor/${activeProgressorId || 'demo'}`);
      } else {
        navigate(`/parent/${activeProgressorId || 'demo'}`);
      }
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
      // 1. Verify Progressor ID exists and is unclaimed (bypass for DEV environments if it is email or 'DEV-1234')
      const isDevFallback = import.meta.env.DEV && (signupProgressorId.includes('@') || signupProgressorId === 'DEV-1234');
      
      if (!isDevFallback) {
        const { data: claimData, error: claimError } = await supabase
          .from('progressor_ids')
          .select('*')
          .eq('id', signupProgressorId)
          .eq('is_claimed', false)
          .single();

        if (claimError || !claimData) {
          const errMsg = 'Invalid Progressor ID. Please request one from your practitioner.';
          setSignupError(errMsg);
          toast.error(errMsg);
          return;
        }
      }

      // 2. Sign Up in Supabase Auth
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

      // 3. Map auth.user.id and mark as claimed in progressor_ids
      if (!isDevFallback) {
        const { error: claimUpdateError } = await supabase
          .from('progressor_ids')
          .update({
            is_claimed: true,
            auth_user_id: signUpData.user.id
          })
          .eq('id', signupProgressorId);

        if (claimUpdateError) {
          console.error('Failed to claim ID in progressor_ids:', claimUpdateError.message);
          toast.error('Account created, but failed to link ID registration: ' + claimUpdateError.message);
          return;
        }
      }

      // 4. Map auth.user.id to progressors profile row
      if (isDevFallback) {
        // Upsert the row so we have a progressor entry for local testing logins
        const { error: upsertError } = await supabase
          .from('progressors')
          .upsert({
            id: signupProgressorId,
            auth_user_id: signUpData.user.id,
            email: signupEmail,
            name: signupName,
            completed_levels: []
          });
        if (upsertError) {
          toast.error('Account created, but failed to link profile: ' + upsertError.message);
          return;
        }
      } else {
        const { error: updateError } = await supabase
          .from('progressors')
          .update({
            auth_user_id: signUpData.user.id,
            email: signupEmail,
            name: signupName
          })
          .eq('id', signupProgressorId);

        if (updateError) {
          toast.error('Account created, but failed to link profile: ' + updateError.message);
          return;
        }
      }

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
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Mesh gradient background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,99,71,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,99,71,0.15),transparent_50%)]" />

      {/* Theme toggle */}
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="mb-6 tracking-tight" style={{ fontSize: '3.5rem', lineHeight: '1.1' }}>
            Sound Voyage
          </h1>
          <p className="mb-12 opacity-80 max-w-2xl mx-auto" style={{ fontSize: '1.5rem' }}>
            Strengthen the Bridge between Mind and Voice
          </p>
          <button
            onClick={() => loginRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="px-12 py-5 rounded-[2rem] bg-primary text-primary-foreground shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
            style={{ fontSize: '1.25rem' }}
          >
            Get Started
          </button>
        </div>

        {/* Impact Guides */}
        <div className="max-w-6xl mx-auto mb-16 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {IMPACT_GUIDES.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <div
                  key={guide.title}
                  className="bg-card rounded-3xl p-8 border border-border shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-9 h-9 text-primary" />
                  </div>
                  <h3 className="mb-4">{guide.title}</h3>
                  <p className="text-foreground/80 leading-relaxed">{guide.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Login Card */}
        <div
          ref={loginRef}
          className="max-w-md mx-auto bg-card rounded-[2rem] shadow-2xl p-8 border border-border backdrop-blur-sm"
        >
          {/* Role Switcher */}
          <div className="mb-8">
            <div className="relative flex rounded-[2rem] bg-secondary p-1.5">
              {/* Sliding background pill */}
              <div
                className="absolute top-1.5 bottom-1.5 bg-primary rounded-[1.5rem] shadow-lg transition-all duration-300 ease-in-out"
                style={{
                  width: 'calc(33.333% - 0.375rem)',
                  left: selectedRole === 'progressor' ? '0.375rem' : selectedRole === 'parent' ? 'calc(33.333% + 0.125rem)' : 'calc(66.666% - 0.125rem)',
                }}
              />
              {(['progressor', 'parent', 'practitioner'] as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 px-4 py-3 rounded-[1.5rem] transition-all duration-300 capitalize relative z-10 ${
                    selectedRole === role
                      ? 'text-primary-foreground'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {selectedRole === 'practitioner' ? (
              <div className="text-left">
                <label htmlFor="practitionerId" className="block mb-2 text-foreground">
                  Practitioner ID / Username
                </label>
                <input
                  id="practitionerId"
                  type="text"
                  value={practitionerId}
                  onChange={(e) => setPractitionerId(e.target.value)}
                  placeholder="Enter your practitioner ID"
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            ) : (
              <div className="text-left">
                <label htmlFor="progressorId" className="block mb-2 text-foreground">
                  Progressor ID
                </label>
                <input
                  id="progressorId"
                  type="text"
                  value={progressorId}
                  onChange={(e) => setProgressorId(e.target.value)}
                  placeholder="Enter your ID"
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            )}

            <div className="text-left">
              <label htmlFor="password" className="block mb-2 text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-6 py-4 pr-14 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-lg transition-all"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="text-xs text-muted-foreground hover:text-[#FF6347] mt-2 inline-block transition-all"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 rounded-[2rem] bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              Login
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setSignupError('');
                  setShowSignUp(true);
                }}
                className="text-primary hover:underline transition-all"
              >
                New User? Sign Up
              </button>
            </div>

            {/* Quick Links */}
            <div className="text-sm text-muted-foreground space-y-2 pt-4">
              {selectedRole !== 'practitioner' && (
                <button
                  type="button"
                  onClick={() => setSelectedRole('practitioner')}
                  className="block w-full text-center hover:text-primary transition-colors"
                >
                  Are you a Practitioner? Click here
                </button>
              )}
              {selectedRole !== 'parent' && (
                <button
                  type="button"
                  onClick={() => setSelectedRole('parent')}
                  className="block w-full text-center hover:text-primary transition-colors"
                >
                  Are you a Parent? Click here
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="mt-20 pb-8 text-center">
          <p className="text-sm text-muted-foreground">
            © Samvidh Psych Services
          </p>
        </footer>
      </div>

      {/* Sign-Up Modal */}
      {showSignUp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in">
          <div className="bg-card rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-border animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2>Create Your Account</h2>
              <button
                onClick={() => setShowSignUp(false)}
                className="p-2 hover:bg-secondary rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block mb-2 text-foreground">I am a...</label>
                <div className="relative flex rounded-[2rem] bg-secondary p-1.5">
                  <div
                    className="absolute top-1.5 bottom-1.5 bg-primary rounded-[1.5rem] shadow-lg transition-all duration-300 ease-in-out"
                    style={{
                      width: 'calc(33.333% - 0.375rem)',
                      left: selectedRole === 'progressor' ? '0.375rem' : selectedRole === 'parent' ? 'calc(33.333% + 0.125rem)' : 'calc(66.666% - 0.125rem)',
                    }}
                  />
                  {(['progressor', 'parent', 'practitioner'] as Role[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`flex-1 px-4 py-3 rounded-[1.5rem] transition-all duration-300 capitalize relative z-10 ${
                        selectedRole === role
                          ? 'text-primary-foreground'
                          : 'text-foreground/60 hover:text-foreground'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="signup-name" className="block mb-2 text-foreground">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="signup-email" className="block mb-2 text-foreground">
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              {/* ID Field (conditional) */}
              {selectedRole === 'progressor' ? (
                <div>
                  <label htmlFor="signup-progressor-id" className="block mb-2 text-foreground">
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
                    className={`w-full px-6 py-4 rounded-[1.5rem] bg-input-background border ${
                      signupError ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
                    } text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all`}
                  />
                  {signupError && (
                    <p className="text-red-500 text-xs mt-1 pl-2">{signupError}</p>
                  )}
                </div>
              ) : selectedRole === 'practitioner' ? (
                <div>
                  <label htmlFor="signup-practitioner-id" className="block mb-2 text-foreground">
                    Practitioner ID
                  </label>
                  <input
                    id="signup-practitioner-id"
                    type="text"
                    required
                    placeholder="Enter your Practitioner ID"
                    className="w-full px-6 py-4 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              ) : selectedRole === 'parent' ? (
                <div>
                  <label htmlFor="signup-child-id" className="block mb-2 text-foreground">
                    Child's Progressor ID (if available)
                  </label>
                  <input
                    id="signup-child-id"
                    type="text"
                    placeholder="Enter Progressor ID (optional)"
                    className="w-full px-6 py-4 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              ) : null}

              {/* Password Field */}
              <div>
                <label htmlFor="signup-password" className="block mb-2 text-foreground">
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
                    className="w-full px-6 py-4 pr-14 rounded-[1.5rem] bg-input-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-lg transition-all"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                className="w-full px-8 py-4 rounded-[2rem] bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Create Account
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowSignUp(false)}
                  className="text-sm text-muted-foreground hover:text-primary transition-all"
                >
                  Already have an account? Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ForgotPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
