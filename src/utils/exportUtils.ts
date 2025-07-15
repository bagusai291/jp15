
import { Product, OrderTracking } from '@/types';

export const exportProductsToCSV = (products: Product[]) => {
  const headers = [
    'ID',
    'Nama Produk',
    'Harga (¥)',
    'Stok',
    'Status',
    'Kategori',
    'Deskripsi',
    'Tanggal Input',
    'Varian'
  ];

  const csvData = products.map(product => [
    product.id,
    `"${product.name.replace(/"/g, '""')}"`, // Escape quotes properly
    product.price,
    product.stock,
    product.status === 'active' ? 'Aktif' : product.status === 'inactive' ? 'Tidak Aktif' : 'Stok Habis',
    `"${product.category.replace(/"/g, '""')}"`, // Escape quotes properly
    `"${(product.description || '').replace(/"/g, '""')}"`, // Escape quotes properly
    product.created_at ? new Date(product.created_at).toLocaleDateString('id-ID') : '',
    product.variants && product.variants.length > 0 
      ? `"${product.variants.map(v => `${v.name}: ¥${v.price} (${v.stock} stok)`).join('; ').replace(/"/g, '""')}"` 
      : 'Tidak ada varian'
  ]);

  // Create CSV content with proper formatting
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.join(','))
  ].join('\n');

  // Add BOM for proper Excel encoding
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `data-produk-injapan-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseCSVProducts = (csvText: string) => {
  // Remove BOM if present
  csvText = csvText.replace(/^\uFEFF/, '');
  
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) throw new Error('CSV file harus memiliki header dan minimal 1 baris data');

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
  const requiredHeaders = ['nama produk', 'harga', 'kategori'];
  
  const missingHeaders = requiredHeaders.filter(header => 
    !headers.some(h => h.includes(header.replace(' ', '')))
  );
  
  if (missingHeaders.length > 0) {
    throw new Error(`Header yang diperlukan tidak ditemukan: ${missingHeaders.join(', ')}`);
  }

  const products = [];
  
  for (let i = 1; i < lines.length; i++) {
    // Parse CSV line properly handling quoted fields
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"' && (j === 0 || lines[i][j-1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && (j === lines[i].length - 1 || lines[i][j+1] === ',')) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length < headers.length) continue;
    
    const product: any = {
      name: '',
      price: 0,
      category: '',
      description: '',
      stock: 0,
      status: 'active'
    };

    headers.forEach((header, index) => {
      const value = values[index] ? values[index].replace(/^"|"$/g, '') : '';
      
      if (header.includes('nama')) {
        product.name = value;
      } else if (header.includes('harga')) {
        product.price = parseInt(value.replace(/[^\d]/g, '')) || 0;
      } else if (header.includes('stok')) {
        product.stock = parseInt(value) || 0;
      } else if (header.includes('status')) {
        if (value.toLowerCase().includes('aktif')) {
          product.status = 'active';
        } else if (value.toLowerCase().includes('tidak aktif')) {
          product.status = 'inactive';
        } else if (value.toLowerCase().includes('habis')) {
          product.status = 'out_of_stock';
        } else {
          product.status = value || 'active';
        }
      } else if (header.includes('kategori')) {
        product.category = value;
      } else if (header.includes('deskripsi')) {
        product.description = value;
      }
    });

    if (product.name && product.price && product.category) {
      products.push(product);
    }
  }

  return products;
};

export const exportOrdersToCSV = (orders: OrderTracking[]) => {
  const headers = [
    'ID Pesanan',
    'Nama Pelanggan',
    'Email',
    'Telepon',
    'Total Amount (¥)',
    'Status',
    'Items',
    'Tanggal Pesanan'
  ];

  const csvData = orders.map(order => [
    order.id,
    `"${order.customer_name.replace(/"/g, '""')}"`,
    `"${(order.customer_email || '').replace(/"/g, '""')}"`,
    `"${(order.customer_phone || '').replace(/"/g, '""')}"`,
    order.total_amount,
    order.status === 'pending' ? 'Menunggu' : 
    order.status === 'processing' ? 'Diproses' :
    order.status === 'completed' ? 'Selesai' : 'Dibatalkan',
    `"${order.items.map(item => `${item.quantity}x ${item.name}`).join('; ').replace(/"/g, '""')}"`,
    new Date(order.created_at).toLocaleDateString('id-ID')
  ]);

  // Create CSV content with proper formatting
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.join(','))
  ].join('\n');

  // Add BOM for proper Excel encoding
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `data-pesanan-injapan-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
