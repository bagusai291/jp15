import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Get tab and referral code from URL if available
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    const refParam = urlParams.get('ref');
    
    // Set active tab if specified in URL
    if (tabParam === 'signup' || tabParam === 'daftar') {
      document.querySelector('[data-state="inactive"][value="signup"]')?.click();
    }
    
    // Set referral code if present in URL
    if (refParam) {
      setReferralCode(refParam);
      console.log('Referral code found in URL:', refParam);
    }
  }, [location.search]);

  const getFirebaseErrorMessage = (error: any) => {
    const errorCode = error?.code || '';
    
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email atau password yang Anda masukkan salah. Silakan periksa kembali data Anda.';
      
      case 'auth/invalid-email':
        return 'Format email tidak valid. Silakan masukkan alamat email yang benar.';
      
      case 'auth/user-disabled':
        return 'Akun Anda telah dinonaktifkan. Silakan hubungi customer service.';
      
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan login. Silakan coba lagi dalam beberapa menit.';
      
      case 'auth/email-already-in-use':
        return 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun yang sudah ada.';
      
      case 'auth/weak-password':
        return 'Password terlalu lemah. Gunakan minimal 6 karakter dengan kombinasi huruf dan angka.';
      
      default:
        return 'Terjadi kesalahan pada sistem. Silakan coba lagi atau hubungi customer service kami jika masalah berlanjut.';
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        const errorMessage = getFirebaseErrorMessage(error);
        
        toast({
          title: "Login Gagal",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Berhasil",
          description: "Selamat datang! Anda berhasil masuk ke akun Anda.",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Login Gagal",
        description: "Terjadi kesalahan pada sistem. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      if (!fullName.trim()) {
        toast({
          title: "Pendaftaran Gagal",
          description: "Nama lengkap wajib diisi",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!email.trim()) {
        toast({
          title: "Pendaftaran Gagal",
          description: "Email wajib diisi",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Pendaftaran Gagal",
          description: "Password minimal 6 karakter",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Store referral code in localStorage if provided
      if (referralCode) {
        localStorage.setItem('referralCode', referralCode);
        localStorage.setItem('referralTimestamp', Date.now().toString());
        console.log('Stored referral code before signup:', referralCode);
      }

      const { error } = await signUp(email, password, fullName);

      if (error) {
        const errorMessage = getFirebaseErrorMessage(error);
        
        toast({
          title: "Pendaftaran Gagal",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Pendaftaran Berhasil",
          description: "Akun Anda berhasil dibuat! Selamat datang di Injapan Food.",
        });
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
        setReferralCode('');
        // Redirect to home
        navigate('/');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Pendaftaran Gagal",
        description: "Terjadi kesalahan pada sistem. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
            <img 
              src="/logo.png" 
              alt="Injapan Food Logo" 
              className="w-full h-full object-contain bg-white p-2"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Injapan Food</h2>
          <p className="mt-2 text-sm text-gray-600">Makanan Indonesia di Jepang</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Masuk</TabsTrigger>
            <TabsTrigger value="signup">Daftar</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Masuk ke Akun</CardTitle>
                <CardDescription>
                  Masukkan email dan password untuk masuk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Password"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Memproses..." : "Masuk"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Buat Akun Baru</CardTitle>
                <CardDescription>
                  Daftar untuk mulai berbelanja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Nama Lengkap *</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Password (min. 6 karakter)"
                      minLength={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-referral">Kode Referral (Opsional)</Label>
                    <Input
                      id="signup-referral"
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Masukkan kode referral jika ada"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Dapatkan promo spesial dengan menggunakan kode referral
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Memproses..." : "Daftar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthForm;