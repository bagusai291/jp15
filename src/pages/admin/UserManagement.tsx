
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, User as UserIcon, RefreshCw, UserPlus } from 'lucide-react';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin: string;
  isOnline?: boolean;
}

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'user'>('user');
  
  const db = getFirestore();
  const auth = getAuth();

  // Check current user's role
  useEffect(() => {
    const checkCurrentUserRole = async () => {
      if (user) {
        const adminEmails = ['admin@gmail.com', 'ari4rich@gmail.com', 'newadmin@gmail.com', 'injpn@food.com'];
        if (adminEmails.includes(user.email || '')) {
          setCurrentUserRole('admin');
          // Create/update current user profile in Firestore
          await ensureUserProfile(user.uid, user.email || '', user.displayName || '', 'admin');
        } else {
          setCurrentUserRole('user');
          await ensureUserProfile(user.uid, user.email || '', user.displayName || '', 'user');
        }
      }
    };

    checkCurrentUserRole();
  }, [user]);

  // Ensure user profile exists in Firestore
  const ensureUserProfile = async (uid: string, email: string, displayName: string, role: 'admin' | 'user') => {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        role,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isOnline: true
      }, { merge: true });
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  // Fetch users with real-time updates
  useEffect(() => {
    if (!user || currentUserRole !== 'admin') {
      setLoading(false);
      return;
    }

    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData: UserProfile[] = [];
      snapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        usersData.push(userData);
      });
      
      console.log('Real-time users data:', usersData);
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengguna real-time",
        variant: "destructive"
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, currentUserRole, db]);

  const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'user') => {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Akses Ditolak",
        description: "Hanya admin yang dapat mengubah role pengguna",
        variant: "destructive"
      });
      return;
    }

    if (userId === user?.uid) {
      toast({
        title: "Tidak Diizinkan",
        description: "Anda tidak dapat mengubah role sendiri",
        variant: "destructive"
      });
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Berhasil",
        description: `Role pengguna berhasil diubah menjadi ${newRole}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Gagal mengubah role pengguna",
        variant: "destructive"
      });
    }
  };

  const refreshUsers = () => {
    // The onSnapshot listener will automatically refresh the data
    toast({
      title: "Info",
      description: "Data pengguna diperbarui secara real-time",
      variant: "default"
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'destructive' : 'secondary';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Shield : UserIcon;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEditRoles = currentUserRole === 'admin';

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
              <p className="text-gray-600">Kelola pengguna dan role dengan Firebase Firestore</p>
            </div>
          </div>
          <Button onClick={refreshUsers} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {currentUserRole !== 'admin' && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <Shield className="w-4 h-4 inline mr-2" />
              <strong>Akses Terbatas:</strong> Anda perlu role admin untuk mengakses fitur manajemen pengguna.
            </p>
          </div>
        )}

        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            <UserPlus className="w-4 h-4 inline mr-2" />
            <strong>Real-time Updates:</strong> Data pengguna akan otomatis terupdate ketika ada perubahan. 
            Pengguna baru yang mendaftar akan langsung muncul di daftar ini.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Daftar Pengguna ({users.length})</span>
              {users.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  Real-time
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Memuat data pengguna...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Belum ada pengguna terdaftar</p>
                <p className="text-sm">Pengguna yang mendaftar akan muncul di sini secara otomatis</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama & Email</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Bergabung</TableHead>
                      <TableHead>Login Terakhir</TableHead>
                      <TableHead>Status</TableHead>
                      {canEditRoles && <TableHead>Aksi</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userProfile) => {
                      const RoleIcon = getRoleIcon(userProfile.role);
                      const isCurrentUser = userProfile.uid === user?.uid;
                      
                      return (
                        <TableRow key={userProfile.uid}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <RoleIcon className="w-4 h-4" />
                              <div>
                                <p className="font-medium">
                                  {userProfile.displayName || 'Tidak ada nama'}
                                  {isCurrentUser && (
                                    <span className="text-blue-600 text-xs ml-2">(Anda)</span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">{userProfile.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {userProfile.uid.substring(0, 8)}...
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(userProfile.role)}>
                              {userProfile.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(userProfile.createdAt)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(userProfile.lastLogin)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={userProfile.isOnline ? 'default' : 'secondary'}>
                              {userProfile.isOnline ? 'Online' : 'Offline'}
                            </Badge>
                          </TableCell>
                          {canEditRoles && (
                            <TableCell>
                              {isCurrentUser ? (
                                <span className="text-xs text-gray-500">
                                  Tidak bisa mengubah role sendiri
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRoleUpdate(userProfile.uid, userProfile.role === 'admin' ? 'user' : 'admin')}
                                >
                                  Jadikan {userProfile.role === 'admin' ? 'User' : 'Admin'}
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {!canEditRoles && users.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <Shield className="w-4 h-4 inline mr-2" />
              Anda perlu role admin untuk mengubah role pengguna lain.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
