import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../hooks/use-auth.js';
import { authAPI } from '../../../api/auth.api.js';
import { Button } from '../../../components/ui/button.jsx';
import { Input } from '../../../components/ui/input.jsx';
import OtpForm from '../components/OtpForm.jsx';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Build request body - only include defined values
      const requestBody = {
        mode: mode,
      };
      
      if (email) requestBody.email = email;
      if (phone) requestBody.phone = phone;
      if (mode === 'register' && name) requestBody.name = name;
      
      const response = await authAPI.requestOTP(requestBody);
      
      // In development mode, show OTP in console and alert
      if (response.data?.otp) {
        console.log('🔐 OTP Code (Development Mode):', response.data.otp);
        alert(`OTP Code: ${response.data.otp}\n\n(Development mode - Check console for details)`);
      }
      
      setStep('verify');
    } catch (error) {
      console.error('Failed to request OTP:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details?.[0]?.message || 'Failed to send OTP';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setLoading(true);
    
    try {
      // Build request body - only include defined values
      const requestBody = {
        otp,
        mode: mode,
      };
      
      if (email) requestBody.email = email;
      if (phone) requestBody.phone = phone;
      if (mode === 'register' && name) requestBody.name = name;
      
      const response = await authAPI.verifyOTP(requestBody);
      
      console.log('✅ Auth response:', response.data);
      
      // Set auth state
      setAuth(
        response.data.user, 
        response.data.accessToken, 
        response.data.refreshToken
      );
      
      // Wait a bit for state to persist, then navigate
      setTimeout(() => {
        console.log('✅ Navigating to /projects');
        navigate('/projects');
      }, 100);
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details?.[0]?.message || 'Failed to verify OTP';
      alert(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify') {
    return <OtpForm onSubmit={handleVerifyOTP} loading={loading} mode={mode} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 border rounded-lg">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setStep('request');
              setEmail('');
              setPhone('');
              setName('');
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              mode === 'login'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setStep('request');
              setEmail('');
              setPhone('');
              setName('');
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              mode === 'register'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Register
          </button>
        </div>

        <h1 className="text-2xl font-bold text-center">
          {mode === 'login' ? 'Login to TaskBoard' : 'Create Account'}
        </h1>
        
        <form onSubmit={handleRequestOTP} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required={mode === 'register'}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">OR</div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || (!email && !phone) || (mode === 'register' && !name)}>
            {loading ? 'Sending...' : mode === 'login' ? 'Send OTP' : 'Register & Send OTP'}
          </Button>
        </form>
      </div>
    </div>
  );
}
