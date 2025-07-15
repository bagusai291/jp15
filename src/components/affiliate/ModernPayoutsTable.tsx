import { useState } from 'react';
import { useAffiliate } from '@/hooks/useAffiliate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Search, CreditCard, RefreshCw, Calendar, ArrowUpDown, FileText, Eye } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';
import { AffiliatePayout } from '@/types/affiliate';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ModernPayoutsTable = () => {
  const { payouts, loading } = useAffiliate();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof AffiliatePayout>('requestedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayout, setSelectedPayout] = useState<AffiliatePayout | null>(null);
  const itemsPerPage = 10;

  // Handle sorting
  const handleSort = (field: keyof AffiliatePayout) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter payouts based on search term
  const filteredPayouts = payouts.filter(payout => 
    payout.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payout.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort payouts
  const sortedPayouts = [...filteredPayouts].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle dates
    if (typeof aValue === 'string' && (sortField.includes('At') || sortField === 'requestedAt')) {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue as string).getTime() : 0;
    }
    
    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  // Paginate payouts
  const totalPages = Math.ceil(sortedPayouts.length / itemsPerPage);
  const paginatedPayouts = sortedPayouts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
     case 'paid':
       return <Badge className="bg-green-600">Telah Dibayarkan</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            {t('affiliate.payouts')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/10 hover:shadow-md transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center text-xl">
            <CreditCard className="w-5 h-5 mr-2 text-primary" />
            {t('affiliate.payouts')}
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search payouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {payouts.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Payouts Yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Your payout history will appear here once you request a payout
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-gray-100">
                          <span>Amount</span>
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleSort('amount')}>
                          Sort by Highest
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('amount')}>
                          Sort by Lowest
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                  <TableHead>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-gray-100">
                          <span>Method</span>
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleSort('method')}>
                          Sort by Method (A-Z)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('method')}>
                          Sort by Method (Z-A)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                  <TableHead>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-gray-100">
                          <span>Status</span>
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleSort('status')}>
                          Sort by Status (A-Z)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('status')}>
                          Sort by Status (Z-A)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                  <TableHead>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-gray-100">
                          <span>Requested</span>
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleSort('requestedAt')}>
                          Sort by Newest
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('requestedAt')}>
                          Sort by Oldest
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                  <TableHead>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-gray-100">
                          <span>Completed</span>
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleSort('completedAt')}>
                          Sort by Newest
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('completedAt')}>
                          Sort by Oldest
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayouts.map((payout) => (
                  <TableRow key={payout.id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-primary">
                      ¥{payout.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{payout.method}</TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1.5" />
                        <span>{formatDate(payout.requestedAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payout.completedAt ? (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-1.5" />
                         <span>{payout.status === 'paid' ? formatDate(payout.paidAt) : formatDate(payout.completedAt)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-gray-500 hover:text-primary"
                            onClick={() => setSelectedPayout(payout)}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Payout Details</DialogTitle>
                          </DialogHeader>
                          {selectedPayout && (
                            <div className="space-y-4 py-4">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="font-medium text-gray-700">Payout Summary</h3>
                                  {getStatusBadge(selectedPayout.status)}
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-semibold text-primary">¥{selectedPayout.amount.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Method:</span>
                                    <span>{selectedPayout.method}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Requested:</span>
                                    <span>{formatDate(selectedPayout.requestedAt)}</span>
                                  </div>
                                  {selectedPayout.processedAt && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Processed:</span>
                                      <span>{formatDate(selectedPayout.processedAt)}</span>
                                    </div>
                                  )}
                                  {selectedPayout.completedAt && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Completed:</span>
                                      <span>{formatDate(selectedPayout.completedAt)}</span>
                                    </div>
                                  )}
                                 {selectedPayout.paidAt && (
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Dibayarkan:</span>
                                     <span>{formatDate(selectedPayout.paidAt)}</span>
                                   </div>
                                 )}
                                </div>
                              </div>
                              
                              {selectedPayout.bankInfo && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h3 className="font-medium text-gray-700 mb-3">Bank Information</h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Bank:</span>
                                      <span>{selectedPayout.bankInfo.bankName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Account Number:</span>
                                      <span>{selectedPayout.bankInfo.accountNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Account Name:</span>
                                      <span>{selectedPayout.bankInfo.accountName}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {selectedPayout.notes && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h3 className="font-medium text-gray-700 mb-2">Notes</h3>
                                  <p className="text-gray-600">{selectedPayout.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayouts.length)} of {filteredPayouts.length} entries
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ModernPayoutsTable;