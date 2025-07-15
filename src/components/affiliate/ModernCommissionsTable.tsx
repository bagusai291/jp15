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
import { Search, DollarSign, RefreshCw, Calendar, ArrowUpDown, FileText } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';
import { AffiliateCommission } from '@/types/affiliate';

const ModernCommissionsTable = () => {
  const { commissions, loading } = useAffiliate();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof AffiliateCommission>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handle sorting
  const handleSort = (field: keyof AffiliateCommission) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter commissions based on search term
  const filteredCommissions = commissions.filter(commission => 
    commission.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commission.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort commissions
  const sortedCommissions = [...filteredCommissions].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle dates
    if (typeof aValue === 'string' && (sortField.includes('At') || sortField === 'createdAt')) {
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

  // Paginate commissions
  const totalPages = Math.ceil(sortedCommissions.length / itemsPerPage);
  const paginatedCommissions = sortedCommissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'paid':
       return <Badge className="bg-green-600">Telah Dibayarkan</Badge>;
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
            <DollarSign className="w-5 h-5 mr-2" />
            {t('affiliate.commissions')}
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
            <DollarSign className="w-5 h-5 mr-2 text-primary" />
            {t('affiliate.commissions')}
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search commissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {commissions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Commissions Yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Commissions will appear when people make purchases through your affiliate link
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
                  <TableHead className="w-[200px]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-gray-100">
                          <span>Order ID</span>
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleSort('orderId')}>
                          Sort by Order ID (A-Z)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('orderId')}>
                          Sort by Order ID (Z-A)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                  <TableHead>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-gray-100">
                          <span>Order Total</span>
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleSort('orderTotal')}>
                          Sort by Highest
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('orderTotal')}>
                          Sort by Lowest
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                  <TableHead>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-gray-100">
                          <span>Commission</span>
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleSort('commissionAmount')}>
                          Sort by Highest
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('commissionAmount')}>
                          Sort by Lowest
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
                          <span>Date</span>
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                          Sort by Newest
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                          Sort by Oldest
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCommissions.map((commission) => (
                  <TableRow key={commission.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">
                            #{commission.orderId.slice(0, 8)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            Ref: {commission.referralId ? commission.referralId.slice(0, 8) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>¥{commission.orderTotal.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-primary">
                      ¥{commission.commissionAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(commission.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1.5" />
                        <span>{formatDate(commission.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-gray-500 hover:text-primary"
                        onClick={() => window.open(`/orders?id=${commission.orderId}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="sr-only">View Order</span>
                      </Button>
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
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCommissions.length)} of {filteredCommissions.length} entries
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

export default ModernCommissionsTable;