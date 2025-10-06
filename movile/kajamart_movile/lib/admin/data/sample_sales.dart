// lib/data/sample_sales.dart
import '../models/sale.dart';

class SampleSales {
  static List<Sale> get sampleSales => [
    Sale(
      id: '1023',
      clientName: 'María González',
      total: 125000.0,
      date: DateTime(2023, 12, 15, 14, 30),
      status: SaleStatus.completada,
      paymentMethod: 'Efectivo',
      products: const [
        SaleProduct(
          name: 'Leche Entera',
          quantity: 2,
          unitPrice: 3500.0,
          total: 7000.0,
        ),
        SaleProduct(
          name: 'Pan Integral',
          quantity: 1,
          unitPrice: 4500.0,
          total: 4500.0,
        ),
        SaleProduct(
          name: 'Huevos AA',
          quantity: 1,
          unitPrice: 12000.0,
          total: 12000.0,
        ),
      ],
    ),
    Sale(
      id: '1024',
      clientName: 'Carlos Rodríguez',
      total: 87500.0,
      date: DateTime(2023, 12, 15, 16, 45),
      status: SaleStatus.completada,
      paymentMethod: 'Tarjeta de Crédito',
      observations: 'Cliente pidió factura',
      products: const [
        SaleProduct(
          name: 'Arroz Premium',
          quantity: 1,
          unitPrice: 6500.0,
          total: 6500.0,
        ),
        SaleProduct(
          name: 'Aceite de Oliva',
          quantity: 2,
          unitPrice: 15000.0,
          total: 30000.0,
        ),
        SaleProduct(
          name: 'Tomates',
          quantity: 3,
          unitPrice: 2500.0,
          total: 7500.0,
        ),
      ],
    ),
    Sale(
      id: '1025',
      clientName: 'Ana López',
      total: 45000.0,
      date: DateTime(2023, 12, 14, 10, 15),
      status: SaleStatus.anulada,
      paymentMethod: 'Transferencia',
      observations: 'Cancelada por falta de stock',
      products: const [
        SaleProduct(
          name: 'Queso Fresco',
          quantity: 1,
          unitPrice: 8000.0,
          total: 8000.0,
        ),
        SaleProduct(
          name: 'Yogurt Natural',
          quantity: 6,
          unitPrice: 2000.0,
          total: 12000.0,
        ),
      ],
    ),
    Sale(
      id: '1026',
      clientName: 'Roberto Sánchez',
      total: 156000.0,
      date: DateTime(2023, 12, 14, 18, 20),
      status: SaleStatus.completada,
      paymentMethod: 'Tarjeta Débito',
      products: const [
        SaleProduct(
          name: 'Carne Molida',
          quantity: 2,
          unitPrice: 12000.0,
          total: 24000.0,
        ),
        SaleProduct(
          name: 'Papa Pastusa',
          quantity: 5,
          unitPrice: 2000.0,
          total: 10000.0,
        ),
        SaleProduct(
          name: 'Cebolla Cabezona',
          quantity: 3,
          unitPrice: 3500.0,
          total: 10500.0,
        ),
        SaleProduct(
          name: 'Plátanos',
          quantity: 6,
          unitPrice: 1500.0,
          total: 9000.0,
        ),
      ],
    ),
    Sale(
      id: '1027',
      clientName: 'Lucía Martínez',
      total: 92000.0,
      date: DateTime(2023, 12, 13, 12, 30),
      status: SaleStatus.completada,
      paymentMethod: 'Efectivo',
      observations: 'Entrega a domicilio solicitada',
      products: const [
        SaleProduct(
          name: 'Manzanas',
          quantity: 4,
          unitPrice: 3000.0,
          total: 12000.0,
        ),
        SaleProduct(
          name: 'Naranjas',
          quantity: 8,
          unitPrice: 2500.0,
          total: 20000.0,
        ),
        SaleProduct(
          name: 'Uvas',
          quantity: 2,
          unitPrice: 8000.0,
          total: 16000.0,
        ),
      ],
    ),
    Sale(
      id: '1028',
      clientName: 'Miguel Hernández',
      total: 67000.0,
      date: DateTime(2023, 12, 12, 15, 10),
      status: SaleStatus.completada,
      paymentMethod: 'Tarjeta de Crédito',
      products: const [
        SaleProduct(
          name: 'Detergente Líquido',
          quantity: 2,
          unitPrice: 8500.0,
          total: 17000.0,
        ),
        SaleProduct(
          name: 'Jabón en Barra',
          quantity: 5,
          unitPrice: 2000.0,
          total: 10000.0,
        ),
        SaleProduct(
          name: 'Papel Higiénico',
          quantity: 3,
          unitPrice: 6500.0,
          total: 19500.0,
        ),
      ],
    ),
    Sale(
      id: '1029',
      clientName: 'Sofia Ramírez',
      total: 134000.0,
      date: DateTime(2023, 12, 11, 9, 45),
      status: SaleStatus.anulada,
      paymentMethod: 'Efectivo',
      observations: 'Cliente no llegó a recoger',
      products: const [
        SaleProduct(
          name: 'Pan de Molde',
          quantity: 2,
          unitPrice: 5500.0,
          total: 11000.0,
        ),
        SaleProduct(
          name: 'Mermelada',
          quantity: 3,
          unitPrice: 6500.0,
          total: 19500.0,
        ),
        SaleProduct(
          name: 'Café Instantáneo',
          quantity: 1,
          unitPrice: 12000.0,
          total: 12000.0,
        ),
      ],
    ),
    Sale(
      id: '1030',
      clientName: 'Diego Torres',
      total: 189000.0,
      date: DateTime(2023, 12, 10, 17, 25),
      status: SaleStatus.completada,
      paymentMethod: 'Transferencia',
      products: const [
        SaleProduct(
          name: 'Pollo Entero',
          quantity: 1,
          unitPrice: 15000.0,
          total: 15000.0,
        ),
        SaleProduct(
          name: 'Pescado Tilapia',
          quantity: 2,
          unitPrice: 18000.0,
          total: 36000.0,
        ),
        SaleProduct(
          name: 'Camarones',
          quantity: 1,
          unitPrice: 25000.0,
          total: 25000.0,
        ),
        SaleProduct(
          name: 'Limones',
          quantity: 10,
          unitPrice: 500.0,
          total: 5000.0,
        ),
      ],
    ),
  ];
}
