// lib/data/sample_data.dart
import '../models/product.dart';
import '../models/batch.dart';

class SampleData {
  static List<Product> get sampleProducts => [
    Product(
      id: 'L001',
      name: 'Leche Entera 1L',
      category: 'Lácteos',
      imageUrl: 'https://images.unsplash.com/photo-1585238342022-7a1f2a1f8f7a',
      currentStock: 76,
      minStock: 50,
      maxStock: 500,
      price: 3200.0,
      status: 'Activo',
      batches: [
        Batch(
          idDetalle: 'B-1001',
          barcode: '987654321001',
          expiryDate: DateTime(2024, 12, 1),
          quantity: 20,
          consumedStock: 4,
          price: 3200.0,
        ),
        Batch(
          idDetalle: 'B-1002',
          barcode: '987654321002',
          expiryDate: DateTime(2025, 2, 15),
          quantity: 56,
          consumedStock: 0,
          price: 3200.0,
        ),
      ],
    ),
    Product(
      id: 'C002',
      name: 'Cereal Maíz 500g',
      category: 'Cereales',
      imageUrl: 'https://images.unsplash.com/photo-1604908177542-6f3f9b9f9e2b',
      currentStock: 120,
      minStock: 20,
      maxStock: 300,
      price: 9800.0,
      status: 'Activo',
      purchasePrice: 7000.0,
      salePrice: 9800.0,
      markupPercent: 40.0,
      ivaPercent: 19.0,
      batches: [
        Batch(
          idDetalle: 'B-2001',
          barcode: '123456789012',
          expiryDate: DateTime(2025, 6, 1),
          quantity: 100,
          consumedStock: 10,
          price: 9800.0,
        ),
      ],
    ),
  ];
}
