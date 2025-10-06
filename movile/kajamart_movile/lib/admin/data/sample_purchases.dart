// lib/data/sample_purchases.dart
import '../models/purchase.dart';

class SamplePurchases {
  static List<Purchase> get samplePurchases => [
    Purchase(
      id: 'C001',
      providerName: 'Distribuidora ABC S.A.S',
      providerNit: '900.123.456-7',
      total: 2450000.0,
      date: DateTime(2023, 12, 15, 9, 30),
      status: PurchaseStatus.completada,
      taxes: 450000.0,
      observations: 'Entrega completa y en buen estado',
      products: const [
        PurchaseProduct(
          name: 'Leche Entera',
          quantity: 50,
          unitCost: 3200.0,
          subtotal: 160000.0,
        ),
        PurchaseProduct(
          name: 'Pan Integral',
          quantity: 30,
          unitCost: 4200.0,
          subtotal: 126000.0,
        ),
        PurchaseProduct(
          name: 'Huevos AA',
          quantity: 20,
          unitCost: 11500.0,
          subtotal: 230000.0,
        ),
      ],
    ),
    Purchase(
      id: 'C002',
      providerName: 'Frutas y Verduras El Campo',
      providerNit: '800.987.654-3',
      total: 1875000.0,
      date: DateTime(2023, 12, 14, 14, 15),
      status: PurchaseStatus.completada,
      taxes: 345000.0,
      observations: 'Pendiente de verificación de calidad',
      products: const [
        PurchaseProduct(
          name: 'Manzanas',
          quantity: 100,
          unitCost: 2800.0,
          subtotal: 280000.0,
        ),
        PurchaseProduct(
          name: 'Naranjas',
          quantity: 80,
          unitCost: 2200.0,
          subtotal: 176000.0,
        ),
        PurchaseProduct(
          name: 'Plátanos',
          quantity: 60,
          unitCost: 1800.0,
          subtotal: 108000.0,
        ),
      ],
    ),
    Purchase(
      id: 'C003',
      providerName: 'Carnes Premium Ltda',
      providerNit: '901.234.567-8',
      total: 3200000.0,
      date: DateTime(2023, 12, 13, 11, 45),
      status: PurchaseStatus.completada,
      taxes: 590000.0,
      observations: 'Refrigeración adecuada durante transporte',
      products: const [
        PurchaseProduct(
          name: 'Carne Molida',
          quantity: 40,
          unitCost: 11500.0,
          subtotal: 460000.0,
        ),
        PurchaseProduct(
          name: 'Pollo Entero',
          quantity: 25,
          unitCost: 14500.0,
          subtotal: 362500.0,
        ),
        PurchaseProduct(
          name: 'Pescado Tilapia',
          quantity: 30,
          unitCost: 17500.0,
          subtotal: 525000.0,
        ),
      ],
    ),
    Purchase(
      id: 'C004',
      providerName: 'Productos de Aseo S.A',
      providerNit: '805.678.901-2',
      total: 1250000.0,
      date: DateTime(2023, 12, 12, 16, 20),
      status: PurchaseStatus.anulada,
      taxes: 230000.0,
      observations: 'Cancelada por incumplimiento en fechas de entrega',
      products: const [
        PurchaseProduct(
          name: 'Detergente Líquido',
          quantity: 20,
          unitCost: 8200.0,
          subtotal: 164000.0,
        ),
        PurchaseProduct(
          name: 'Jabón en Barra',
          quantity: 50,
          unitCost: 1900.0,
          subtotal: 95000.0,
        ),
        PurchaseProduct(
          name: 'Papel Higiénico',
          quantity: 40,
          unitCost: 6200.0,
          subtotal: 248000.0,
        ),
      ],
    ),
    Purchase(
      id: 'C005',
      providerName: 'Distribuidora ABC S.A.S',
      providerNit: '900.123.456-7',
      total: 980000.0,
      date: DateTime(2023, 12, 11, 10, 30),
      status: PurchaseStatus.completada,
      taxes: 180000.0,
      observations: 'Revisión de facturas pendiente',
      products: const [
        PurchaseProduct(
          name: 'Arroz Premium',
          quantity: 35,
          unitCost: 6200.0,
          subtotal: 217000.0,
        ),
        PurchaseProduct(
          name: 'Aceite de Oliva',
          quantity: 15,
          unitCost: 14500.0,
          subtotal: 217500.0,
        ),
        PurchaseProduct(
          name: 'Tomates',
          quantity: 45,
          unitCost: 2400.0,
          subtotal: 108000.0,
        ),
      ],
    ),
    Purchase(
      id: 'C006',
      providerName: 'Frutas y Verduras El Campo',
      providerNit: '800.987.654-3',
      total: 1650000.0,
      date: DateTime(2023, 12, 10, 8, 45),
      status: PurchaseStatus.completada,
      taxes: 304000.0,
      observations: 'Productos frescos y de calidad excelente',
      products: const [
        PurchaseProduct(
          name: 'Papa Pastusa',
          quantity: 80,
          unitCost: 1900.0,
          subtotal: 152000.0,
        ),
        PurchaseProduct(
          name: 'Cebolla Cabezona',
          quantity: 60,
          unitCost: 3200.0,
          subtotal: 192000.0,
        ),
        PurchaseProduct(
          name: 'Zanahoria',
          quantity: 40,
          unitCost: 2800.0,
          subtotal: 112000.0,
        ),
      ],
    ),
  ];
}
