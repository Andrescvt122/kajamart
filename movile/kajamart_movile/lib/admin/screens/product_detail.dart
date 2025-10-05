import 'package:flutter/material.dart';
import '../models/product.dart';
import '../models/batch.dart';

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({Key? key}) : super(key: key);

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 160,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Color(0xff343b45),
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(color: Color(0xff626762)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final args =
        ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final Product product = args['product'] as Product;
    final Batch batch = args['batch'] as Batch;

    return Scaffold(
      backgroundColor: const Color(0xffe8e5dc),
      appBar: AppBar(
        backgroundColor: const Color(0xffb4debf), // Verde claro
        elevation: 0,
        title: Text(
          'Detalle - ${product.name}',
          style: const TextStyle(
            color: Color(0xff343b45),
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Imagen del producto
            Center(
              child: Container(
                width: 180,
                height: 180,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 6,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                clipBehavior: Clip.antiAlias,
                child: Image.network(
                  product.imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const Icon(
                    Icons.image,
                    size: 80,
                    color: Color(0xff626762),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Tarjeta con info general
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              color: Colors.white,
              elevation: 2,
              margin: const EdgeInsets.only(bottom: 16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _row('Producto ID', product.id),
                    _row('Nombre', product.name),
                    _row('Código de barras', batch.barcode),
                    _row('ICU', '—'),
                  ],
                ),
              ),
            ),

            // Tarjeta con info de precios
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              color: Colors.white,
              elevation: 2,
              margin: const EdgeInsets.only(bottom: 16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _row(
                      'Precio Compra',
                      product.purchasePrice != null
                          ? '\$${product.purchasePrice!.toStringAsFixed(0)}'
                          : '—',
                    ),
                    _row(
                      'Precio Venta',
                      product.salePrice != null
                          ? '\$${product.salePrice!.toStringAsFixed(0)}'
                          : '—',
                    ),
                    _row(
                      'Subida de Venta (%)',
                      product.markupPercent != null
                          ? '${product.markupPercent}%'
                          : '—',
                    ),
                    _row(
                      'IVA',
                      product.ivaPercent != null
                          ? '${product.ivaPercent}%'
                          : '—',
                    ),
                  ],
                ),
              ),
            ),

            // Tarjeta con info de stock
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              color: Colors.white,
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _row(
                      'Fecha de vencimiento',
                      batch.expiryDate.toIso8601String().split('T')[0],
                    ),
                    _row('Max Stock', product.maxStock.toString()),
                    _row('Mini Stock', product.minStock.toString()),
                    _row('Stock total', product.currentStock.toString()),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
